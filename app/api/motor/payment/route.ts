import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, isSameOriginRequest } from "@/lib/auth";
import { getDb, sql } from "@/lib/db";
import { sendPolicyEmail } from "@/lib/email";
import { AttachmentError, POLICY_DOCUMENTS_DIR, POLICY_MODULE, UPLOAD_FAILED_MESSAGE, policyFolderName, storeDocuments } from "@/lib/attachments";
import { buildPolicyDocuments, type PolicyAttachment, type PolicyDocumentData } from "@/lib/policy-documents";

type Row = Record<string, unknown>;
const asText = (value: unknown, max = 200) => value instanceof Date ? value.toISOString().slice(0, 10) : value == null ? "" : String(value).trim().slice(0, max);
const asAmount = (value: unknown) => { const n = Number(String(value ?? "").replace(/,/g, "")); return Number.isFinite(n) ? n : 0; };
// First non-empty value among the given column names (installations use different column names).
const pick = (row: Row | undefined, ...names: string[]) => {
  for (const name of names) { const value = row?.[name]; if (value !== null && value !== undefined && String(value).trim() !== "") return value; }
  return undefined;
};

async function loadPolicyRecords(pool: Awaited<ReturnType<typeof getDb>>, policyNo: string, clientCode: string) {
  const columns = await pool.request().query("SELECT name FROM sys.columns WHERE object_id=OBJECT_ID('dbo.MotorMaster')");
  const names = new Set(columns.recordset.map((r: { name: string }) => r.name));
  const policyColumn = ["PolicyNo", "PolicyNumber"].find((name) => names.has(name));
  const policy: Row | undefined = policyColumn
    ? (await pool.request().input("policyNo", sql.VarChar(100), policyNo).query(`SELECT TOP (1) * FROM dbo.MotorMaster WHERE [${policyColumn}] = @policyNo`)).recordset[0]
    : undefined;
  const code = asText(pick(policy, "ClientCode", "Client")) || clientCode;
  let client: Row | undefined;
  if (code) {
    try { client = (await pool.request().input("code", sql.VarChar(50), code).query("SELECT TOP (1) * FROM dbo.Client WHERE Code = @code")).recordset[0]; }
    catch (error) { console.warn("Policy documents: client lookup failed", error); }
  }
  let certificateCode = "";
  const vehicleClass = asText(pick(policy, "Class", "VehicleClass"));
  if (vehicleClass) {
    try { certificateCode = asText((await pool.request().input("class", sql.VarChar(100), vehicleClass).query("SELECT TOP (1) CertificateCode FROM dbo.VehicleType WHERE Name = @class")).recordset[0]?.CertificateCode); }
    catch (error) { console.warn("Policy documents: certificate code lookup failed", error); }
  }
  return { policy, client, certificateCode, clientCode: code };
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const clientCode = typeof body?.clientCode === "string" ? body.clientCode.trim() : "";
  const policyNo = typeof body?.policyNo === "string" ? body.policyNo.trim() : "";
  const method = typeof body?.method === "string" ? body.method : "card";
  const amount = Number(body?.amount || 0);
  const title = typeof body?.title === "string" ? body.title : "";
  const firstName = typeof body?.firstName === "string" ? body.firstName : "";
  const surname = typeof body?.surname === "string" ? body.surname : "";
  const email = typeof body?.email === "string" ? body.email : "";
  if (!amount || !["card", "bank"].includes(method)) return NextResponse.json({ error: "Payment details are incomplete." }, { status: 400 });
  const invoiceClientCode = clientCode || "WEB";
  try {
    const pool = await getDb();
    const columns = await pool.request().query("SELECT name, system_type_id FROM sys.columns WHERE object_id=OBJECT_ID('dbo.Invoice')");
    if (!columns.recordset.length) throw new Error("Invoice table is unavailable.");
    const metadata = new Map(columns.recordset.map((r: { name: string; system_type_id: number }) => [r.name, r.system_type_id]));
    const available = new Set(metadata.keys());
    const invoiceNo = Date.now() % 2000000000;
    const pairs: [string, unknown][] = [["InvNo", invoiceNo], ["ClientCode", invoiceClientCode], ["PolicyNo", policyNo || null], ["Amount", amount], ["PaymentMethod", method], ["Status", "Paid"], ["Idate", new Date()], ["Iuser", "motor-insurance-web"]];
    const numericTypes = new Set([48, 52, 56, 59, 60, 62, 106, 108, 127]);
    const selected = pairs.filter(([name, value]) => {
      if (!available.has(name)) return false;
      const typeId = metadata.get(name);
      return !numericTypes.has(typeId || 0) || value === null || typeof value === "number";
    });
    if (!selected.length) throw new Error("Invoice table has no compatible payment columns.");
    const req = pool.request();
    const names = selected.map(([name], i) => { req.input(`v${i}`, selected[i][1]); return `[${name}]`; });
    await req.query(`INSERT INTO dbo.Invoice (${names.join(",")}) VALUES (${selected.map((_, i) => `@v${i}`).join(",")})`);

    // Email the policy documents (Certificate, Debit Note, Schedule, Vignette) to the client.
    let emailSent = false;
    let emailMessage = "";
    let storageMessage = "";
    if (policyNo) {
      try {
        const docs = (body?.documents && typeof body.documents === "object" ? body.documents : {}) as Row;
        const { policy, client, certificateCode, clientCode: recordClientCode } = await loadPolicyRecords(pool, policyNo, clientCode);
        const policyOwner = asText(pick(policy, "Iuser"));
        if (!policy) {
          emailMessage = "The policy documents were not emailed because the saved policy could not be found.";
        } else if (policyOwner && policyOwner.startsWith("web:") && policyOwner !== `web:${userId}`) {
          emailMessage = "The policy documents were not emailed because this policy was created from another account.";
        } else {
          // Saved records take priority; the form values fill fields the database does not store.
          const fromPolicy = (names: string[], docKey: string) => pick(policy, ...names) ?? docs[docKey];
          const holderTitle = asText(pick(client, "Title")) || title;
          const holderName = [holderTitle, asText(pick(client, "Name")) || firstName, asText(pick(client, "Surname")) || surname].filter(Boolean).join(" ").replace(/\s+/g, " ").toUpperCase();
          const recipient = asText(pick(client, "EMail", "Email")) || email;
          const data: PolicyDocumentData = {
            policyNo,
            certificateNo: asText(pick(policy, "CertificateNo")),
            certificateCode,
            invoiceNo: String(invoiceNo),
            clientCode: recordClientCode || invoiceClientCode,
            holderName,
            address: asText(pick(client, "Address") ?? docs.address, 300),
            city: asText(pick(client, "City") ?? docs.city),
            occupation: asText(pick(client, "Occupation") ?? docs.occupation),
            cover: asText(fromPolicy(["CoverRequired", "Cover"], "coverRequired")),
            vehicleStatus: asText(fromPolicy(["Status", "VehicleStatus"], "vehicleStatus")),
            vehicleType: asText(fromPolicy(["Type", "VehicleType"], "vehicleType")),
            vehicleClass: asText(fromPolicy(["Class", "VehicleClass"], "vehicleClass")),
            vehicleNo: asText(fromPolicy(["VehicleNo", "RegNo", "RegistrationNo"], "vehicleNo")),
            make: asText(fromPolicy(["Make"], "make")),
            model: asText(fromPolicy(["Model"], "model")),
            engineNo: asText(fromPolicy(["EngineNo", "EngNo"], "engineNo")),
            chassisNo: asText(fromPolicy(["ChassisNo"], "chassisNo")),
            seating: asText(fromPolicy(["Seating", "NoofPass"], "seating")),
            manufactureDate: asText(docs.manufactureDate),
            issueDate: asText(fromPolicy(["IssDate", "IssueDate"], "issueDate")),
            fromDate: asText(fromPolicy(["FromDate", "StartDate"], "fromDate")),
            toDate: asText(fromPolicy(["ToDate", "EndDate", "ExpiryDate"], "toDate")),
            issuedAt: new Date(),
            sumInsured: asAmount(fromPolicy(["SumInsured"], "sumInsured")),
            compulsoryExcess: asAmount(fromPolicy(["CompExcess", "CompulsoryExcess"], "compulsoryExcess")),
            additionalExcess: asAmount(fromPolicy(["AddExcess", "AdditionalExcess"], "additionalExcess")),
            youngDriverExcess: asAmount(fromPolicy(["YDExcess", "YoungDriverExcess"], "youngDriverExcess")),
            totalLossExcess: asAmount(fromPolicy(["Tlexcess", "TotalLossExcess"], "totalLossExcess")),
            tppdExcess: asAmount(pick(policy, "TPPDExcess", "TPPDEx")),
            fireExcess: asAmount(fromPolicy(["TPFExcess"], "tpfExcess")),
            voluntaryExcess: asAmount(pick(policy, "VolExcess", "VoluntaryExcess")),
            premium: asAmount(fromPolicy(["Premium", "BasicPremium"], "premium")),
            documentCharge: asAmount(docs.documentCharge),
            towingCharge: 0,
            levy: asAmount(docs.levy),
            hitAndRun: asAmount(docs.hitAndRun),
            total: asAmount(fromPolicy(["InvAmount", "InvoiceAmount"], "invoiceAmount")) || amount,
          };
          let attachments: PolicyAttachment[] = [];
          try {
            attachments = await buildPolicyDocuments(data);
          } catch (error) {
            console.error("Policy documents could not be generated", error);
          }
          // Store the generated documents in the policy folder (created when missing) and record them in TempAttachments.
          if (attachments.length) {
            try {
              const result = await storeDocuments({
                root: POLICY_DOCUMENTS_DIR,
                folderName: policyFolderName(policyNo),
                docNo: policyNo,
                module: POLICY_MODULE,
                user: `web:${userId}`,
                documents: attachments.map((file) => ({ docType: file.docType || "Policy Document", originalName: `${data.vehicleNo || "Policy"}.pdf`, content: file.content })),
              });
              storageMessage = `Policy documents stored on the server (folder ${policyFolderName(policyNo)}${result.folderCreated ? ", created" : ""}).`;
            } catch (error) {
              console.error("Policy documents could not be stored", error);
              storageMessage = error instanceof AttachmentError ? error.message : UPLOAD_FAILED_MESSAGE;
            }
          }
          if (!recipient) {
            emailMessage = "The policy documents were not emailed because the client has no e-mail address.";
          } else if (!attachments.length) {
            emailMessage = "The policy documents could not be generated, so no email was sent.";
          } else {
            const nameParts = holderName.split(" ");
            const emailResult = await sendPolicyEmail(
              { title: holderTitle, firstName: nameParts.slice(holderTitle ? 1 : 0, holderTitle ? 2 : 1).join(" "), surname: nameParts.slice(holderTitle ? 2 : 1).join(" "), policyNo, clientCode: data.clientCode, email: recipient },
              attachments,
            );
            emailSent = emailResult.success;
            emailMessage = emailResult.success
              ? `Policy documents (Certificate, Debit Note, Schedule, Vignette) were emailed to ${recipient}.`
              : `The policy documents could not be emailed (${emailResult.error || "email service error"}).`;
            if (!emailResult.success) console.warn("Policy email failed to send:", emailResult.error);
          }
        }
      } catch (error) {
        console.error("Policy email failed", error);
        emailMessage = "The policy documents could not be emailed.";
      }
    }

    // Validate clientCode after email is generated
    if (!clientCode) {
      return NextResponse.json({
        error: "Search and select a client in KYC.",
        paymentProcessed: true,
        invoiceNo,
        emailSent,
        emailMessage,
        storageMessage,
      }, { status: 400 });
    }

    return NextResponse.json({ message: "Payment submitted successfully.", clientCode, invoiceNo, emailSent, emailMessage, storageMessage }, { status: 201 });
  } catch (error) {
    console.error("Payment save failed", error);
    return NextResponse.json({ error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "Payment could not be saved." }, { status: 500 });
  }
}