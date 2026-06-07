import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import { Role } from '@prisma/client';

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'TEACHER', 'STUDENT'], {
      message: 'Role must be ADMIN, TEACHER, or STUDENT'
    }),
  }),
});

export const updateAccountSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    role: z.enum(['ADMIN', 'TEACHER', 'STUDENT'], {
      message: 'Role must be ADMIN, TEACHER, or STUDENT'
    }).optional(),
    isSuspended: z.boolean().optional(),
  }).partial(),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  }).partial(),
});

export class AccountsController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const accounts = await prisma.prismaUser.findMany({
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
      return sendSuccess(res, accounts);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { name, email, password, role } = req.body;

      const normalizedEmail = email.toLowerCase().trim();
      const existing = await prisma.prismaUser.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return sendError(res, 'Email is already in use', 409, 'CONFLICT');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await prisma.prismaUser.create({
        data: {
          name,
          email: normalizedEmail,
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

      return sendSuccess(res, user, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const id = req.params.id as string;
      const { name, email, role, isSuspended } = req.body;

      const account = await prisma.prismaUser.findUnique({ where: { id } });
      if (!account) {
        return sendError(res, 'Account not found', 404, 'NOT_FOUND');
      }

      const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
      if (normalizedEmail && normalizedEmail !== account.email) {
        const existing = await prisma.prismaUser.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
          return sendError(res, 'Email is already in use', 409, 'CONFLICT');
        }
      }

      const updated = await prisma.prismaUser.update({
        where: { id },
        data: {
          name,
          email: normalizedEmail,
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

      return sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const id = req.params.id as string;
      const { password } = req.body;

      const account = await prisma.prismaUser.findUnique({ where: { id } });
      if (!account) {
        return sendError(res, 'Account not found', 404, 'NOT_FOUND');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      await prisma.prismaUser.update({
        where: { id },
        data: { password: passwordHash },
      });

      return sendSuccess(res, { message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const id = req.params.id as string;

      const account = await prisma.prismaUser.findUnique({ where: { id } });
      if (!account) {
        return sendError(res, 'Account not found', 404, 'NOT_FOUND');
      }

      if (account.id === req.user!.id) {
        return sendError(res, 'You cannot delete your own account', 400, 'BAD_REQUEST');
      }

      await prisma.prismaUser.delete({ where: { id } });
      return sendSuccess(res, { id, message: 'Account deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getLogs(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const logs = await prisma.loginActivity.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100, // Limit to recent 100 activities
      });
      return sendSuccess(res, logs);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.id;
      const { name, email, password } = req.body;

      const account = await prisma.prismaUser.findUnique({ where: { id: userId } });
      if (!account) {
        return sendError(res, 'Profile not found', 404, 'NOT_FOUND');
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) {
        const normalizedEmail = email.toLowerCase().trim();
        if (normalizedEmail !== account.email) {
          const existing = await prisma.prismaUser.findUnique({ where: { email: normalizedEmail } });
          if (existing) {
            return sendError(res, 'Email is already in use', 409, 'CONFLICT');
          }
          updateData.email = normalizedEmail;
        }
      }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      const updated = await prisma.prismaUser.update({
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

      return sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }
}
