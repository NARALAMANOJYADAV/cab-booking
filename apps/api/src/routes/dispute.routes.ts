import { Router, Request, Response } from 'express';
import { DisputeService } from '../services/dispute.service.js';
import { Dispute } from '../models/index.js';
import { authenticate, AuthenticatedRequest, requireRole } from '../middleware/auth.middleware.js';

export const disputeRouter = Router();

/**
 * File a dispute (auto-attaches evidence bundle)
 */
disputeRouter.post('/create', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, category, description, demandedAmount, screenshots } = req.body;
    if (!bookingId || !category || !description) {
      res.status(400).json({ success: false, message: 'bookingId, category, and description are required' });
      return;
    }

    const dispute = await DisputeService.createDispute(
      bookingId,
      req.user!.userId,
      category,
      description,
      demandedAmount,
      screenshots
    );

    res.status(201).json({
      success: true,
      message: 'Dispute filed successfully with auto-attached verified evidence bundle.',
      data: dispute
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * List passenger's own disputes
 */
disputeRouter.get('/my', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const disputes = await Dispute.find({ passengerId: req.user!.userId })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: disputes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * List all disputes for Admin Resolution Center
 */
disputeRouter.get('/all', authenticate, async (req: Request, res: Response) => {
  try {
    const disputes = await Dispute.find()
      .populate('passengerId', 'name phone email profilePicture')
      .populate({
        path: 'driverId',
        populate: [{ path: 'userId', select: 'name phone' }]
      })
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: disputes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin action: Resolve dispute with refund / partial refund / reject
 */
disputeRouter.post('/:id/resolve', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, refundAmount = 0, decisionNotes } = req.body;
    if (!status || !decisionNotes) {
      res.status(400).json({ success: false, message: 'status and decisionNotes required' });
      return;
    }

    const resolved = await DisputeService.resolveDispute(
      req.params.id as string,
      req.user!.userId,
      status,
      Number(refundAmount || 0),
      decisionNotes
    );

    res.json({
      success: true,
      message: `Dispute resolved with status: ${status}`,
      data: resolved
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
