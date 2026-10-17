import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";

// Company details printed on the policy documents (taken from the insurer's sample documents).
export const COMPANY = {
  name: "The New India Assurance Company Limited",
  shortName: "The New India Assurance Co Ltd",
  brn: "C06000344",
  fscLicence: "IS10000021",
  telephone: "(+230) 208 1442",
  email: "niassurance@niamauritius.com",
  address: "5th Floor, Bank of Baroda Bldg., Sir William Newton Street, Port Louis, Mauritius, P.O.Box No. 398",
  tagline: "Serving Mauritius with Trust Since 1935 | General Insurance | Motor | Marine | Property | Liability",
  towingHotline: "86100",
  towingProvider: "KOUKOU TOWING",
  agency: "M/s. DIRECT NIA",
  bank: {
    beneficiaryBank: "Bank of Baroda",
    branch: "Head office Port Louis",
    accountNumber: "90310200000419",
    iban: "MU15BARB0231000200000419000MUR",
    swift: "BARBMUMU",
  },
};

export type PolicyDocumentData = {
  policyNo: string;
  certificateNo: string;
  certificateCode: string;
  invoiceNo: string;
  clientCode: string;
  holderName: string;
  address: string;
  city: string;
  occupation: string;
  cover: string;
  vehicleStatus: string;
  vehicleType: string;
  vehicleClass: string;
  vehicleNo: string;
  make: string;
  model: string;
  engineNo: string;
  chassisNo: string;
  seating: string;
  manufactureDate: string;
  issueDate: string;
  fromDate: string;
  toDate: string;
  issuedAt: Date;
  sumInsured: number;
  compulsoryExcess: number;
  additionalExcess: number;
  youngDriverExcess: number;
  totalLossExcess: number;
  tppdExcess: number;
  fireExcess: number;
  voluntaryExcess: number;
  premium: number;
  documentCharge: number;
  towingCharge: number;
  levy: number;
  hitAndRun: number;
  total: number;
};

export type PolicyAttachment = { name: string; content: Uint8Array; docType?: string };

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 40;
const NAVY = rgb(0.12, 0.16, 0.45);
const TEXT = rgb(0.1, 0.1, 0.14);
const MUTED = rgb(0.35, 0.35, 0.42);
const LINK_RED = rgb(0.62, 0.12, 0.12);
const BOX = rgb(0.12, 0.16, 0.45);

type Ctx = { doc: PDFDocument; font: PDFFont; bold: PDFFont; logo: PDFImage | null };

// Standard PDF fonts only support WinAnsi characters; replace anything else so drawing never throws.
const safe = (value: unknown) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\n\x20-\x7E\xA0-\xFF–—‘’“”]/g, "?");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Accepts "YYYY-MM-DD", "YYYY-MM-DDTHH:mm" or an ISO date; dates are shown by their calendar date.
export function parseDay(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (match) return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) };
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : { y: date.getUTCFullYear(), m: date.getUTCMonth(), d: date.getUTCDate() };
}
const fmtDate = (value: string) => {
  const day = parseDay(value);
  return day ? `${String(day.d).padStart(2, "0")}-${MONTHS[day.m]}-${day.y}` : "";
};
const fmtMonthYear = (value: string) => {
  const day = parseDay(value);
  return day ? `${MONTHS[day.m]}-${String(day.y).slice(-2)}` : "";
};
const yearOf = (value: string) => String(parseDay(value)?.y ?? "");
const mauritiusParts = (date: Date) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Indian/Mauritius", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date).map((p) => [p.type, p.value]));
  return { date: `${parts.day}/${parts.month}/${parts.year}`, time: `${parts.hour}:${parts.minute}`, iso: `${parts.year}-${parts.month}-${parts.day}` };
};
const fmtAmount = (value: number) => (Number.isFinite(value) ? value : 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

const ONES = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
const TENS = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
function wordsBelowThousand(n: number): string {
  const parts: string[] = [];
  if (n >= 100) { parts.push(`${ONES[Math.floor(n / 100)]} HUNDRED`); n %= 100; }
  if (n >= 20) { parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : "")); }
  else if (n > 0) parts.push(ONES[n]);
  return parts.join(" ");
}
function integerWords(n: number): string {
  if (n === 0) return "ZERO";
  const scales: [number, string][] = [[1_000_000_000, "BILLION"], [1_000_000, "MILLION"], [1_000, "THOUSAND"]];
  const parts: string[] = [];
  for (const [size, label] of scales) {
    if (n >= size) { parts.push(`${wordsBelowThousand(Math.floor(n / size))} ${label}`); n %= size; }
  }
  if (n > 0) parts.push(wordsBelowThousand(n));
  return parts.join(" ");
}
export function amountInWords(amount: number): string {
  const cents = Math.round(amount * 100) % 100;
  const rupees = Math.floor(Math.round(amount * 100) / 100);
  return `${integerWords(rupees)} RUPEES${cents ? ` AND ${integerWords(cents)} CENTS` : ""} ONLY`;
}

function text(page: PDFPage, value: unknown, x: number, y: number, font: PDFFont, size = 9, color = TEXT) {
  page.drawText(safe(value), { x, y, size, font, color });
}
function textRight(page: PDFPage, value: unknown, xRight: number, y: number, font: PDFFont, size = 9, color = TEXT) {
  text(page, value, xRight - font.widthOfTextAtSize(safe(value), size), y, font, size, color);
}
function textCenter(page: PDFPage, value: unknown, xCenter: number, y: number, font: PDFFont, size = 9, color = TEXT) {
  text(page, value, xCenter - font.widthOfTextAtSize(safe(value), size) / 2, y, font, size, color);
}
function underline(page: PDFPage, value: unknown, x: number, y: number, font: PDFFont, size: number, color = TEXT) {
  page.drawLine({ start: { x, y: y - 1.5 }, end: { x: x + font.widthOfTextAtSize(safe(value), size), y: y - 1.5 }, thickness: 0.6, color });
}
function wrap(value: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of safe(value).split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) { lines.push(line); line = word; }
      else line = candidate;
    }
    lines.push(line);
  }
  return lines;
}
function paragraph(page: PDFPage, value: string, x: number, y: number, font: PDFFont, size: number, maxWidth: number, color = TEXT): number {
  for (const line of wrap(value, font, size, maxWidth)) { text(page, line, x, y, font, size, color); y -= size * 1.35; }
  return y;
}
function hline(page: PDFPage, y: number, x1 = MARGIN, x2 = A4[0] - MARGIN, thickness = 0.8, color = BOX) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color });
}
function box(page: PDFPage, x: number, y: number, width: number, height: number, thickness = 0.8) {
  page.drawRectangle({ x, y, width, height, borderColor: BOX, borderWidth: thickness });
}

function header(ctx: Ctx, page: PDFPage, title?: string): number {
  const top = A4[1] - MARGIN;
  if (ctx.logo) {
    const width = 190;
    const height = (ctx.logo.height / ctx.logo.width) * width;
    page.drawImage(ctx.logo, { x: MARGIN, y: top - height, width, height });
    if (title) textCenter(page, title, A4[0] / 2, top - height - 22, ctx.bold, 12, NAVY);
    return top - height - (title ? 32 : 14);
  }
  text(page, "NEW INDIA ASSURANCE", MARGIN, top - 20, ctx.bold, 20, NAVY);
  if (title) textCenter(page, title, A4[0] / 2, top - 46, ctx.bold, 12, NAVY);
  return top - (title ? 58 : 34);
}

function footer(ctx: Ctx, page: PDFPage, pageLabel?: string) {
  hline(page, 62, MARGIN, A4[0] - MARGIN, 0.5, MUTED);
  textCenter(page, COMPANY.tagline, A4[0] / 2, 48, ctx.font, 8, MUTED);
  textCenter(page, `Telephone: ${COMPANY.telephone} | Email: ${COMPANY.email}`, A4[0] / 2, 36, ctx.bold, 8, TEXT);
  textCenter(page, `BRN: ${COMPANY.brn}, FSC License No: ${COMPANY.fscLicence}`, A4[0] / 2, 25, ctx.font, 8, TEXT);
  if (pageLabel) textRight(page, pageLabel, A4[0] - MARGIN, 48, ctx.font, 8, MUTED);
}

// Rows of "label : value" (used for the numbered certificate / schedule items).
function labelled(ctx: Ctx, page: PDFPage, rows: [string, string][], x: number, y: number, labelWidth: number, size = 9, gap = 13): number {
  for (const [label, value] of rows) {
    text(page, label, x, y, ctx.font, size);
    text(page, ":", x + labelWidth, y, ctx.font, size);
    text(page, value, x + labelWidth + 10, y, ctx.font, size);
    y -= gap;
  }
  return y;
}

const certificateDetails = (d: PolicyDocumentData) =>
  [d.certificateNo, d.vehicleStatus, d.vehicleType || d.vehicleClass, fmtMonthYear(d.manufactureDate)].filter(Boolean).join(" /");
const makeAndModel = (d: PolicyDocumentData) => [d.make, d.model].filter(Boolean).join(" ");
const certificateCompulsoryExcess = (d: PolicyDocumentData) => d.compulsoryExcess + d.additionalExcess;
const coverTitle = (d: PolicyDocumentData) => (d.cover || "").toUpperCase();

const DRIVERS_TEXT = [
  "a) The Policy holder only",
  "b) Any other person who is driving on the policy holder's order or with his permission",
];
const DRIVERS_PROVISO = "Provided that the person driving is permitted in accordance with the licensing or other laws or regulations to drive the Motor Vehicle or has been so permitted and is not disqualified by order of a Court of Law or by reason of any enactment or regulation in that behalf from driving the Motor Vehicle.";
const LIMITATIONS = ["(a) Use only for social, domestic and pleasure purposes and for policy holder's business"];
const NOT_COVERED = [
  "(a) Use for any purpose in connection with the motor trade",
  "(b) Use for carriage of passengers for hire or reward",
  "(c) Use for racing, pace-making, reliability trial or speed-testing",
  "(d) Use for carriage of goods(other than samples) in connection with any trade or business",
];

function vehicleItems(ctx: Ctx, page: PDFPage, d: PolicyDocumentData, y: number, withAddress: boolean): number {
  const x = MARGIN + 10;
  const width = A4[0] - 2 * MARGIN - 20;
  text(page, "1.", x, y, ctx.font, 9); text(page, "INDEX MARK AND REGISTRATION", x + 18, y, ctx.font, 9); text(page, ":", x + 240, y, ctx.font, 9); text(page, makeAndModel(d), x + 250, y, ctx.font, 9); y -= 12;
  text(page, "NUMBER OF THE VEHICLE", x + 18, y, ctx.font, 9); text(page, ":", x + 240, y, ctx.font, 9); text(page, d.vehicleNo, x + 250, y, ctx.font, 9); y -= 12;
  text(page, "ENGINE NO", x + 18, y, ctx.font, 9); text(page, ":", x + 240, y, ctx.font, 9); text(page, d.engineNo, x + 250, y, ctx.font, 9); y -= 12;
  text(page, "CHASSIS NO", x + 18, y, ctx.font, 9); text(page, ":", x + 240, y, ctx.font, 9); text(page, d.chassisNo, x + 250, y, ctx.font, 9); y -= 12;
  text(page, "2.", x, y, ctx.font, 9); text(page, "NAME OF POLICY HOLDER", x + 18, y, ctx.font, 9); text(page, ":", x + 240, y, ctx.font, 9); text(page, d.holderName, x + 250, y, ctx.font, 9); y -= 16;
  if (withAddress) {
    text(page, "INSURED ADDRESS", x + 18, y, ctx.font, 9); text(page, ":", x + 240, y, ctx.font, 9);
    y = paragraph(page, [d.address, d.city].filter(Boolean).join(", ").toUpperCase(), x + 250, y, ctx.font, 9, width - 250) - 4;
  }
  text(page, "3.", x, y, ctx.font, 9); text(page, "EFFECTIVE DATE OF THE COMMENCEMENT", x + 18, y, ctx.font, 9); y -= 12;
  text(page, "OF INSURANCE FOR THE PURPOSES OF THE ORDINANCE", x + 18, y, ctx.font, 9); text(page, ":", x + 280, y, ctx.font, 9); text(page, `${fmtDate(d.fromDate)} From 0:00 Hrs`, x + 290, y, ctx.font, 9); y -= 14;
  text(page, "4.", x, y, ctx.font, 9); text(page, "DATE OF EXPIRY OF INSURANCE", x + 18, y, ctx.font, 9); text(page, ":", x + 280, y, ctx.font, 9); text(page, `${fmtDate(d.toDate)} At 23:59 Hrs`, x + 290, y, ctx.font, 9); y -= 12;
  text(page, "(Both dates inclusive and shall not be subject to tacite reconduction)", x + 18, y, ctx.font, 8, MUTED); y -= 14;
  text(page, "5.", x, y, ctx.font, 9); text(page, "PERSONS OR CLASSES OF PERSONS ENTITLED TO DRIVE*", x + 18, y, ctx.font, 9); y -= 12;
  for (const line of DRIVERS_TEXT) { text(page, line, x + 36, y, ctx.font, 9); y -= 12; }
  y = paragraph(page, DRIVERS_PROVISO, x + 18, y, ctx.font, 8.5, width - 18) - 2;
  hline(page, y + 4);
  text(page, "6.", x, y - 8, ctx.font, 9); underline(page, "LIMITATIONS TO USE*", x + 18, y - 8, ctx.font, 9); text(page, "LIMITATIONS TO USE*", x + 18, y - 8, ctx.font, 9); y -= 20;
  for (const line of LIMITATIONS) { text(page, line, x + 30, y, ctx.font, 9); y -= 12; }
  text(page, "7.", x, y, ctx.font, 9); underline(page, "POLICY DOES NOT COVER*", x + 18, y, ctx.font, 9); text(page, "POLICY DOES NOT COVER*", x + 18, y, ctx.font, 9); y -= 12;
  for (const line of NOT_COVERED) { text(page, line, x + 30, y, ctx.font, 9); y -= 12; }
  return y;
}

async function createContext(title: string): Promise<Ctx> {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setAuthor(COMPANY.name);
  doc.setCreator("New India Assurance - Motor Online");
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  let logo: PDFImage | null = null;
  try {
    logo = await doc.embedPng(await readFile(path.join(process.cwd(), "public", "images", "logo.png")));
  } catch (error) {
    console.warn("Policy documents: logo not embedded", error);
  }
  return { doc, font, bold, logo };
}

export async function buildCertificate(d: PolicyDocumentData): Promise<Uint8Array> {
  const ctx = await createContext(`Certificate of Insurance - ${d.vehicleNo}`);
  const page = ctx.doc.addPage(A4);
  let y = header(ctx, page);
  hline(page, y + 4, MARGIN, A4[0] - MARGIN, 1.2);

  // Left: cover and policy references. Right: statutory heading and certificate code.
  const left = MARGIN + 6;
  y -= 18;
  text(page, coverTitle(d), left, y, ctx.font, 13, LINK_RED); underline(page, coverTitle(d), left, y, ctx.font, 13, LINK_RED);
  box(page, 300, y - 40, 140, 52);
  textCenter(page, "REPUBLIC OF MAURITIUS", 370, y, ctx.font, 8.5, LINK_RED);
  textCenter(page, "THE ROAD TRAFFIC ACT 1963", 370, y - 12, ctx.font, 8.5, LINK_RED);
  textCenter(page, "CERTIFICATE OF INSURANCE", 370, y - 24, ctx.font, 8.5, LINK_RED);
  box(page, 340, y - 64, 60, 16);
  textCenter(page, d.certificateCode || "-", 370, y - 59, ctx.font, 9, LINK_RED);
  y -= 22;
  text(page, `BRN: ${COMPANY.brn}`, left, y, ctx.font, 9, LINK_RED); y -= 16;
  text(page, `Policy No: ${d.policyNo}`, left, y, ctx.font, 9, LINK_RED); y -= 16;
  text(page, `Certificate Details: ${certificateDetails(d)}`, left, y, ctx.font, 9, LINK_RED); y -= 26;
  text(page, "FOR TOWING SERVICES (In case of Breakdown/Road Accident) Please contact", left, y, ctx.font, 9, LINK_RED); y -= 12;
  text(page, `Hotline number @ ${COMPANY.towingHotline}`, left, y, ctx.font, 9, LINK_RED); y -= 14;
  hline(page, y);
  y -= 16;

  y = vehicleItems(ctx, page, d, y, false);
  hline(page, y + 6);
  y -= 6;
  y = paragraph(page, "* Limitations rendered inoperative by Section 60 of the Road Traffic Act 1963, Set out under this heading do not apply in respect of the Insurance which is required by the said Ordinance.", left, y, ctx.font, 8.5, A4[0] - 2 * MARGIN - 12);
  y = paragraph(page, "I/We hereby certify that the Policy to which this certificate relates is issued in accordance with the Provisions of Part V of the Road Traffic Act 1963.", left, y, ctx.font, 8.5, A4[0] - 2 * MARGIN - 12);
  hline(page, y + 2);

  // Sum insured and excesses box.
  const boxTop = y - 10;
  const rows: [string, string][] = [
    ["Compulsory Excess", `Rs. ${fmtAmount(certificateCompulsoryExcess(d))}`],
    ["Young Driver's Excess", `Rs. ${fmtAmount(d.youngDriverExcess)}`],
    ["Total Loss Excess", `Rs. ${fmtAmount(d.totalLossExcess)}`],
    ["TPPD Excess", `Rs. ${fmtAmount(d.tppdExcess)}`],
    ["FIRE Excess", `Rs. ${fmtAmount(d.fireExcess)}`],
    ["Voluntary Excess", `Rs. ${fmtAmount(d.voluntaryExcess)}`],
  ];
  box(page, MARGIN + 6, boxTop - 128, 240, 128);
  text(page, "Sum Insured", MARGIN + 16, boxTop - 18, ctx.font, 10, LINK_RED);
  text(page, `Rs. ${fmtAmount(d.sumInsured)}`, MARGIN + 130, boxTop - 18, ctx.font, 10, LINK_RED);
  hline(page, boxTop - 26, MARGIN + 6, MARGIN + 246);
  rows.forEach(([label, value], index) => {
    text(page, label, MARGIN + 16, boxTop - 42 - index * 14, ctx.font, 9, NAVY);
    text(page, value, MARGIN + 130, boxTop - 42 - index * 14, ctx.font, 9, NAVY);
  });
  textCenter(page, `For ${COMPANY.name}`, 430, boxTop - 18, ctx.font, 10, NAVY);
  textCenter(page, "Duly Constituted Attorney", 430, boxTop - 110, ctx.font, 9, NAVY);

  const issued = mauritiusParts(d.issuedAt);
  text(page, `Date / Time of Issue ${issued.date} ${issued.time} Hrs`, MARGIN + 6, boxTop - 146, ctx.font, 8.5, MUTED);
  textRight(page, d.certificateNo, A4[0] - MARGIN, boxTop - 146, ctx.font, 8.5, MUTED);
  footer(ctx, page);
  return ctx.doc.save();
}

export async function buildDebitNote(d: PolicyDocumentData): Promise<Uint8Array> {
  const ctx = await createContext(`Invoice ${d.invoiceNo} - ${d.vehicleNo}`);
  const page = ctx.doc.addPage(A4);
  let y = header(ctx, page, "INVOICE");
  underline(page, "INVOICE", A4[0] / 2 - ctx.bold.widthOfTextAtSize("INVOICE", 12) / 2, y + 10, ctx.bold, 12, NAVY);
  textRight(page, `Business Reg.No ${COMPANY.brn}`, A4[0] - MARGIN, y - 6, ctx.bold, 9);
  textRight(page, `AGENCY 1 ${COMPANY.agency}`, A4[0] - MARGIN, y - 34, ctx.bold, 9);
  textRight(page, `CLIENT CODE : ${d.clientCode || "-"}`, A4[0] - MARGIN, y - 58, ctx.bold, 9);
  y -= 34;
  labelled(ctx, page, [["Invoice No", d.invoiceNo]], MARGIN, y, 60, 9);
  text(page, "Department", MARGIN, y - 20, ctx.bold, 9); text(page, "Motor", MARGIN + 80, y - 20, ctx.bold, 9);
  y = labelled(ctx, page, [["Name", d.holderName]], MARGIN, y - 42, 60, 9);
  text(page, "Address", MARGIN, y, ctx.font, 9); text(page, ":", MARGIN + 60, y, ctx.font, 9);
  y = paragraph(page, [d.address, d.city].filter(Boolean).join(",\n").toUpperCase(), MARGIN + 70, y, ctx.font, 9, 240) - 20;

  // Policy line table.
  // Column boundaries: policy no, cert no, date of issue, period, sum insured, vehicle number, premium.
  const cols = [MARGIN, MARGIN + 104, MARGIN + 186, MARGIN + 244, MARGIN + 350, MARGIN + 404, MARGIN + 462, A4[0] - MARGIN];
  const heads = [["POLICY", "NO"], ["CERT", "NO"], ["DATE OF", "ISSUE"], ["PERIOD OF", "INSURANCE"], ["SUM", "INSURED"], ["VEHICLE", "NUMBER"], ["PREMIUM", "(Rs)"]];
  box(page, MARGIN, y - 92, A4[0] - 2 * MARGIN, 92);
  heads.forEach(([a, b], i) => { text(page, a, cols[i] + 4, y - 16, ctx.bold, 7.5); text(page, b, cols[i] + 4, y - 26, ctx.bold, 7.5); });
  hline(page, y - 34);
  const cells = [d.policyNo, d.certificateNo, fmtDate(d.issueDate), `${fmtDate(d.fromDate)}  ${fmtDate(d.toDate)}`, fmtAmount(d.sumInsured), d.vehicleNo];
  cells.forEach((value, i) => text(page, value, cols[i] + 4, y - 50, ctx.font, 7));
  textRight(page, fmtAmount(d.total), cols[7] - 6, y - 50, ctx.font, 8);
  hline(page, y - 62);
  text(page, amountInWords(d.total), MARGIN + 6, y - 80, ctx.bold, 8.5);
  text(page, "Total", cols[5] + 10, y - 80, ctx.bold, 9);
  textRight(page, fmtAmount(d.total), cols[7] - 6, y - 80, ctx.bold, 9);
  y -= 124;

  text(page, "PLEASE NOTE THE BANK DETAILS IN CASE OF BANK TRANSFER", MARGIN, y, ctx.bold, 10); underline(page, "PLEASE NOTE THE BANK DETAILS IN CASE OF BANK TRANSFER", MARGIN, y, ctx.bold, 10);
  y -= 26;
  for (const [label, value] of [["Beneficiary Bank", COMPANY.bank.beneficiaryBank], ["Branch", COMPANY.bank.branch], ["Account Number", COMPANY.bank.accountNumber], ["IBAN", COMPANY.bank.iban], ["Swift Code", COMPANY.bank.swift]] as const) {
    text(page, `${label}:`, MARGIN, y, ctx.bold, 9.5); text(page, value, MARGIN + ctx.bold.widthOfTextAtSize(`${label}:`, 9.5) + 6, y, ctx.font, 9.5); y -= 22;
  }
  y = paragraph(page, `Payment Ref: ${d.invoiceNo}-${d.holderName}`, MARGIN, y, ctx.bold, 9.5, 280) - 30;
  const issued = mauritiusParts(d.issuedAt);
  text(page, `Date of Issue   :  ${fmtDate(issued.iso)}  ${issued.time}  Hrs`, MARGIN, y, ctx.font, 9);
  textRight(page, `For ${COMPANY.shortName}`, A4[0] - MARGIN, y + 30, ctx.bold, 9);
  textRight(page, "Duly Constituted Attorney", A4[0] - MARGIN, y - 20, ctx.bold, 9);

  hline(page, 62, MARGIN, A4[0] - MARGIN, 0.5, MUTED);
  textCenter(page, COMPANY.shortName.replace("Co Ltd", "Co. Ltd"), A4[0] / 2, 48, ctx.bold, 10, NAVY);
  textCenter(page, `${COMPANY.address}, Tel ${COMPANY.telephone}`, A4[0] / 2, 36, ctx.font, 7.5);
  textCenter(page, "PLEASE EXAMINE THIS DOCUMENT CAREFULLY. IF FOUND INCORRECT PLEASE RETURN IMMEDIATELY FOR ALTERATIONS.", A4[0] / 2, 25, ctx.font, 7, MUTED);
  return ctx.doc.save();
}

export async function buildSchedule(d: PolicyDocumentData): Promise<Uint8Array> {
  const ctx = await createContext(`Policy Schedule - ${d.vehicleNo}`);
  const issued = mauritiusParts(d.issuedAt);

  // Page 1: schedule.
  let page = ctx.doc.addPage(A4);
  let y = header(ctx, page);
  hline(page, y + 4, MARGIN, A4[0] - MARGIN, 1.2);
  y -= 14;
  textCenter(page, "MOTOR POLICY SCHEDULE", A4[0] / 2, y, ctx.font, 10); underline(page, "MOTOR POLICY SCHEDULE", A4[0] / 2 - ctx.font.widthOfTextAtSize("MOTOR POLICY SCHEDULE", 10) / 2, y, ctx.font, 10);
  textRight(page, `Business Reg.No ${COMPANY.brn}`, A4[0] - MARGIN, y - 4, ctx.font, 8.5);
  y -= 16;
  text(page, `POLICY NO :${d.policyNo}`, MARGIN + 10, y, ctx.font, 9);
  textRight(page, d.certificateCode, A4[0] - MARGIN, y - 2, ctx.font, 8.5);
  y -= 14;
  textRight(page, `Certificate No.:${d.certificateNo}`, A4[0] - MARGIN, y, ctx.font, 8.5);
  const coverLine = `${coverTitle(d)} / IN CASE OF BREAKDOWN/ROAD ACCIDENT PLEASE CONTACT ${COMPANY.towingProvider} @ ${COMPANY.towingHotline}`;
  text(page, coverLine, MARGIN + 10, y - 16, ctx.font, 8); underline(page, coverLine, MARGIN + 10, y - 16, ctx.font, 8);
  y -= 34;
  y = vehicleItems(ctx, page, d, y, true);
  hline(page, y + 6);
  y -= 10;

  const leftRows: [string, string][] = [
    ["COMPULSORY EXCESS", fmtAmount(certificateCompulsoryExcess(d))],
    ["YOUNG DRIVER'S EXCESS", fmtAmount(d.youngDriverExcess)],
    ["TOTAL LOSS EXCESS", fmtAmount(d.totalLossExcess)],
    ["VOLUNTARY EXCESS", fmtAmount(d.voluntaryExcess)],
  ];
  let ly = y;
  for (const [label, value] of leftRows) { text(page, label, MARGIN + 10, ly, ctx.font, 8.5); text(page, `:Rs.  ${value}`, MARGIN + 140, ly, ctx.font, 9); ly -= 18; }
  ly -= 30;
  const charges: [string, number][] = [["PREMIUM", d.premium], ["DOCUMENT CHARGES", d.documentCharge], ["TOWING CHARGE", d.towingCharge], ["LEVY CHARGE", d.levy], ["HIT&RUN CHARGE", d.hitAndRun]];
  for (const [label, value] of charges) { text(page, label, MARGIN + 10, ly, ctx.font, 8.5); text(page, `:Rs.  ${fmtAmount(value)}`, MARGIN + 140, ly, ctx.font, 9); ly -= 14; }
  hline(page, ly + 8, MARGIN + 160, MARGIN + 230, 0.6, TEXT);
  text(page, "TOTAL", MARGIN + 10, ly - 6, ctx.font, 8.5); text(page, `:Rs.  ${fmtAmount(d.total)}`, MARGIN + 140, ly - 6, ctx.bold, 9.5);

  const rx = 300;
  let ry = y;
  const rightRows: [string, string][] = [
    ["HYPOTHECATED WITH", ""],
    ["BUSINESS OR PROFESSION", d.occupation],
    ["TYPE OF VEHICLE", (d.vehicleClass || d.vehicleType).toUpperCase()],
    ["SEATING CAPACITY INCLUDING DRIVER", d.seating],
    ["INSURED'S ESTIMATE OF VALUE INCLUDING ACCESSORIES (RS.)", fmtAmount(d.sumInsured)],
    ["YEAR OF MANUFACTURE", yearOf(d.manufactureDate)],
    ["DATE OF ISSUE", fmtDate(d.issueDate)],
  ];
  for (const [label, value] of rightRows) {
    const lines = wrap(label, ctx.font, 8.5, 150);
    lines.forEach((line, i) => text(page, line, rx, ry - i * 11, ctx.font, 8.5));
    if (label !== "HYPOTHECATED WITH") text(page, `:  ${value}`, rx + 160, ry - (lines.length - 1) * 11, label.startsWith("INSURED") ? ctx.bold : ctx.font, 9);
    else text(page, ":", rx + 160, ry, ctx.font, 9);
    ry -= lines.length * 11 + 8;
  }
  textCenter(page, `For ${COMPANY.name}`, 440, ry - 6, ctx.font, 9.5);
  textCenter(page, "Duly Constituted Attorney", 440, ry - 70, ctx.font, 9);

  y = Math.min(ly - 24, ry - 84);
  y = paragraph(page, `(${d.holderName} having proposed for insurance of the vehicle described above, this Policy is issued for the period mentioned above subject to its terms and conditions)`, MARGIN + 10, y, ctx.font, 8.5, A4[0] - 2 * MARGIN - 20);
  text(page, `Date / Time  ${issued.date} ${issued.time} Hrs`, MARGIN + 10, y - 4, ctx.font, 8.5);
  footer(ctx, page, "Page 1 of 3");

  // Page 2: young driver's clause.
  page = ctx.doc.addPage(A4);
  y = header(ctx, page);
  hline(page, y + 4, MARGIN, A4[0] - MARGIN, 1.2);
  y -= 16;
  box(page, MARGIN + 10, y - 16, A4[0] - 2 * MARGIN - 20, 26);
  text(page, `ATTACHED TO POLICY NUMBER : ${d.policyNo}`, MARGIN + 20, y - 7, ctx.bold, 9);
  y -= 50;
  box(page, MARGIN + 10, y - 190, A4[0] - 2 * MARGIN - 20, 200);
  textCenter(page, "YOUNG DRIVER'S CLAUSE", A4[0] / 2, y - 6, ctx.font, 10);
  hline(page, y - 14, MARGIN + 10, A4[0] - MARGIN - 10);
  y -= 34;
  text(page, "COMPANY SHALL NOT BE LIABLE FOR :-", MARGIN + 22, y, ctx.font, 9.5);
  y = paragraph(page, `Such amount described in the Schedule as "Young Driver's Excess", being the first portion of any amount otherwise payable in respect of each and every loss or damage to the Motor Vehicle in addition to the Compulsory Excess occurring whilst the Motor Vehicle is being driven by or in the charge of any person who:-`, MARGIN + 22, y - 18, ctx.font, 9.5, A4[0] - 2 * MARGIN - 44) - 10;
  for (const [n, line] of [["(i)", "is under the age of 25"], ["(ii)", "holds a learner's provisional driving licence"], ["(iii)", "has not held for a period of two years a driving licence other than a learner's provisional licence"]]) {
    text(page, n, MARGIN + 22, y, ctx.font, 9.5);
    y = paragraph(page, line, MARGIN + 60, y, ctx.font, 9.5, A4[0] - 2 * MARGIN - 90) - 2;
  }
  footer(ctx, page, "Page 2 of 3");

  // Page 3: policy summary (office copy).
  page = ctx.doc.addPage(A4);
  y = header(ctx, page);
  hline(page, y + 4, MARGIN, A4[0] - MARGIN, 1.2);
  y -= 30;
  box(page, MARGIN + 10, y - 40, A4[0] - 2 * MARGIN - 20, 54);
  textCenter(page, "POLICY SUMMARY (OFFICE COPY)", A4[0] / 2, y - 18, ctx.font, 11); underline(page, "POLICY SUMMARY (OFFICE COPY)", A4[0] / 2 - ctx.font.widthOfTextAtSize("POLICY SUMMARY (OFFICE COPY)", 11) / 2, y - 18, ctx.font, 11);
  y -= 66;
  const summaryTop = y;
  y = labelled(ctx, page, [
    ["POLICY NO", d.policyNo],
    ["CERTIFICATE NO", d.certificateNo],
    ["POLICY HOLDER", d.holderName],
    ["COVER", `${coverTitle(d)} / TOWING SERVICE @ ${COMPANY.towingHotline}`],
    ["VEHICLE NUMBER", d.vehicleNo],
    ["MAKE", d.make],
    ["MODEL", d.model],
    ["ISSUE DATE", fmtDate(d.issueDate)],
  ], MARGIN + 30, y - 10, 150, 9, 21);
  text(page, "PERIOD OF INSURANCE", MARGIN + 30, y, ctx.font, 9); y -= 21;
  y = labelled(ctx, page, [["FROM", `${fmtDate(d.fromDate)} From 0:00 Hrs`], ["TO", `${fmtDate(d.toDate)} At 23:59 Hrs`]], MARGIN + 30, y, 150, 9, 21) - 6;
  const excessRows: [string, number][] = [["COMPULSORY EXCESS", d.compulsoryExcess], ["YOUNG DRIVER'S EXCESS", d.youngDriverExcess], ["VOLUNTARY EXCESS", d.voluntaryExcess], ["TPPD EXCESS", d.tppdExcess], ["FIRE EXCESS", d.fireExcess], ["ADDITIONAL/LESS EXCESS", d.additionalExcess]];
  const amountRows: [string, number][] = [["PREMIUM", d.premium], ["DOCUMENT CHARGES", d.documentCharge], ["TOWING SERVICE", d.towingCharge], ["LEVY CHARGE", d.levy], ["HIT&RUN CHARGE", d.hitAndRun], ["TOTAL", d.total]];
  excessRows.forEach(([label, value], i) => { text(page, label, MARGIN + 30, y - i * 13, ctx.font, 8.5); text(page, `: Rs.  ${fmtAmount(value)}`, MARGIN + 150, y - i * 13, ctx.font, 8.5); });
  amountRows.forEach(([label, value], i) => { text(page, label, MARGIN + 270, y - i * 13, ctx.font, 8.5); text(page, `:Rs.  ${fmtAmount(value)}`, MARGIN + 385, y - i * 13, label === "TOTAL" ? ctx.bold : ctx.font, 8.5); });
  y -= excessRows.length * 13 + 30;
  text(page, "HYPOTHECATED WITH", MARGIN + 30, y, ctx.font, 9); text(page, ":", MARGIN + 180, y, ctx.font, 9);
  y -= 50;
  textRight(page, `PRINTED ON : ${fmtDate(issued.iso)} ${issued.time}`, A4[0] - MARGIN - 20, y, ctx.font, 8.5);
  box(page, MARGIN + 10, y - 14, A4[0] - 2 * MARGIN - 20, summaryTop - y + 30);
  footer(ctx, page, "Page 3 of 3");
  return ctx.doc.save();
}

export async function buildVignette(d: PolicyDocumentData): Promise<Uint8Array> {
  const ctx = await createContext(`Insurance Vignette - ${d.vehicleNo}`);
  const page = ctx.doc.addPage(A4);
  const issued = mauritiusParts(d.issuedAt);
  const width = (A4[0] - 2 * MARGIN - 20) / 2;
  const height = 250;
  const top = A4[1] - MARGIN;
  for (const x of [MARGIN, MARGIN + width + 20]) {
    box(page, x, top - height, width, height, 1);
    textCenter(page, "INSURANCE VIGNETTE", x + width / 2, top - 22, ctx.bold, 12, NAVY);
    let y = top - 50;
    for (const [label, value] of [
      ["Policy No", d.policyNo], ["Registration Mark", d.vehicleNo], ["Make & Type", makeAndModel(d)], ["Chassis No", d.chassisNo],
      ["Date of Issue", fmtDate(d.issueDate)], ["Time of Issue", `${issued.time} Hrs`], ["Effective Date", fmtDate(d.fromDate)], ["Date of Expiry", fmtDate(d.toDate)],
    ] as const) {
      text(page, label, x + 10, y, ctx.bold, 8.5);
      text(page, ":", x + 92, y, ctx.bold, 8.5);
      text(page, value, x + 100, y, ctx.bold, 8.5);
      y -= 18;
    }
    text(page, "Signature of Issuing Officer", x + 10, y - 6, ctx.bold, 8.5);
    if (ctx.logo) page.drawImage(ctx.logo, { x: x + 10, y: top - height + 10, width: 90, height: (ctx.logo.height / ctx.logo.width) * 90 });
    textRight(page, COMPANY.shortName, x + width - 10, top - height + 16, ctx.bold, 9, NAVY);
  }
  return ctx.doc.save();
}

const fileSafe = (value: string) => safe(value).replace(/[^A-Za-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "Policy";

export async function buildPolicyDocuments(d: PolicyDocumentData): Promise<PolicyAttachment[]> {
  const suffix = fileSafe(d.vehicleNo || d.policyNo);
  const [certificate, debitNote, schedule, vignette] = await Promise.all([buildCertificate(d), buildDebitNote(d), buildSchedule(d), buildVignette(d)]);
  return [
    { name: `Certificate-${suffix}.pdf`, content: certificate, docType: "Certificate" },
    { name: `DebitNote-${suffix}.pdf`, content: debitNote, docType: "Debit Note" },
    { name: `Schedule-${suffix}.pdf`, content: schedule, docType: "Schedule" },
    { name: `Vignette-${suffix}.pdf`, content: vignette, docType: "Vignette" },
  ];
}
