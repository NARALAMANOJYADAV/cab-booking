import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';

export const CorporatePortalPage: React.FC = () => {
  const { currentUser, setCurrentUser, setActiveRoleView } = useAppStore();

  const isCorporateAuth = currentUser?.role?.startsWith('CORPORATE');

  // Corporate Login form states
  const [corpCode, setCorpCode] = useState('CORP-TCS');
  const [workEmail, setWorkEmail] = useState('priya.sharma@tcs.com');
  const [corpPassword, setCorpPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleCorporateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanCode = corpCode.trim().toUpperCase();
    if (!cleanCode) {
      setLoginError('Please enter your Corporate Organization Code');
      return;
    }
    if (!cleanCode.startsWith('CORP')) {
      setLoginError('Invalid Org Code! Corporate codes start with CORP- (e.g. CORP-TCS or CORP-TECHCORP)');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      setCurrentUser({
        userId: 'corp_user_01',
        name: 'Priya Sharma (Corporate Admin)',
        email: workEmail.trim() || 'priya.sharma@tcs.com',
        phone: '+91 9800000005',
        role: 'CORPORATE_MANAGER',
        walletBalance: 50000,
        fairPoints: 1200
      });
      setIsLoggingIn(false);
    }, 500);
  };

  const [account, setAccount] = useState<any>({
    companyName: 'TechCorp Solutions India Pvt Ltd',
    corporateCode: 'TECHCORP2026',
    billingEmail: 'travel-desk@techcorp.local',
    monthlyBudget: 500000,
    currentSpend: 164200,
    departments: [
      { name: 'Engineering & Product', budget: 200000, spend: 78500 },
      { name: 'Enterprise Sales', budget: 150000, spend: 54100 },
      { name: 'Operations & HR', budget: 150000, spend: 31600 }
    ],
    travelPolicy: {
      maxFarePerRide: 1800,
      allowedCategories: ['ECONOMY', 'HATCHBACK', 'SEDAN', 'EV'],
      requireManagerApproval: true
    }
  });

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([
    {
      id: 'CORP-REQ-881',
      employeeName: 'Priya Iyer',
      department: 'Engineering & Product',
      pickup: 'Kondapur Tech Zone',
      destination: 'RGIA Airport Shamshabad',
      purpose: 'Client Architecture Review Meeting - Bengaluru Flight',
      estimatedFare: 670,
      date: 'Today, 2:30 PM',
      status: 'PENDING'
    },
    {
      id: 'CORP-REQ-882',
      employeeName: 'Arjun Menon',
      department: 'Enterprise Sales',
      pickup: 'Gachibowli Financial District',
      destination: 'Jubilee Hills Club',
      purpose: 'Partner Onboarding Dinner',
      estimatedFare: 380,
      date: 'Today, 7:00 PM',
      status: 'PENDING'
    }
  ]);

  const handleApprovalAction = (reqId: string, action: 'APPROVED' | 'REJECTED') => {
    setPendingApprovals((prev) => prev.filter((r) => r.id !== reqId));
    alert(`Corporate ride request ${reqId} ${action.toLowerCase()}! Notified employee.`);
  };

  const spendPercentage = Math.round((account.currentSpend / account.monthlyBudget) * 100);

  // If not authenticated as Corporate, show dedicated Corporate Enterprise Login Page
  if (!isCorporateAuth) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative">
          {/* Top back button */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setActiveRoleView('PASSENGER')}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
            >
              <span>← Back to Passenger Booking</span>
            </button>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              B2B Enterprise Portal
            </span>
          </div>

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Corporate Travel Desk</h2>
            <p className="text-xs text-slate-600 mt-1">
              Enter your enterprise organization code to access employee billing and ride approvals.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {loginError}
            </div>
          )}

          <form onSubmit={handleCorporateLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Corporate Organization Code
              </label>
              <input
                type="text"
                value={corpCode}
                onChange={(e) => setCorpCode(e.target.value.toUpperCase())}
                placeholder="e.g. CORP-TCS or CORP-INFY"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Issued to your company travel administrator
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                placeholder="travel-desk@company.com"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Account Password
              </label>
              <input
                type="password"
                value={corpPassword}
                onChange={(e) => setCorpPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setCorpCode('CORP-TCS');
                  setWorkEmail('priya.sharma@tcs.com');
                  setCorpPassword('password123');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
              >
                Auto-fill Demo: TCS Enterprise
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>{isLoggingIn ? 'Verifying Organization...' : 'Sign In to Corporate Console'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Corporate Header */}
      <div className="rounded-3xl p-6 border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{account.companyName}</h2>
              <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                CODE: {account.corporateCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Corporate Travel Management Desk • Manager: {currentUser.name}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert('Monthly consolidated GST tax invoice downloaded.')}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Download Invoice</span>
          </button>
        </div>
      </div>

      {/* Budget & Spend Progress */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">MONTHLY TRAVEL BUDGET</span>
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{formatCurrencyINR(account.currentSpend)}</span>
              <span className="text-xs text-slate-500 font-mono font-medium">of {formatCurrencyINR(account.monthlyBudget)}</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full transition-all ${
                  spendPercentage > 85 ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                }`}
                style={{ width: `${spendPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-600 mt-2 font-medium">
              <span>{spendPercentage}% Budget Utilized</span>
              <span>{formatCurrencyINR(account.monthlyBudget - account.currentSpend)} remaining</span>
            </div>
          </div>
        </div>

        {/* Department Budgets */}
        <div className="lg:col-span-2 rounded-3xl p-6 border border-slate-200 bg-white space-y-3 shadow-sm">
          <span className="text-xs font-black uppercase text-slate-500 tracking-wider">DEPARTMENT BUDGET BREAKDOWN</span>
          <div className="grid sm:grid-cols-3 gap-3">
            {account.departments.map((dept: any, i: number) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-xs text-slate-900 block truncate">{dept.name}</span>
                <p className="text-sm font-black text-emerald-700 font-mono">{formatCurrencyINR(dept.spend)}</p>
                <span className="text-[10px] text-slate-500 font-medium">Budget: {formatCurrencyINR(dept.budget)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manager Ride Request Approvals Queue */}
      <div className="rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>EMPLOYEE RIDE APPROVAL QUEUE</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Review business travel justifications before dispatch</p>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-1 rounded-full border border-indigo-200">
            {pendingApprovals.length} PENDING
          </span>
        </div>

        {pendingApprovals.length > 0 ? (
          <div className="space-y-3">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.employeeName}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
                      {req.department}
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-medium">{req.id}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    {req.pickup} ➔ {req.destination}
                  </p>
                  <p className="text-xs text-amber-900 font-medium italic">
                    Reason: "{req.purpose}"
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block font-medium">Est. Fare</span>
                    <span className="font-mono font-bold text-slate-900 text-base">
                      {formatCurrencyINR(req.estimatedFare)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprovalAction(req.id, 'APPROVED')}
                      className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow transition-colors cursor-pointer"
                    >
                      Approve Ride ✓
                    </button>
                    <button
                      onClick={() => handleApprovalAction(req.id, 'REJECTED')}
                      className="py-2 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">
            All employee corporate ride requests approved!
          </div>
        )}
      </div>
    </div>
  );
};
