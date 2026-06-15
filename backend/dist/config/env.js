"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.join(__dirname, '../../.env') });
const cleanEnvVar = (val) => {
    if (!val)
        return '';
    let cleaned = val.trim();
    // Remove surrounding double or single quotes
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    return cleaned.trim();
};
exports.env = {
    port: parseInt(cleanEnvVar(process.env.PORT) || '3001', 10),
    databaseUrl: cleanEnvVar(process.env.DATABASE_URL),
    jwtSecret: cleanEnvVar(process.env.JWT_SECRET) || 'super_secret_key_change_me_in_production',
    jwtRefreshSecret: cleanEnvVar(process.env.JWT_REFRESH_SECRET) || 'another_super_secret_key_change_me_in_production',
    gmailUser: cleanEnvVar(process.env.GMAIL_USER),
    gmailAppPassword: cleanEnvVar(process.env.GMAIL_APP_PASSWORD),
    frontendUrl: cleanEnvVar(process.env.FRONTEND_URL) || 'http://localhost:5173',
    resendApiKey: cleanEnvVar(process.env.RESEND_API_KEY),
};
