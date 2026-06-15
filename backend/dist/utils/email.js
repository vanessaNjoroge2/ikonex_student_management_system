"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendLoginAlertEmail = sendLoginAlertEmail;
exports.sendVerificationOTPEmail = sendVerificationOTPEmail;
exports.sendTwoFactorLoginEmail = sendTwoFactorLoginEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
// Create a transporter using Gmail SMTP
const createTransporter = () => {
    if (!env_1.env.gmailUser || !env_1.env.gmailAppPassword) {
        console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not configured. Emails will be logged to console instead of being sent.');
        return null;
    }
    // Strip spaces from App Password (e.g. "xxxx xxxx xxxx xxxx" -> "xxxxxxxxxxxxxxxx")
    const password = env_1.env.gmailAppPassword.replace(/\s+/g, '');
    return nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: env_1.env.gmailUser,
            pass: password,
        },
    });
};
const transporter = createTransporter();
/**
 * Sends a welcome email to a newly registered user
 */
async function sendWelcomeEmail(toEmail, name) {
    const mailOptions = {
        from: `"Ikonex Academy" <${env_1.env.gmailUser || 'noreply@ikonex.edu'}>`,
        to: toEmail,
        subject: 'Welcome to Ikonex Academy!',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-2xl; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #3525cd; margin: 0; font-size: 24px; font-weight: 800; tracking-tight: -0.025em;">Ikonex Academy</h2>
          <p style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Official Registry Notification</p>
        </div>
        <div style="color: #334155; font-size: 14px; line-height: 1.6;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Welcome to <strong>Ikonex Academy Student Management System</strong>! Your account has been registered successfully as an Administrator.</p>
          <p>With this portal, you can now seamlessly manage cohort streams, input student records, assign subjects, and generate comprehensive performance reports.</p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${env_1.env.frontendUrl}/login" style="background-color: #3525cd; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 12px; display: inline-block;">Access your Dashboard</a>
          </div>
          <p style="font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
            If you did not authorize this registration, please contact system administration immediately.
          </p>
        </div>
      </div>
    `,
    };
    try {
        if (transporter) {
            await transporter.sendMail(mailOptions);
            console.log(`📩 Welcome email sent successfully to ${toEmail}`);
            return true;
        }
        else {
            console.log(`✉️ [Mock Email - Welcome] To: ${toEmail}, Name: ${name}`);
            return true;
        }
    }
    catch (error) {
        console.error(`❌ Failed to send welcome email to ${toEmail}:`, error);
        return false;
    }
}
/**
 * Sends a notification email on successful login
 */
async function sendLoginAlertEmail(toEmail, name) {
    const timestamp = new Date().toLocaleString();
    const mailOptions = {
        from: `"Ikonex Academy" <${env_1.env.gmailUser || 'noreply@ikonex.edu'}>`,
        to: toEmail,
        subject: 'Security Alert: New Sign-in Detected',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-2xl; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #e11d48; margin: 0; font-size: 20px; font-weight: 800;">Security Alert</h2>
          <p style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Ikonex Academy Access Log</p>
        </div>
        <div style="color: #334155; font-size: 14px; line-height: 1.6;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>A new sign-in was successfully processed for your account on <strong>${timestamp}</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 12px; background-color: #f8fafc; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #475569; width: 30%;">Account</td>
              <td style="padding: 10px 14px; color: #0f172a;">${toEmail}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #475569;">Time</td>
              <td style="padding: 10px 14px; color: #0f172a;">${timestamp}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #475569;">Access Link</td>
              <td style="padding: 10px 14px; color: #0f172a;">${env_1.env.frontendUrl}/dashboard</td>
            </tr>
          </table>

          <p style="font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
            If this was you, you can safely ignore this email. If you did not perform this login, please change your password or contact system administration immediately to protect your credentials.
          </p>
        </div>
      </div>
    `,
    };
    try {
        if (transporter) {
            await transporter.sendMail(mailOptions);
            console.log(`📩 Login alert email sent successfully to ${toEmail}`);
            return true;
        }
        else {
            console.log(`✉️ [Mock Email - Login Alert] To: ${toEmail}, Name: ${name}`);
            return true;
        }
    }
    catch (error) {
        console.error(`❌ Failed to send login alert email to ${toEmail}:`, error);
        return false;
    }
}
/**
 * Sends a verification code (OTP) to a newly registered teacher
 */
async function sendVerificationOTPEmail(toEmail, name, otpCode) {
    const mailOptions = {
        from: `"Ikonex Academy" <${env_1.env.gmailUser || 'noreply@ikonex.edu'}>`,
        to: toEmail,
        subject: 'Verify Your Ikonex Academy Account',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #3525cd; margin: 0; font-size: 24px; font-weight: 800;">Ikonex Academy</h2>
          <p style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Official Verification Registry</p>
        </div>
        <div style="color: #334155; font-size: 14px; line-height: 1.6;">
          <p>Hello ${name},</p>
          <p>Your verification code is: <strong style="font-size: 22px; color: #3525cd; letter-spacing: 2px;">${otpCode}</strong></p>
          <p>This code expires in 10 minutes.</p>
          <p>If you did not create this account, ignore this email.</p>
        </div>
      </div>
    `,
    };
    try {
        if (transporter) {
            await transporter.sendMail(mailOptions);
            console.log(`📩 Verification OTP email sent successfully to ${toEmail}`);
            return true;
        }
        else {
            console.log(`✉️ [Mock Email - Verification OTP] To: ${toEmail}, Name: ${name}, OTP: ${otpCode}`);
            return true;
        }
    }
    catch (error) {
        console.error(`❌ Failed to send verification OTP to ${toEmail}:`, error);
        console.log(`✉️ [Fallback - Verification OTP] To: ${toEmail}, Name: ${name}, OTP: ${otpCode}`);
        return true;
    }
}
/**
 * Sends a 2FA login code to a verified teacher attempting sign-in
 */
async function sendTwoFactorLoginEmail(toEmail, name, code) {
    const mailOptions = {
        from: `"Ikonex Academy" <${env_1.env.gmailUser || 'noreply@ikonex.edu'}>`,
        to: toEmail,
        subject: 'Your Ikonex Academy Login Code',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #3525cd; margin: 0; font-size: 24px; font-weight: 800;">Ikonex Academy</h2>
          <p style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Security Verification Log</p>
        </div>
        <div style="color: #334155; font-size: 14px; line-height: 1.6;">
          <p>Hello ${name},</p>
          <p>Your login code is: <strong style="font-size: 22px; color: #3525cd; letter-spacing: 2px;">${code}</strong></p>
          <p>This code expires in 5 minutes.</p>
          <p>If you did not attempt to log in, please secure your account immediately.</p>
        </div>
      </div>
    `,
    };
    try {
        if (transporter) {
            await transporter.sendMail(mailOptions);
            console.log(`📩 2FA login email sent successfully to ${toEmail}`);
            return true;
        }
        else {
            console.log(`✉️ [Mock Email - 2FA Login] To: ${toEmail}, Name: ${name}, Code: ${code}`);
            return true;
        }
    }
    catch (error) {
        console.error(`❌ Failed to send 2FA login email to ${toEmail}:`, error);
        console.log(`✉️ [Fallback - 2FA Login] To: ${toEmail}, Name: ${name}, Code: ${code}`);
        return true;
    }
}
async function sendPasswordResetEmail(toEmail, name, code) {
    const mailOptions = {
        from: `"Ikonex Academy" <${env_1.env.gmailUser || 'noreply@ikonex.edu'}>`,
        to: toEmail,
        subject: 'Reset Your Ikonex Academy Password',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #3525cd; margin: 0; font-size: 24px; font-weight: 800;">Ikonex Academy</h2>
          <p style="color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0 0;">Password Recovery Log</p>
        </div>
        <div style="color: #334155; font-size: 14px; line-height: 1.6;">
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Use the following recovery code to complete the reset process:</p>
          <p style="text-align: center; margin: 24px 0;">
            <span style="font-size: 24px; font-weight: 800; color: #3525cd; letter-spacing: 4px; padding: 10px 20px; background-color: #f1f5f9; border-radius: 8px; display: inline-block;">${code}</span>
          </p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      </div>
    `,
    };
    try {
        if (transporter) {
            await transporter.sendMail(mailOptions);
            console.log(`📩 Password reset email sent successfully to ${toEmail}`);
            return true;
        }
        else {
            console.log(`✉️ [Mock Email - Password Reset] To: ${toEmail}, Name: ${name}, Code: ${code}`);
            return true;
        }
    }
    catch (error) {
        console.error(`❌ Failed to send password reset email to ${toEmail}:`, error);
        console.log(`✉️ [Fallback - Password Reset] To: ${toEmail}, Name: ${name}, Code: ${code}`);
        return true;
    }
}
