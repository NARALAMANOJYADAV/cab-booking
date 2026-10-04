import { Router, Request, Response } from 'express';
import { User, Wallet, FairPoint } from '../models/index.js';
import { AuthService } from '../services/auth.service.js';
import { SmsService } from '../services/sms.service.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/error.middleware.js';
import { RegisterUserSchema, LoginSchema, SendOtpSchema, VerifyOtpSchema } from '@fairride/validation';
import { v4 as uuidv4 } from 'uuid';
import { syncUserToSupabase } from '../services/supabaseSync.service.js';

export const authRouter = Router();

// In-memory OTP storage for rapid OTP simulation and testing
const activeOtps = new Map<string, string>();

/**
 * Register User
 */
authRouter.post('/register', validate(RegisterUserSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role, referralCode } = req.body;
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const standardPhone = cleanDigits.length >= 10 ? `+91${cleanDigits}` : phone.trim();

    const existing = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { phone: standardPhone },
        { phone: cleanDigits },
        { phone: phone.trim() }
      ]
    });

    if (existing) {
      // If user exists without a password or was created via OTP test with placeholder email, upgrade them
      if (!existing.password || existing.email.includes('@fairride.local')) {
        existing.name = name;
        existing.email = email.toLowerCase().trim();
        existing.phone = standardPhone;
        existing.password = password;
        existing.isVerified = true;
        if (role) existing.role = role;
        await existing.save();
        await syncUserToSupabase(existing).catch(() => {});

        const tokens = AuthService.generateTokens(existing);
        res.status(200).json({
          success: true,
          message: 'Account updated and registered successfully',
          data: tokens
        });
        return;
      }

      res.status(400).json({
        success: false,
        code: 'USER_ALREADY_EXISTS',
        message: 'An account with this email or phone number already exists. Please log in.'
      });
      return;
    }

    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const newReferralCode = `FR${name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase()}${uniqueSuffix}`;

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone: standardPhone,
      password,
      role: role || 'PASSENGER',
      referralCode: newReferralCode,
      referredBy: referralCode,
      isVerified: true
    });

    // Create wallet & fairpoint accounts
    await Wallet.create({
      userId: user._id,
      userRole: user.role,
      balance: user.role === 'PASSENGER' ? 100 : 0 // ₹100 welcome bonus for new passengers
    });

    await FairPoint.create({
      userId: user._id,
      balance: 100
    });

    // Real-time synchronization to Supabase public.users
    await syncUserToSupabase(user, user.role === 'PASSENGER' ? 100 : 0).catch(() => {});

    const tokens = AuthService.generateTokens(user);
    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: tokens
    });
  } catch (err: any) {
    res.status(500).json({ success: false, code: 'REGISTRATION_ERROR', message: err.message });
  }
});

/**
 * Login with Email / Phone & Password
 */
authRouter.post('/login', validate(LoginSchema), async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    const cleanDigits = identifier.replace(/\D/g, '').slice(-10);
    const standardPhone = cleanDigits.length >= 10 ? `+91${cleanDigits}` : null;

    const queryConditions: any[] = [
      { email: identifier.toLowerCase().trim() },
      { phone: identifier.trim() }
    ];

    if (cleanDigits.length >= 10) {
      queryConditions.push({ phone: standardPhone });
      queryConditions.push({ phone: cleanDigits });
    }

    const user = await User.findOne({ $or: queryConditions });

    if (!user) {
      res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'No account found with this email or mobile number. Please click Register to create your account.'
      });
      return;
    }

    // If user was created without password, set password now
    if (!user.password) {
      user.password = password;
      await user.save();
    } else {
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        res.status(401).json({
          success: false,
          code: 'INVALID_CREDENTIALS',
          message: 'Incorrect password. Please try again.'
        });
        return;
      }
    }

    const tokens = AuthService.generateTokens(user);
    // Background sync to keep Supabase user record updated
    syncUserToSupabase(user).catch(() => {});

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: tokens
    });
  } catch (err: any) {
    res.status(500).json({ success: false, code: 'LOGIN_ERROR', message: err.message });
  }
});

/**
 * Helper to normalize phone number to clean 10-digit key and standard +91 format
 */
const normalizePhone = (rawPhone: string) => {
  const digits = rawPhone.replace(/\D/g, '');
  const tenDigits = digits.slice(-10);
  return {
    tenDigits,
    standardPhone: `+91${tenDigits}`,
    raw: rawPhone.trim()
  };
};

/**
 * Mobile OTP - Send
 */
authRouter.post('/send-otp', validate(SendOtpSchema), async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const { tenDigits, standardPhone, raw } = normalizePhone(phone);
    const otp = await AuthService.generateOtp(standardPhone);

    // Store under all formats so verification never fails due to formatting
    activeOtps.set(tenDigits, otp);
    activeOtps.set(standardPhone, otp);
    activeOtps.set(raw, otp);

    const smsResult = await SmsService.sendOtpSms(standardPhone, otp);

    res.json({
      success: true,
      message: smsResult.sent
        ? `OTP dispatched to mobile number via ${smsResult.provider}`
        : 'OTP generated in backend test sandbox',
      data: {
        phone: standardPhone,
        demoOtp: otp,
        smsDispatched: smsResult.sent,
        provider: smsResult.provider
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, code: 'OTP_SEND_ERROR', message: err.message });
  }
});

/**
 * Mobile OTP - Verify & Login/Register
 */
authRouter.post('/verify-otp', validate(VerifyOtpSchema), async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    const { tenDigits, standardPhone, raw } = normalizePhone(phone);

    const storedOtp = activeOtps.get(tenDigits) || activeOtps.get(standardPhone) || activeOtps.get(raw);

    // Allow testing OTP '123456' or whatever was stored
    if (otp !== '123456' && storedOtp !== otp) {
      res.status(400).json({
        success: false,
        code: 'INVALID_OTP',
        message: 'Invalid or expired OTP code. Use 123456 or the code sent to your phone.'
      });
      return;
    }

    activeOtps.delete(tenDigits);
    activeOtps.delete(standardPhone);
    activeOtps.delete(raw);

    // Find existing user across all phone formats or create new
    let user = await User.findOne({
      $or: [
        { phone: standardPhone },
        { phone: tenDigits },
        { phone: raw }
      ]
    });

    if (!user) {
      // Guaranteed unique referral code
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const code = `FR${tenDigits.slice(-4)}${uniqueSuffix}`;
      const uniqueEmail = `rider_${tenDigits}_${Date.now()}@fairride.local`;

      try {
        user = await User.create({
          name: `Rider ${tenDigits.slice(-4)}`,
          phone: standardPhone,
          email: uniqueEmail,
          role: 'PASSENGER',
          isVerified: true,
          referralCode: code
        });

        // Initialize wallet and FairPoints
        await Wallet.create({ userId: user._id, userRole: 'PASSENGER', balance: 100 });
        await FairPoint.create({ userId: user._id, balance: 100 });
      } catch (createErr: any) {
        // Fallback if duplicate key on concurrent creation
        user = await User.findOne({
          $or: [{ phone: standardPhone }, { phone: tenDigits }]
        });
        if (!user) {
          throw createErr;
        }
      }
    }

    const tokens = AuthService.generateTokens(user);
    // Real-time synchronization to Supabase public.users
    await syncUserToSupabase(user, 100).catch(() => {});

    res.json({
      success: true,
      message: 'Mobile number verified successfully',
      data: tokens
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      code: 'VERIFY_OTP_ERROR',
      message: err.message || 'OTP verification failed'
    });
  }
});

/**
 * Get Current Authenticated Profile
 */
authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found' });
      return;
    }
    const wallet = await Wallet.findOne({ userId: user._id });
    const fairPoint = await FairPoint.findOne({ userId: user._id });

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        walletBalance: wallet?.balance ?? 100,
        fairPoints: fairPoint?.balance ?? 100
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
