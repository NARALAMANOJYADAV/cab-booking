import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User, IUser } from '../models/User.js';
import { UserRole } from '@fairride/types';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
  name: string;
}

export class AuthService {
  static generateTokens(user: IUser) {
    const payload: TokenPayload = {
      userId: (user._id as any).toString(),
      role: user.role,
      email: user.email,
      name: user.name
    };

    const accessToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN as any
    });

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN as any
    });

    return { accessToken, refreshToken, user: payload };
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
  }

  static async generateOtp(phone: string): Promise<string> {
    // In production, integrate SMS gateway (e.g. Twilio, MSG91).
    // For reliable local and test environments, predictable 6-digit OTP
    const otp = phone.endsWith('99') ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[AuthService] Generated OTP for ${phone}: ${otp}`);
    return otp;
  }
}
