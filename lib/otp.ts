import "server-only";
import { createHash, randomInt } from "node:crypto";
import nodemailer from "nodemailer";

export type ContactType = "email" | "mobile";
const BREVO_API_URL = "https://api.brevo.com/v3";
const OTP_EXPIRY_MINUTES = 10;

export const hashOtp = (contact: string, code: string) =>
  createHash("sha256").update(`${contact}:${code}`).digest("hex");
export const generateOtp = () => randomInt(100000, 1000000).toString();

/**
 * Writes the OTP to the server terminal for local testing. This is deliberately
 * disabled outside development unless explicitly enabled for a controlled test.
 */
export function logOtpForDevelopment(type: ContactType, contact: string, code: string) {
  if (process.env.NODE_ENV !== "development" && process.env.OTP_LOG_TO_CONSOLE !== "true") {
    return;
  }

  console.info(`[OTP] ${type} code for ${contact}: ${code} (expires in ${OTP_EXPIRY_MINUTES} minutes)`);
}

function brevoApiHeaders() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("Brevo SMS delivery is not configured. Add BREVO_API_KEY.");
  }

  return {
    accept: "application/json",
    "api-key": apiKey,
    "content-type": "application/json",
  };
}

async function sendBrevoRequest(path: string, body: object, delivery: "email" | "SMS") {
  const response = await fetch(`${BREVO_API_URL}${path}`, {
    method: "POST",
    headers: brevoApiHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error(`Brevo ${delivery} OTP delivery failed`, {
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(`Brevo could not send the ${delivery} verification code.`);
  }
}

async function sendBrevoEmail(contact: string, message: string) {
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const apiKey = process.env.BREVO_API_KEY;

  if (fromEmail && apiKey) {
    await sendBrevoRequest("/smtp/email", {
      sender: { email: fromEmail, name: process.env.BREVO_FROM_NAME || "Motor Insurance" },
      to: [{ email: contact }],
      subject: "Your motor insurance verification code",
      textContent: message,
      tags: ["otp"],
    }, "email");
    return;
  }

  const smtpKey = process.env.BREVO_SMTP_KEY;
  const smtpUser = process.env.BREVO_SMTP_USER || fromEmail;

  if (!fromEmail || !smtpKey || !smtpUser) {
    throw new Error(
      "Brevo email delivery is not configured. Add BREVO_FROM_EMAIL and BREVO_SMTP_KEY.",
    );
  }

  const transport = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpKey },
  });

  await transport.sendMail({
    from: { address: fromEmail, name: process.env.BREVO_FROM_NAME || "Motor Insurance" },
    to: contact,
    subject: "Your motor insurance verification code",
    text: message,
  });
}

async function sendAerisSms(contact: string, message: string) {
  const endpoint = process.env.AERIS_SMS_ENDPOINT;
  const appId = process.env.AERIS_SMS_APP_ID;
  const appKey = process.env.AERIS_SMS_APP_KEY;
  const campaign = process.env.AERIS_SMS_CAMPAIGN || "motor_insurance_otp";

  if (!endpoint || !appId || !appKey) {
    throw new Error("SMS delivery is not configured. Add the AERIS_SMS_* settings.");
  }

  const url = new URL(endpoint);
  url.searchParams.set("phone_number", contact.replace(/^\+/, ""));
  url.searchParams.set("sms_text", message);
  url.searchParams.set("camp_name", campaign);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);

  const response = await fetch(url, { method: "GET", cache: "no-store" });
  if (!response.ok) {
    console.error("Aeris SMS OTP delivery failed", { status: response.status, statusText: response.statusText });
    throw new Error("The SMS provider could not send the verification code.");
  }
}

export async function deliverOtp(type: ContactType, contact: string, code: string) {
  const message = `Your motor insurance verification code is ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;

  if (type === "email") {
    await sendBrevoEmail(contact, message);
    return;
  }

  await sendAerisSms(contact, message);
}
