import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanEnvVar = (val: string | undefined): string => {
  if (!val) return '';
  let cleaned = val.trim();
  // Remove surrounding double or single quotes
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
};

export const env = {
  port: parseInt(cleanEnvVar(process.env.PORT) || '3001', 10),
  databaseUrl: cleanEnvVar(process.env.DATABASE_URL),
  jwtSecret: cleanEnvVar(process.env.JWT_SECRET) || 'super_secret_key_change_me_in_production',
  jwtRefreshSecret: cleanEnvVar(process.env.JWT_REFRESH_SECRET) || 'another_super_secret_key_change_me_in_production',
  gmailUser: cleanEnvVar(process.env.GMAIL_USER),
  gmailAppPassword: cleanEnvVar(process.env.GMAIL_APP_PASSWORD),
  frontendUrl: cleanEnvVar(process.env.FRONTEND_URL) || 'http://localhost:5173',
  resendApiKey: cleanEnvVar(process.env.RESEND_API_KEY),
  emailJsServiceId: cleanEnvVar(process.env.EMAILJS_SERVICE_ID),
  emailJsTemplateId: cleanEnvVar(process.env.EMAILJS_TEMPLATE_ID),
  emailJsPublicKey: cleanEnvVar(process.env.EMAILJS_PUBLIC_KEY),
  emailJsPrivateKey: cleanEnvVar(process.env.EMAILJS_PRIVATE_KEY),
  googleScriptUrl: cleanEnvVar(process.env.GOOGLE_SCRIPT_URL),
};

