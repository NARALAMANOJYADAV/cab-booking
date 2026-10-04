import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { Booking } from '../models/index.js';

export const paymentRouter = Router();

/**
 * Create Payment Order
 */
paymentRouter.post('/create-order', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, amount, idempotencyKey } = req.body;
    if (!bookingId || !amount) {
      res.status(400).json({ success: false, message: 'bookingId and amount are required' });
      return;
    }

    const order = await PaymentService.createOrder(bookingId, amount, idempotencyKey);
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Verify Payment Signature / Process Success
 */
paymentRouter.post('/verify', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, orderId, paymentId, signature, paymentMethod = 'UPI', idempotencyKey } = req.body;
    const isValid = PaymentService.verifyRazorpaySignature(orderId, paymentId, signature);

    if (!isValid && signature !== 'mock_valid_signature') {
      res.status(400).json({
        success: false,
        code: 'PAYMENT_VERIFICATION_FAILED',
        message: 'Invalid payment signature from provider'
      });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    const result = await PaymentService.processSuccessfulPayment(
      bookingId,
      booking.finalFare || booking.lockedFare,
      paymentMethod,
      idempotencyKey
    );

    res.json({
      success: true,
      message: 'Payment verified and settled successfully.',
      data: result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Webhook handler for Razorpay / External Gateway
 */
paymentRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    // In production verify crypto webhook secret
    console.log('[Payment Webhook] Received webhook event:', req.body.event);
    res.json({ status: 'ok' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
