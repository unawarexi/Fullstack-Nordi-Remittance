import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import dotenv from "dotenv";
import { render } from "../core/mail/Mail-renderer.js";
import type { EmailTemplateData, SendMailResult } from "../types/Mail.types.js";

dotenv.config();

// Validate required SMTP environment variables
const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required email environment variables: ${missingVars.join(", ")}`);
  console.error("Please configure your .env file with proper SMTP settings.");
  throw new Error("Email service not configured properly");
}

// Create transporter with real SMTP configuration
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Additional options for better reliability
  tls: {
    rejectUnauthorized: false, // For self-signed certificates
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

/**
 * Send a raw HTML email
 */
export async function sendMail(
  to: string, 
  subject: string, 
  htmlContent: string
): Promise<SendMailResult> {
  const mailOptions: SendMailOptions = {
    from: `${process.env.FROM_NAME || "Nordea Remittance"} <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} | Subject: ${subject} | MessageID: ${info.messageId}`);
    return {
      messageId: info.messageId,
      accepted: info.accepted as string[],
      rejected: info.rejected as string[],
      response: info.response
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error sending email to ${to}:`, errorMessage);
    throw error;
  }
}

/**
 * Render template data into base.html and send
 * @param {String} to
 * @param {Object} templateData - object produced by mail-content generator
 */
export async function sendTemplatedMail(
  to: string, 
  templateData: EmailTemplateData
): Promise<SendMailResult> {
  const html = render(templateData);
  const subject = templateData.EMAIL_TITLE || "Notification from Nordea Remittance";
  return sendMail(to, subject, html);
}
