"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.sendVerificationOTPEmail = sendVerificationOTPEmail;
exports.sendLoginAlertEmail = sendLoginAlertEmail;
exports.sendTwoFactorLoginEmail = sendTwoFactorLoginEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
/**
 * Create reusable SMTP transporter
 */
const createTransporter = () => {
    if (!env_1.env.gmailUser || !env_1.env.gmailAppPassword) {
        console.warn('Email not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing). Falling back to console logs.');
        return null;
    }
    const password = env_1.env.gmailAppPassword.replace(/\s+/g, '');
    return nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // MUST be false for port 587 (STARTTLS)
        auth: {
            user: env_1.env.gmailUser,
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
const sendMail = async (mailOptions) => {
    try {
        // 1. Check if Resend API Key is configured (Preferred for production / bypasses Render SMTP block)
        const resendApiKey = env_1.env.resendApiKey;
        if (resendApiKey) {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'Ikonex Academy <onboarding@resend.dev>', // Resend free tier default sender
                    to: mailOptions.to,
                    subject: mailOptions.subject,
                    html: mailOptions.html,
                }),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Resend API returned status ${response.status}: ${errText}`);
            }
            return true;
        }
        // 2. Fallback to Nodemailer SMTP
        if (!transporter) {
            console.log(' [Mock Email]', mailOptions);
            return true;
        }
        await transporter.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        console.error('⚠️ Email sending failed! Falling back to console log. Error:', error.message || error);
        console.log(' [Mock Email Fallback]', mailOptions);
        // Return true so the API doesn't throw 500 / fail, allowing the user to read the code in the logs
        return true;
    }
};
/**
 * PASSWORD RESET EMAIL
 */
async function sendPasswordResetEmail(toEmail, name, code) {
    const mailOptions = {
        from: `"Ikonex Academy" <${env_1.env.gmailUser}>`,
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
async function sendVerificationOTPEmail(toEmail, name, otpCode) {
    const mailOptions = {
        from: `"Ikonex Academy" <${env_1.env.gmailUser}>`,
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
async function sendLoginAlertEmail(toEmail, name) {
    const mailOptions = {
        from: `"Ikonex Academy" <${env_1.env.gmailUser}>`,
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
async function sendTwoFactorLoginEmail(toEmail, name, code) {
    const mailOptions = {
        from: `"Ikonex Academy" <${env_1.env.gmailUser}>`,
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
