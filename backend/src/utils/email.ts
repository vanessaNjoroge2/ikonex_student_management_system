import nodemailer from 'nodemailer';
import { env } from '../config/env';

/**
 * Create reusable SMTP transporter
 */
const createTransporter = () => {
  if (!env.gmailUser || !env.gmailAppPassword) {
    console.warn(
      '⚠️ Email not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing). Falling back to console logs.'
    );
    return null;
  }

  const password = env.gmailAppPassword.replace(/\s+/g, '');

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // ✅ MUST be false for port 587 (STARTTLS)
    auth: {
      user: env.gmailUser,
      pass: password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const transporter = createTransporter();

/**
 * Helper function to send email safely
 */
const sendMail = async (mailOptions: any) => {
  if (!transporter) {
    console.log('✉️ [Mock Email]', mailOptions);
    return true;
  }

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return false;
  }
};

/**
 * PASSWORD RESET EMAIL
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  name: string,
  code: string
): Promise<boolean> {
  const mailOptions = {
    from: `"Ikonex Academy" <${env.gmailUser}>`,
    to: toEmail,
    subject: 'Reset Your Ikonex Academy Password',
    html: `
      <div style="font-family: Arial; max-width:600px;margin:auto;padding:20px;">
        <h2 style="color:#3525cd;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>Use the code below to reset your password:</p>
        <div style="font-size:24px;font-weight:bold;letter-spacing:4px;padding:10px;background:#f1f5f9;text-align:center;">
          ${code}
        </div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };

  return await sendMail(mailOptions);
}

/**
 * VERIFICATION OTP EMAIL
 */
export async function sendVerificationOTPEmail(
  toEmail: string,
  name: string,
  otpCode: string
): Promise<boolean> {
  const mailOptions = {
    from: `"Ikonex Academy" <${env.gmailUser}>`,
    to: toEmail,
    subject: 'Verify Your Account',
    html: `
      <div style="font-family: Arial; max-width:600px;margin:auto;padding:20px;">
        <h2 style="color:#3525cd;">Account Verification</h2>
        <p>Hello ${name},</p>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing:4px;">${otpCode}</h1>
        <p>Expires in 10 minutes.</p>
      </div>
    `,
  };

  return await sendMail(mailOptions);
}

/**
 * LOGIN ALERT EMAIL
 */
export async function sendLoginAlertEmail(
  toEmail: string,
  name: string
): Promise<boolean> {
  const mailOptions = {
    from: `"Ikonex Academy" <${env.gmailUser}>`,
    to: toEmail,
    subject: 'New Login Detected',
    html: `
      <p>Hello ${name},</p>
      <p>A new login was detected on your account.</p>
    `,
  };

  return await sendMail(mailOptions);
}

/**
 * 2FA LOGIN EMAIL
 */
export async function sendTwoFactorLoginEmail(
  toEmail: string,
  name: string,
  code: string
): Promise<boolean> {
  const mailOptions = {
    from: `"Ikonex Academy" <${env.gmailUser}>`,
    to: toEmail,
    subject: 'Your Login Code',
    html: `
      <p>Hello ${name},</p>
      <h2>${code}</h2>
      <p>Expires in 5 minutes.</p>
    `,
  };

  return await sendMail(mailOptions);
}