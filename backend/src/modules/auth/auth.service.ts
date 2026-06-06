import { prisma } from '../../config/db';
import { env } from '../../config/env';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export class AuthService {
  static async validateUser(email: string, passwordHash: string) {
    const user = await prisma.prismaUser.findUnique({ where: { email } });
    if (!user) return null;
    if (user.isSuspended) {
      const err = new Error('Your account has been suspended. Please contact the administrator.') as any;
      err.statusCode = 403;
      err.code = 'SUSPENDED';
      throw err;
    }
    const isValid = await bcrypt.compare(passwordHash, user.password);
    if (!isValid) return null;
    return user;
  }

  static async registerUser(name: string, email: string, passwordPlain: string, role: Role = Role.TEACHER) {
    const existing = await prisma.prismaUser.findUnique({ where: { email } });
    if (existing) {
      const err = new Error('Email is already registered');
      (err as any).statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(passwordPlain, salt);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.prismaUser.create({
      data: {
        name,
        email,
        password,
        role,
        isVerified: false,
        otpCode,
        otpExpires,
      },
    });

    return user;
  }

  static generateAccessToken(user: { id: string; email: string; role: Role }) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: '15m' }
    );
  }

  static generateRefreshToken(user: { id: string; email: string; role: Role }) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwtRefreshSecret,
      { expiresIn: '7d' }
    );
  }

  static verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, env.jwtRefreshSecret) as {
        id: string;
        email: string;
        role: Role;
      };
    } catch (e) {
      return null;
    }
  }
}
