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
exports.AccountsController = exports.updateProfileSchema = exports.resetPasswordSchema = exports.updateAccountSchema = exports.createAccountSchema = void 0;
const db_1 = require("../../config/db");
const response_1 = require("../../utils/response");
const bcrypt = __importStar(require("bcrypt"));
const zod_1 = require("zod");
exports.createAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        role: zod_1.z.enum(['ADMIN', 'TEACHER', 'STUDENT'], {
            message: 'Role must be ADMIN, TEACHER, or STUDENT'
        }),
    }),
});
exports.updateAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email('Invalid email address').optional(),
        role: zod_1.z.enum(['ADMIN', 'TEACHER', 'STUDENT'], {
            message: 'Role must be ADMIN, TEACHER, or STUDENT'
        }).optional(),
        isSuspended: zod_1.z.boolean().optional(),
    }).partial(),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email('Invalid email address').optional(),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional(),
    }).partial(),
});
class AccountsController {
    static async list(req, res, next) {
        try {
            const accounts = await db_1.prisma.prismaUser.findMany({
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isSuspended: true,
                    createdAt: true,
                },
            });
            return (0, response_1.sendSuccess)(res, accounts);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const { name, email, password, role } = req.body;
            const existing = await db_1.prisma.prismaUser.findUnique({ where: { email } });
            if (existing) {
                return (0, response_1.sendError)(res, 'Email is already in use', 409, 'CONFLICT');
            }
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            const user = await db_1.prisma.prismaUser.create({
                data: {
                    name,
                    email,
                    password: passwordHash,
                    role,
                    isVerified: true, // Auto verify created accounts
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isSuspended: true,
                    createdAt: true,
                },
            });
            return (0, response_1.sendSuccess)(res, user, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const id = req.params.id;
            const { name, email, role, isSuspended } = req.body;
            const account = await db_1.prisma.prismaUser.findUnique({ where: { id } });
            if (!account) {
                return (0, response_1.sendError)(res, 'Account not found', 404, 'NOT_FOUND');
            }
            if (email && email !== account.email) {
                const existing = await db_1.prisma.prismaUser.findUnique({ where: { email } });
                if (existing) {
                    return (0, response_1.sendError)(res, 'Email is already in use', 409, 'CONFLICT');
                }
            }
            const updated = await db_1.prisma.prismaUser.update({
                where: { id },
                data: {
                    name,
                    email,
                    role,
                    isSuspended,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isSuspended: true,
                    createdAt: true,
                },
            });
            return (0, response_1.sendSuccess)(res, updated);
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const id = req.params.id;
            const { password } = req.body;
            const account = await db_1.prisma.prismaUser.findUnique({ where: { id } });
            if (!account) {
                return (0, response_1.sendError)(res, 'Account not found', 404, 'NOT_FOUND');
            }
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            await db_1.prisma.prismaUser.update({
                where: { id },
                data: { password: passwordHash },
            });
            return (0, response_1.sendSuccess)(res, { message: 'Password reset successful' });
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const id = req.params.id;
            const account = await db_1.prisma.prismaUser.findUnique({ where: { id } });
            if (!account) {
                return (0, response_1.sendError)(res, 'Account not found', 404, 'NOT_FOUND');
            }
            if (account.id === req.user.id) {
                return (0, response_1.sendError)(res, 'You cannot delete your own account', 400, 'BAD_REQUEST');
            }
            await db_1.prisma.prismaUser.delete({ where: { id } });
            return (0, response_1.sendSuccess)(res, { id, message: 'Account deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getLogs(req, res, next) {
        try {
            const logs = await db_1.prisma.loginActivity.findMany({
                orderBy: { timestamp: 'desc' },
                take: 100, // Limit to recent 100 activities
            });
            return (0, response_1.sendSuccess)(res, logs);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { name, email, password } = req.body;
            const account = await db_1.prisma.prismaUser.findUnique({ where: { id: userId } });
            if (!account) {
                return (0, response_1.sendError)(res, 'Profile not found', 404, 'NOT_FOUND');
            }
            const updateData = {};
            if (name)
                updateData.name = name;
            if (email && email !== account.email) {
                const existing = await db_1.prisma.prismaUser.findUnique({ where: { email } });
                if (existing) {
                    return (0, response_1.sendError)(res, 'Email is already in use', 409, 'CONFLICT');
                }
                updateData.email = email;
            }
            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(password, salt);
            }
            const updated = await db_1.prisma.prismaUser.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isSuspended: true,
                    createdAt: true,
                },
            });
            return (0, response_1.sendSuccess)(res, updated);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AccountsController = AccountsController;
