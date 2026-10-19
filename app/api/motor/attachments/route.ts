import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import {
  ALLOWED_EXTENSIONS, AttachmentError, KYC_DOCUMENTS_DIR, KYC_MODULE, MAX_FILE_BYTES, POLICY_DOCUMENTS_DIR, POLICY_MODULE, UPLOAD_FAILED_MESSAGE,
  findOwnedPolicy, kycFolderName, listDocuments, policyFolderName, storeDocuments, type IncomingDocument,
} from "@/lib/attachments";
import { getCurrentUserId, isSameOriginRequest } from "@/lib/auth";

const MAX_FILES = 20;

// GetDocList for a policy (and the KYC documents of its client).
export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const policyNo = request.nextUrl.searchParams.get("policyNo")?.trim() || "";
  if (!policyNo) return NextResponse.json({ error: "Policy number is required." }, { status: 400 });
  try {
    const policy = await findOwnedPolicy(policyNo, userId);
    if (!policy) return NextResponse.json({ error: "Policy not found." }, { status: 404 });
    const policyDocuments = await listDocuments(policyNo);
    const kycDocuments = policy.clientCode ? await listDocuments(policy.clientCode) : [];
    return NextResponse.json({ policyDocuments, kycDocuments });
  } catch (error) {
    console.error("Attachment list failed", error);
    return NextResponse.json({ error: "The attached documents could not be listed." }, { status: 500 });
  }
}

// Stores the documents selected in the Attached Document form once the payment is confirmed.
// Form fields: policyNo, clientCode, and for each file: file_<n>, docType_<n>, kyc_<n> ("true" for KYC documents).
export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });

  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: "Invalid upload." }, { status: 400 }); }
  const policyNo = String(form.get("policyNo") ?? "").trim();
  if (!policyNo) return NextResponse.json({ error: "Enter the Document Number!" }, { status: 400 });

  const policyDocuments: IncomingDocument[] = [];
  const kycDocuments: IncomingDocument[] = [];
  for (let index = 0; index < MAX_FILES + 1; index++) {
    const file = form.get(`file_${index}`);
    if (!(file instanceof File)) continue;
    if (index >= MAX_FILES) return NextResponse.json({ error: `At most ${MAX_FILES} documents can be uploaded at once.` }, { status: 400 });
    const docType = String(form.get(`docType_${index}`) ?? "").trim();
    if (!docType) return NextResponse.json({ error: "Select the Document Type!" }, { status: 400 });
    const extension = path.extname(file.name).toLowerCase();
    if (!extension) return NextResponse.json({ error: `${file.name}: Document is not valid, NO EXTENSION. Please verify.` }, { status: 400 });
    if (!ALLOWED_EXTENSIONS.has(extension)) return NextResponse.json({ error: `${file.name}: only PDF, JPG, PNG, DOC and DOCX documents are accepted.` }, { status: 400 });
    if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: `${file.name}: the maximum size is 5 MB.` }, { status: 400 });
    const document = { docType, originalName: file.name, content: new Uint8Array(await file.arrayBuffer()) };
    (String(form.get(`kyc_${index}`)) === "true" ? kycDocuments : policyDocuments).push(document);
  }
  if (!policyDocuments.length && !kycDocuments.length) return NextResponse.json({ error: "No documents were selected." }, { status: 400 });

  try {
    const policy = await findOwnedPolicy(policyNo, userId);
    if (!policy) return NextResponse.json({ error: "Could not validate the Policy number!" }, { status: 404 });
    const user = `web:${userId}`;
    const results: Record<string, unknown> = {};
    // Validate both folder names before anything is stored.
    const policyFolder = policyFolderName(policyNo);
    const clientCode = policy.clientCode || String(form.get("clientCode") ?? "").trim();
    const kycFolder = kycDocuments.length ? kycFolderName(clientCode) : "";
    if (policyDocuments.length) {
      results.policy = await storeDocuments({ root: POLICY_DOCUMENTS_DIR, folderName: policyFolder, docNo: policyNo, module: POLICY_MODULE, user, documents: policyDocuments });
    }
    if (kycDocuments.length) {
      results.kyc = await storeDocuments({ root: KYC_DOCUMENTS_DIR, folderName: kycFolder, docNo: clientCode, module: KYC_MODULE, user, documents: kycDocuments });
    }
    const savedTo = (results.policy as { folder?: string; recorded?: boolean } | undefined);
    const message = savedTo && savedTo.recorded === false
      ? `Documents saved in ${savedTo.folder}, but their paths were not recorded because the dbo.temp_attachment table does not exist.`
      : "Documents uploaded successfully.";
    return NextResponse.json({ message, ...results }, { status: 201 });
  } catch (error) {
    if (error instanceof AttachmentError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("Attachment upload failed", error);
    return NextResponse.json({ error: UPLOAD_FAILED_MESSAGE }, { status: 500 });
  }
}
