import { Router, Request, Response } from 'express';
import { Wallet, WalletTransaction, FairPoint } from '../models/index.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const walletRouter = Router();

/**
 * Get current user wallet and transactions
 */
walletRouter.get('/my', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user!.userId });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user!.userId,
        userRole: req.user!.role,
        balance: req.user!.role === 'PASSENGER' ? 100 : 0
      });
    }

    const transactions = await WalletTransaction.find({ walletId: wallet._id })
      .sort({ createdAt: -1 })
      .limit(30);

    let fairPoints = await FairPoint.findOne({ userId: req.user!.userId });
    if (!fairPoints) {
      fairPoints = await FairPoint.create({ userId: req.user!.userId, balance: 100 });
    }

    res.json({
      success: true,
      data: {
        wallet,
        transactions,
        fairPoints: {
          balance: fairPoints.balance,
          transactions: fairPoints.transactions.slice(-10).reverse()
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Top up wallet (add money)
 */
walletRouter.post('/topup', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Valid top-up amount required' });
      return;
    }

    let wallet = await Wallet.findOne({ userId: req.user!.userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user!.userId, userRole: req.user!.role, balance: 0 });
    }

    wallet.balance += amount;
    await wallet.save();

    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      userId: req.user!.userId,
      amount,
      balanceAfter: wallet.balance,
      type: 'CREDIT',
      category: 'WALLET_TOPUP',
      description: `Wallet top-up via UPI / Card`
    });

    res.json({
      success: true,
      message: `₹${amount} added to FairRide Wallet.`,
      data: { balance: wallet.balance, transaction }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Driver withdrawal / settlement request
 */
walletRouter.post('/withdraw', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, bankOrUpi } = req.body;
    const wallet = await Wallet.findOne({ userId: req.user!.userId });
    if (!wallet || wallet.balance < amount) {
      res.status(400).json({ success: false, message: 'Insufficient wallet balance for withdrawal' });
      return;
    }

    wallet.balance -= amount;
    await wallet.save();

    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      userId: req.user!.userId,
      amount,
      balanceAfter: wallet.balance,
      type: 'DEBIT',
      category: 'DRIVER_PAYOUT',
      description: `Payout settlement to ${bankOrUpi || 'Registered Bank Account'}`
    });

    res.json({
      success: true,
      message: `₹${amount} withdrawal initiated. Payout dispatched immediately.`,
      data: { balance: wallet.balance, transaction }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
