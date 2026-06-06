import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { prisma } from '../../config/db';
import * as bcrypt from 'bcrypt';
import { sendSuccess, sendError } from '../../utils/response';
import { sendLoginAlertEmail, sendVerificationOTPEmail, sendTwoFactorLoginEmail, sendPasswordResetEmail } from '../../utils/email';
import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Verification code must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email, password } = req.body;
      const user = await AuthService.validateUser(email, password);
      if (!user) {
        return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      if (!user.isVerified) {
        return sendError(res, 'Please verify your email before logging in.', 403, 'UNVERIFIED');
      }

      const token = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      // ✅ FIX: After prisma generate, refreshToken will be recognised
      await prisma.prismaUser.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      sendLoginAlertEmail(user.email, user.name).catch((err: unknown) => {
        console.error('Failed to send login email alert:', err);
      });

      return sendSuccess(res, {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { name, email, password } = req.body;
      console.log('📬 BACKEND REGISTER ENDPOINT HIT - Request body:', { name, email, password: '***' });
      const user = await AuthService.registerUser(name, email, password);

      sendVerificationOTPEmail(user.email, user.name, user.otpCode!).catch((err: unknown) => {
        console.error('Failed to send verification email:', err);
      });

      return sendSuccess(res, {
        email: user.email,
        message: 'Verification OTP sent to email',
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async sendVerification(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email } = req.body;
      if (!email) {
        return sendError(res, 'Email is required', 400, 'BAD_REQUEST');
      }

      const user = await prisma.prismaUser.findUnique({ where: { email } });
      if (!user) {
        return sendError(res, 'User not found', 404, 'NOT_FOUND');
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.prismaUser.update({
        where: { id: user.id },
        data: { otpCode, otpExpires },
      });

      sendVerificationOTPEmail(user.email, user.name, otpCode).catch((err: unknown) => {
        console.error('Failed to send verification email:', err);
      });

      return sendSuccess(res, { message: 'Verification OTP code resent successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return sendError(res, 'Email and code are required', 400, 'BAD_REQUEST');
      }

      const user = await prisma.prismaUser.findUnique({ where: { email } });
      if (!user) {
        return sendError(res, 'User not found', 404, 'NOT_FOUND');
      }

      if (user.otpCode !== code) {
        return sendError(res, 'Incorrect code. Please try again.', 400, 'INVALID_CODE');
      }

      if (user.otpExpires && user.otpExpires < new Date()) {
        return sendError(res, 'Code expired. Please request a new one.', 400, 'EXPIRED_CODE');
      }

      await prisma.prismaUser.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          otpCode: null,
          otpExpires: null,
        },
      });

      return sendSuccess(res, { message: 'Account verified successfully. You can now login.' });
    } catch (error) {
      next(error);
    }
  }

  static async sendLoginCode(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email, password } = req.body;
      console.log('🔑 BACKEND SEND-LOGIN-CODE ENDPOINT HIT - Request body:', { email, password: '***' });
      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400, 'BAD_REQUEST');
      }

      const user = await AuthService.validateUser(email, password);
      if (!user) {
        return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      if (!user.isVerified) {
        return sendError(res, 'Please verify your email before logging in.', 403, 'UNVERIFIED');
      }

      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      const twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.prismaUser.update({
        where: { id: user.id },
        data: { twoFactorCode, twoFactorExpires },
      });

      sendTwoFactorLoginEmail(user.email, user.name, twoFactorCode).catch((err: unknown) => {
        console.error('Failed to send 2FA email:', err);
      });

      return sendSuccess(res, {
        email: user.email,
        message: '2FA login code sent to email',
      });
    } catch (error) {
      next(error);
    }
  }

  static async adminLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400, 'BAD_REQUEST');
      }

      const user = await AuthService.validateUser(email, password);
      if (!user) {
        return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      if (user.role !== 'ADMIN') {
        return sendError(res, 'Access forbidden: Only Administrators are allowed here.', 403, 'FORBIDDEN');
      }

      // ✅ FIX: After prisma generate, isSuspended will be recognised on the user type
      if (user.isSuspended) {
        return sendError(res, 'Your account has been suspended. Please contact the administrator.', 403, 'SUSPENDED');
      }

      const token = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      await prisma.prismaUser.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      // ✅ FIX: Prisma auto-camelCases model names: LoginActivity → loginActivity
      await prisma.loginActivity.create({
        data: {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      }).catch((err: unknown) => console.error('Failed to log login activity:', err));

      sendLoginAlertEmail(user.email, user.name).catch((err: unknown) => {
        console.error('Failed to send login email alert:', err);
      });

      return sendSuccess(res, {
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyLoginCode(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return sendError(res, 'Email and code are required', 400, 'BAD_REQUEST');
      }

      const user = await prisma.prismaUser.findUnique({ where: { email } });
      if (!user) {
        return sendError(res, 'User not found', 404, 'NOT_FOUND');
      }

      // ✅ FIX: isSuspended recognised after prisma generate
      if (user.isSuspended) {
        return sendError(res, 'Your account has been suspended. Please contact the administrator.', 403, 'SUSPENDED');
      }

      if (user.twoFactorCode !== code) {
        return sendError(res, 'Incorrect code. Please try again.', 400, 'INVALID_CODE');
      }

      if (user.twoFactorExpires && user.twoFactorExpires < new Date()) {
        return sendError(res, 'Code expired. Please request a new one.', 400, 'EXPIRED_CODE');
      }

      const updatedUser = await prisma.prismaUser.update({
        where: { id: user.id },
        data: {
          twoFactorCode: null,
          twoFactorExpires: null,
        },
      });

      const token = AuthService.generateAccessToken(updatedUser);
      const refreshToken = AuthService.generateRefreshToken(updatedUser);

      await prisma.prismaUser.update({
        where: { id: updatedUser.id },
        data: { refreshToken },
      });

      // ✅ FIX: Correct Prisma model accessor + typed catch
      await prisma.loginActivity.create({
        data: {
          userId: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      }).catch((err: unknown) => console.error('Failed to log login activity:', err));

      sendLoginAlertEmail(updatedUser.email, updatedUser.name).catch((err: unknown) => {
        console.error('Failed to send login email alert:', err);
      });

      return sendSuccess(res, {
        token,
        refreshToken,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { refreshToken } = req.body;
      const decoded = AuthService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return sendError(res, 'Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      const dbUser = await prisma.prismaUser.findUnique({ where: { id: decoded.id } });

      // ✅ FIX: refreshToken field recognised after prisma generate
      if (!dbUser || dbUser.refreshToken !== refreshToken) {
        return sendError(res, 'Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      const token = AuthService.generateAccessToken(dbUser);
      const newRefreshToken = AuthService.generateRefreshToken(dbUser);

      await prisma.prismaUser.update({
        where: { id: dbUser.id },
        data: { refreshToken: newRefreshToken },
      });

      return sendSuccess(res, {
        token,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      if (req.user) {
        await prisma.prismaUser.update({
          where: { id: req.user.id },
          data: { refreshToken: null },
        });
      }
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email } = req.body;
      const user = await prisma.prismaUser.findUnique({ where: { email } });
      if (!user) {
        return sendError(res, 'No user found with this email address.', 404, 'NOT_FOUND');
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.prismaUser.update({
        where: { id: user.id },
        data: { otpCode, otpExpires },
      });

      sendPasswordResetEmail(user.email, user.name, otpCode).catch((err: unknown) => {
        console.error('Failed to send password reset email:', err);
      });

      return sendSuccess(res, { message: 'Password reset code has been sent to your email.' });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email, code, newPassword } = req.body;
      const user = await prisma.prismaUser.findUnique({ where: { email } });
      if (!user) {
        return sendError(res, 'No user found with this email address.', 404, 'NOT_FOUND');
      }

      if (user.otpCode !== code) {
        return sendError(res, 'Incorrect verification code. Please check and try again.', 400, 'INVALID_CODE');
      }

      if (user.otpExpires && user.otpExpires < new Date()) {
        return sendError(res, 'Verification code has expired. Please request a new one.', 400, 'EXPIRED_CODE');
      }

      // Hash new password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.prismaUser.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          otpCode: null,
          otpExpires: null,
        },
      });

      return sendSuccess(res, { message: 'Your password has been reset successfully. You can now login.' });
    } catch (error) {
      next(error);
    }
  }
}