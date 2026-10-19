import "server-only";

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getDb, sql } from "@/lib/db";

// Document storage locations (ported from ButUpload_Click). Override in .env.local, e.g.
// DOCUMENTS_ROOT=\\GIMSSVR\DocumentsAttached  or a local folder for development.
const DOCUMENTS_ROOT = process.env.DOCUMENTS_ROOT?.trim() || String.raw`\\GIMSSVR\DocumentsAttached`;
export const POLICY_DOCUMENTS_DIR = process.env.DOCUMENTS_POLICY_DIR?.trim() || path.win32.join(DOCUMENTS_ROOT, "UWMotor");
export const KYC_DOCUMENTS_DIR = process.env.DOCUMENTS_KYC_DIR?.trim() || path.win32.join(DOCUMENTS_ROOT, "KYC");

export const POLICY_MODULE = "Motor-Underwrite";
export const KYC_MODULE = "KYC";
export const UPLOAD_FAILED_MESSAGE = "Document could not be uploaded. Please inform HO Or send the document through E-MaiL and request to upload by HO.";
export const ALLOWED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]);
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export type IncomingDocument = { docType: string; originalName: string; content: Uint8Array };
export type StoredDocument = { fileName: string; fullPath: string };
// recorded is false when no attachment table exists: the files are saved but their paths are not stored.
export type StoreResult = { folder: string; folderCreated: boolean; stored: StoredDocument[]; recorded: boolean; table: string };

export class AttachmentError extends Error {}

// Policy numbers contain slashes, which are not allowed in folder names: 31/922645 -> 31-922645.
export function policyFolderName(policyNo: string): string {
  const folder = policyNo.trim().replace(/\//g, "-");
  if (folder.length < 18) throw new AttachmentError("Could not validate the Policy number!");
  if (!/^[A-Za-z0-9-]+$/.test(folder)) throw new AttachmentError("Could not validate the Policy number!");
  return folder;
}

// KYC documents live in a folder named after the insured (client) code.
export function kycFolderName(clientCode: string): string {
  const folder = clientCode.trim();
  if (!/^[A-Za-z0-9_-]{1,30}$/.test(folder) || folder.toUpperCase() === "WEB") throw new AttachmentError("Could not validate the client (insured) code for the KYC documents.");
  return folder;
}

// Characters Windows does not allow in file names.
const fileSafe = (value: string) => value.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").replace(/\s+/g, " ").trim();

// DateAndTime.Now.ToString("ddMMMyyyyhhmmss") with the en-GB culture (hh = 12-hour clock).
function vbTimestamp(date: Date): string {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Indian/Mauritius", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.day}${String(parts.month).slice(0, 3)}${parts.year}${parts.hour}${parts.minute}${parts.second}`;
}
// "dd-MMM-yyyy HH:mm:ss" as written to TempAttachments.Idate by the VB code.
function vbDateTime(date: Date): string {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Indian/Mauritius", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.day}-${String(parts.month).slice(0, 3)}-${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
}

// Same naming rule as the VB code: DocType + " " + name up to the first "." + timestamp, plus the extension.
export function documentFileName(docType: string, originalName: string, now: Date) {
  const baseName = path.basename(originalName.replace(/\\/g, "/"));
  const extension = path.extname(baseName).toLowerCase();
  if (!extension) throw new AttachmentError("Document is not valid, NO EXTENSION. Please verify.");
  const beforeFirstDot = baseName.split(".")[0];
  const fileName = fileSafe(`${docType} ${beforeFirstDot}${vbTimestamp(now)}`).slice(0, 150);
  return { fileName, extension };
}

async function folderExists(folder: string) {
  try { await access(folder); return true; } catch { return false; }
}

type ColumnInfo = { name: string; max_length: number; type_name: string; is_identity: boolean; is_computed: boolean };

// Attachment register: dbo.temp_attachment (columns matched by name), or the VB table dbo.TempAttachments
// (9 columns, positional insert) when only that one exists.
const ATTACHMENT_TABLES = ["temp_attachment", "TempAttachments"];
async function attachmentTable(pool: Awaited<ReturnType<typeof getDb>>): Promise<{ name: string; columns: ColumnInfo[] } | null> {
  for (const name of ATTACHMENT_TABLES) {
    const columns = (await pool.request().input("table", sql.NVarChar(128), `dbo.${name}`).query(
      "SELECT c.name, c.max_length, t.name AS type_name, c.is_identity, c.is_computed FROM sys.columns c JOIN sys.types t ON t.user_type_id = c.user_type_id WHERE c.object_id = OBJECT_ID(@table, 'U') ORDER BY c.column_id",
    )).recordset as ColumnInfo[];
    if (columns.length) return { name, columns };
  }
  return null;
}
// Trim text values to the column sizes so an insert never fails on a long name.
const fit = (value: unknown, column: ColumnInfo) => {
  if (typeof value !== "string" || column.max_length <= 0) return value;
  const limit = /^n(var)?char$/i.test(column.type_name) ? column.max_length / 2 : column.max_length;
  return value.slice(0, limit);
};

/**
 * Stores documents in <root>\<folderName> (created when it does not exist yet) and records the path of
 * each one in the attachment table, inside one transaction (rolled back if any insert fails).
 */
export async function storeDocuments(options: { root: string; folderName: string; docNo: string; module: string; user: string; documents: IncomingDocument[] }): Promise<StoreResult> {
  const now = new Date();
  // Validate every document before anything is written.
  const prepared = options.documents.map((document) => {
    if (!document.docType.trim()) throw new AttachmentError("Select the Document Type!");
    const { fileName, extension } = documentFileName(document.docType.trim(), document.originalName, now);
    return { ...document, fileName, extension };
  });

  const folder = path.win32.join(options.root, options.folderName);
  const existed = await folderExists(folder);
  if (!existed) await mkdir(folder, { recursive: true });

  const pool = await getDb();
  const table = await attachmentTable(pool);
  const stored: StoredDocument[] = [];
  if (!table) {
    // No register table yet: keep the files in the policy folder and report that the paths were not recorded.
    for (const document of prepared) {
      const fullPath = path.win32.join(folder, `${document.fileName}${document.extension}`);
      await writeFile(fullPath, document.content);
      stored.push({ fileName: `${document.fileName}${document.extension}`, fullPath });
    }
    return { folder, folderCreated: !existed, stored, recorded: false, table: "" };
  }
  const byName = new Map(table.columns.map((column) => [column.name.toLowerCase(), column]));
  const legacy = table.name === "TempAttachments";
  if (legacy && table.columns.length !== 9) throw new Error(`dbo.TempAttachments has ${table.columns.length} columns; the upload expects the 9 columns used by the VB code.`);
  if (!legacy && (!byName.has("docno") || !byName.has("fullpath"))) throw new Error(`dbo.${table.name} needs DocNo and FullPath columns.`);

  const transaction = new sql.Transaction(pool);
  await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);
  try {
    for (const document of prepared) {
      const fullPath = path.win32.join(folder, `${document.fileName}${document.extension}`);
      await writeFile(fullPath, document.content);
      const extension = document.extension.replace(".", "");
      if (legacy) {
        await new sql.Request(transaction)
          .input("docNo", sql.NVarChar(100), options.docNo)
          .input("fileName", sql.NVarChar(200), document.fileName)
          .input("extension", sql.NVarChar(20), `.${extension}`)
          .query("DELETE FROM dbo.TempAttachments WHERE DocNo = @docNo AND FileName = @fileName AND Extension = @extension");
        const values = [options.docNo, fullPath, document.fileName, extension, vbDateTime(now), options.user, options.module, document.fileName, document.fileName];
        const request = new sql.Request(transaction);
        values.forEach((value, index) => request.input(`v${index}`, fit(value, table.columns[index])));
        await request.query(`INSERT INTO dbo.TempAttachments VALUES (${values.map((_, index) => `@v${index}`).join(", ")})`);
      } else {
        const values: Record<string, unknown> = {
          docno: options.docNo, fullpath: fullPath, filename: `${document.fileName}${document.extension}`, extension,
          doctype: document.docType, module: options.module, iuser: options.user, idate: now,
        };
        const request = new sql.Request(transaction);
        const names: string[] = [];
        Object.entries(values).forEach(([key, value]) => {
          const column = byName.get(key);
          if (!column || column.is_identity || column.is_computed) return;
          request.input(`p${names.length}`, /date/i.test(column.type_name) ? value : fit(typeof value === "string" ? value : value instanceof Date ? vbDateTime(value) : value, column));
          names.push(`[${column.name}]`);
        });
        await request.query(`INSERT INTO dbo.[${table.name}] (${names.join(", ")}) VALUES (${names.map((_, index) => `@p${index}`).join(", ")})`);
      }
      stored.push({ fileName: `${document.fileName}${document.extension}`, fullPath });
    }
    await transaction.commit();
  } catch (error) {
    try { await transaction.rollback(); } catch { /* already closed */ }
    throw error;
  }
  return { folder, folderCreated: !existed, stored, recorded: true, table: table.name };
}

// GetDocList: files recorded for a document number (policy number), oldest first.
export async function listDocuments(docNo: string): Promise<StoredDocument[]> {
  const pool = await getDb();
  const table = await attachmentTable(pool);
  if (!table) return [];
  const result = await pool.request().input("docNo", sql.NVarChar(100), docNo).query(`SELECT * FROM dbo.[${table.name}] WHERE DocNo = @docNo`);
  return result.recordset.map((row: Record<string, unknown>) => ({ fileName: String(row.FileName ?? ""), fullPath: String(row.FullPath ?? "") }));
}

// The policy must exist and, when it was created online, belong to the signed-in user.
export async function findOwnedPolicy(policyNo: string, userId: string): Promise<{ clientCode: string } | null> {
  const pool = await getDb();
  const names = new Set((await pool.request().query("SELECT name FROM sys.columns WHERE object_id=OBJECT_ID('dbo.MotorMaster')")).recordset.map((r: { name: string }) => r.name));
  const policyColumn = ["PolicyNo", "PolicyNumber"].find((name) => names.has(name));
  if (!policyColumn) return null;
  const row = (await pool.request().input("policyNo", sql.VarChar(100), policyNo).query(`SELECT TOP (1) * FROM dbo.MotorMaster WHERE [${policyColumn}] = @policyNo`)).recordset[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  const owner = String(row.Iuser ?? "");
  if (owner.startsWith("web:") && owner !== `web:${userId}`) return null;
  return { clientCode: String(row.ClientCode ?? row.Client ?? "").trim() };
}
