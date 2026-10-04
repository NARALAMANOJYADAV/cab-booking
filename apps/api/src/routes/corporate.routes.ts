import { Router, Request, Response } from 'express';
import { CorporateAccount, CorporateBooking, User, Booking } from '../models/index.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const corporateRouter = Router();

/**
 * Get corporate profile and department budgets
 */
corporateRouter.get('/account', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let account = await CorporateAccount.findOne();
    if (!account) {
      account = await CorporateAccount.create({
        companyName: 'TechCorp Solutions India',
        corporateCode: 'TECHCORP2026',
        billingEmail: 'travel-desk@techcorp.local',
        phone: '+91 9876543210',
        monthlyBudget: 500000,
        currentSpend: 134500,
        departments: [
          { name: 'Engineering', budget: 200000, spend: 64200 },
          { name: 'Sales & Client Success', budget: 150000, spend: 48300 },
          { name: 'Operations & HR', budget: 150000, spend: 22000 }
        ],
        travelPolicy: {
          maxFarePerRide: 1800,
          allowedCategories: ['ECONOMY', 'HATCHBACK', 'SEDAN', 'EV'],
          requireManagerApproval: true
        }
      });
    }

    const bookings = await CorporateBooking.find({ corporateAccountId: account._id })
      .populate('employeeUserId', 'name email phone')
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        account,
        recentBookings: bookings
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Manager approval action on employee corporate ride
 */
corporateRouter.post('/bookings/:id/approval', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, notes } = req.body; // action: 'APPROVED' | 'REJECTED'
    const corpBooking = await CorporateBooking.findById(req.params.id);
    if (!corpBooking) {
      res.status(404).json({ success: false, message: 'Corporate booking not found' });
      return;
    }

    corpBooking.approvalStatus = action;
    corpBooking.approvedBy = req.user!.userId as any;
    corpBooking.approvalNotes = notes;
    await corpBooking.save();

    res.json({
      success: true,
      message: `Corporate booking ${action.toLowerCase()} successfully`,
      data: corpBooking
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
