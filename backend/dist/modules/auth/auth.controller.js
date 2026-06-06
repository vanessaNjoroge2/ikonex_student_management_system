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
exports.AuthController = exports.refreshSchema = exports.registerSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = void 0;
const auth_service_1 = require("./auth.service");
const db_1 = require("../../config/db");
const bcrypt = __importStar(require("bcrypt"));
const response_1 = require("../../utils/response");
const email_1 = require("../../utils/email");
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        code: zod_1.z.string().length(6, 'Verification code must be 6 digits'),
        newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    }),
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
    }),
});
exports.refreshSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string(),
    }),
});
class AuthController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await auth_service_1.AuthService.validateUser(email, password);
            if (!user) {
                return (0, response_1.sendError)(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
            }
            if (!user.isVerified) {
                return (0, response_1.sendError)(res, 'Please verify your email before logging in.', 403, 'UNVERIFIED');
            }
            const token = auth_service_1.AuthService.generateAccessToken(user);
            const refreshToken = auth_service_1.AuthService.generateRefreshToken(user);
            // ✅ FIX: After prisma generate, refreshToken will be recognised
            await db_1.prisma.prismaUser.update({
                where: { id: user.id },
                data: { refreshToken },
            });
            (0, email_1.sendLoginAlertEmail)(user.email, user.name).catch((err) => {
                console.error('Failed to send login email alert:', err);
            });
            return (0, response_1.sendSuccess)(res, {
                token,
                refreshToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            console.log('📬 BACKEND REGISTER ENDPOINT HIT - Request body:', { name, email, password: '***' });
            const user = await auth_service_1.AuthService.registerUser(name, email, password);
            (0, email_1.sendVerificationOTPEmail)(user.email, user.name, user.otpCode).catch((err) => {
                console.error('Failed to send verification email:', err);
            });
            return (0, response_1.sendSuccess)(res, {
                email: user.email,
                message: 'Verification OTP sent to email',
            }, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async sendVerification(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                return (0, response_1.sendError)(res, 'Email is required', 400, 'BAD_REQUEST');
            }
            const user = await db_1.prisma.prismaUser.findUnique({ where: { email } });
            if (!user) {
                return (0, response_1.sendError)(res, 'User not found', 404, 'NOT_FOUND');
            }
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            await db_1.prisma.prismaUser.update({
                where: { id: user.id },
                data: { otpCode, otpExpires },
            });
            (0, email_1.sendVerificationOTPEmail)(user.email, user.name, otpCode).catch((err) => {
                console.error('Failed to send verification email:', err);
            });
            return (0, response_1.sendSuccess)(res, { message: 'Verification OTP code resent successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyEmail(req, res, next) {
        try {
            const { email, code } = req.body;
            if (!email || !code) {
                return (0, response_1.sendError)(res, 'Email and code are required', 400, 'BAD_REQUEST');
            }
            const user = await db_1.prisma.prismaUser.findUnique({ where: { email } });
            if (!user) {
                return (0, response_1.sendError)(res, 'User not found', 404, 'NOT_FOUND');
            }
            if (user.otpCode !== code) {
                return (0, response_1.sendError)(res, 'Incorrect code. Please try again.', 400, 'INVALID_CODE');
            }
            if (user.otpExpires && user.otpExpires < new Date()) {
                return (0, response_1.sendError)(res, 'Code expired. Please request a new one.', 400, 'EXPIRED_CODE');
            }
            await db_1.prisma.prismaUser.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    otpCode: null,
                    otpExpires: null,
                },
            });
            return (0, response_1.sendSuccess)(res, { message: 'Account verified successfully. You can now login.' });
        }
        catch (error) {
            next(error);
        }
    }
    static async sendLoginCode(req, res, next) {
        try {
            const { email, password } = req.body;
            console.log('🔑 BACKEND SEND-LOGIN-CODE ENDPOINT HIT - Request body:', { email, password: '***' });
            if (!email || !password) {
                return (0, response_1.sendError)(res, 'Email and password are required', 400, 'BAD_REQUEST');
            }
            const user = await auth_service_1.AuthService.validateUser(email, password);
            if (!user) {
                return (0, response_1.sendError)(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
            }
            if (!user.isVerified) {
                return (0, response_1.sendError)(res, 'Please verify your email before logging in.', 403, 'UNVERIFIED');
            }
            const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
            const twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000);
            await db_1.prisma.prismaUser.update({
                where: { id: user.id },
                data: { twoFactorCode, twoFactorExpires },
            });
            (0, email_1.sendTwoFactorLoginEmail)(user.email, user.name, twoFactorCode).catch((err) => {
                console.error('Failed to send 2FA email:', err);
            });
            return (0, response_1.sendSuccess)(res, {
                email: user.email,
                message: '2FA login code sent to email',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async adminLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return (0, response_1.sendError)(res, 'Email and password are required', 400, 'BAD_REQUEST');
            }
            const user = await auth_service_1.AuthService.validateUser(email, password);
            if (!user) {
                return (0, response_1.sendError)(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
            }
            if (user.role !== 'ADMIN') {
                return (0, response_1.sendError)(res, 'Access forbidden: Only Administrators are allowed here.', 403, 'FORBIDDEN');
            }
            // ✅ FIX: After prisma generate, isSuspended will be recognised on the user type
            if (user.isSuspended) {
                return (0, response_1.sendError)(res, 'Your account has been suspended. Please contact the administrator.', 403, 'SUSPENDED');
            }
            const token = auth_service_1.AuthService.generateAccessToken(user);
            const refreshToken = auth_service_1.AuthService.generateRefreshToken(user);
            await db_1.prisma.prismaUser.update({
                where: { id: user.id },
                data: { refreshToken },
            });
            // ✅ FIX: Prisma auto-camelCases model names: LoginActivity → loginActivity
            await db_1.prisma.loginActivity.create({
                data: {
                    userId: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            }).catch((err) => console.error('Failed to log login activity:', err));
            (0, email_1.sendLoginAlertEmail)(user.email, user.name).catch((err) => {
                console.error('Failed to send login email alert:', err);
            });
            return (0, response_1.sendSuccess)(res, {
                token,
                refreshToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyLoginCode(req, res, next) {
        try {
            const { email, code } = req.body;
            if (!email || !code) {
                return (0, response_1.sendError)(res, 'Email and code are required', 400, 'BAD_REQUEST');
            }
            const user = await db_1.prisma.prismaUser.findUnique({ where: { email } });
            if (!user) {
                return (0, response_1.sendError)(res, 'User not found', 404, 'NOT_FOUND');
            }
            // ✅ FIX: isSuspended recognised after prisma generate
            if (user.isSuspended) {
                return (0, response_1.sendError)(res, 'Your account has been suspended. Please contact the administrator.', 403, 'SUSPENDED');
            }
            if (user.twoFactorCode !== code) {
                return (0, response_1.sendError)(res, 'Incorrect code. Please try again.', 400, 'INVALID_CODE');
            }
            if (user.twoFactorExpires && user.twoFactorExpires < new Date()) {
                return (0, response_1.sendError)(res, 'Code expired. Please request a new one.', 400, 'EXPIRED_CODE');
            }
            const updatedUser = await db_1.prisma.prismaUser.update({
                where: { id: user.id },
                data: {
                    twoFactorCode: null,
                    twoFactorExpires: null,
                },
            });
            const token = auth_service_1.AuthService.generateAccessToken(updatedUser);
            const refreshToken = auth_service_1.AuthService.generateRefreshToken(updatedUser);
            await db_1.prisma.prismaUser.update({
                where: { id: updatedUser.id },
                data: { refreshToken },
            });
            // ✅ FIX: Correct Prisma model accessor + typed catch
            await db_1.prisma.loginActivity.create({
                data: {
                    userId: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    role: updatedUser.role,
                },
            }).catch((err) => console.error('Failed to log login activity:', err));
            (0, email_1.sendLoginAlertEmail)(updatedUser.email, updatedUser.name).catch((err) => {
                console.error('Failed to send login email alert:', err);
            });
            return (0, response_1.sendSuccess)(res, {
                token,
                refreshToken,
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const decoded = auth_service_1.AuthService.verifyRefreshToken(refreshToken);
            if (!decoded) {
                return (0, response_1.sendError)(res, 'Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
            }
            const dbUser = await db_1.prisma.prismaUser.findUnique({ where: { id: decoded.id } });
            // ✅ FIX: refreshToken field recognised after prisma generate
            if (!dbUser || dbUser.refreshToken !== refreshToken) {
                return (0, response_1.sendError)(res, 'Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
            }
            const token = auth_service_1.AuthService.generateAccessToken(dbUser);
            const newRefreshToken = auth_service_1.AuthService.generateRefreshToken(dbUser);
            await db_1.prisma.prismaUser.update({
                where: { id: dbUser.id },
                data: { refreshToken: newRefreshToken },
            });
            return (0, response_1.sendSuccess)(res, {
                token,
                refreshToken: newRefreshToken,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            if (req.user) {
                await db_1.prisma.prismaUser.update({
                    where: { id: req.user.id },
                    data: { refreshToken: null },
                });
            }
            return (0, response_1.sendSuccess)(res, { message: 'Logged out successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const user = await db_1.prisma.prismaUser.findUnique({ where: { email } });
            if (!user) {
                return (0, response_1.sendError)(res, 'No user found with this email address.', 404, 'NOT_FOUND');
            }
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await db_1.prisma.prismaUser.update({
                where: { id: user.id },
                data: { otpCode, otpExpires },
            });
            (0, email_1.sendPasswordResetEmail)(user.email, user.name, otpCode).catch((err) => {
                console.error('Failed to send password reset email:', err);
            });
            return (0, response_1.sendSuccess)(res, { message: 'Password reset code has been sent to your email.' });
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const { email, code, newPassword } = req.body;
            const user = await db_1.prisma.prismaUser.findUnique({ where: { email } });
            if (!user) {
                return (0, response_1.sendError)(res, 'No user found with this email address.', 404, 'NOT_FOUND');
            }
            if (user.otpCode !== code) {
                return (0, response_1.sendError)(res, 'Incorrect verification code. Please check and try again.', 400, 'INVALID_CODE');
            }
            if (user.otpExpires && user.otpExpires < new Date()) {
                return (0, response_1.sendError)(res, 'Verification code has expired. Please request a new one.', 400, 'EXPIRED_CODE');
            }
            // Hash new password using bcrypt
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await db_1.prisma.prismaUser.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    otpCode: null,
                    otpExpires: null,
                },
            });
            return (0, response_1.sendSuccess)(res, { message: 'Your password has been reset successfully. You can now login.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
