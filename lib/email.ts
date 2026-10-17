import "server-only";

import type { PolicyAttachment } from "@/lib/policy-documents";

interface PolicyEmailData {
  title: string;
  firstName: string;
  surname: string;
  policyNo: string;
  clientCode: string;
  email: string;
}

export async function sendPolicyEmail(data: PolicyEmailData, attachments: PolicyAttachment[] = []): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME;

  if (!apiKey || !fromEmail) {
    console.error("Brevo API key or from email not configured");
    return { success: false, error: "Email service not configured" };
  }

  const fullName = `${data.title} ${data.firstName} ${data.surname}`.trim().toUpperCase();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #35126d 0%, #5b3aa4 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">New India Assurance Co. Ltd</h1>
        <p style="color: #e8e0f5; margin: 8px 0 0; font-size: 14px;">Motor Insurance Policy Confirmation</p>
      </div>
      
      <div style="background: #ffffff; border: 1px solid #e8e0f5; border-top: none; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${fullName}</strong>,</p>
        
        <div style="background: #f7f5fb; border-left: 4px solid #35126d; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0 0 12px; font-size: 15px;">Please find attached your policy documents for:</p>
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #35126d; font-family: 'Courier New', monospace;">Policy No: ${data.policyNo}</p>
          <p style="margin: 8px 0 0; font-size: 14px; color: #6b5b95;">Client Code: ${data.clientCode}</p>
        </div>
        
        <p style="font-size: 15px; margin-bottom: 20px;">Kindly review the attached documents and contact us in case of any clarification required.</p>
        
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8e0f5;">
          <p style="margin: 0 0 8px; font-size: 15px;">We thank you for your continued trust and support.</p>
          <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #35126d;">Best regards,</p>
          <p style="margin: 0 0 4px; font-size: 15px; color: #5b3aa4;">The New India Assurance Co. Ltd</p>
          <p style="margin: 0 0 4px; font-size: 14px; color: #6b5b95;">Underwriting Department</p>
          <p style="margin: 0; font-size: 14px; color: #6b5b95;">+230 5809 7741</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding: 16px; color: #999; font-size: 12px;">
        <p style="margin: 0;">This is an automated email. Please do not reply directly to this message.</p>
        <p style="margin: 8px 0 0;">&copy; ${new Date().getFullYear()} New India Assurance Co. Ltd. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Dear ${fullName},

Please find attached your policy documents for Policy No: ${data.policyNo} (${data.clientCode}).

Kindly review the attached documents and contact us in case of any clarification required.

We thank you for your continued trust and support.

Best regards,
The New India Assurance Co. Ltd
Underwriting Department
+230 5809 7741
  `.trim();

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: fromName || "New India Assurance", email: fromEmail },
        to: [{ email: data.email, name: fullName }],
        subject: `Your Policy Documents - Policy No: ${data.policyNo}`,
        htmlContent,
        textContent,
        // Certificate, Debit Note, Schedule and Vignette as PDF attachments (Brevo expects base64 content).
        ...(attachments.length ? { attachment: attachments.map((file) => ({ name: file.name, content: Buffer.from(file.content).toString("base64") })) } : {}),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Brevo API error:", response.status, error);
      return { success: false, error: `Email API error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send policy email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}