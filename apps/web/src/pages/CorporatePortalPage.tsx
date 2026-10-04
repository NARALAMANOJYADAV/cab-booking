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
  const { currentUser } = useAppStore();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Corporate Header */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{account.companyName}</h2>
              <span className="text-xs bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                CODE: {account.corporateCode}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Corporate Travel Management Desk • Manager: {currentUser.name}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert('Monthly consolidated GST tax invoice downloaded.')}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Download Invoice</span>
          </button>
        </div>
      </div>

      {/* Budget & Spend Progress */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">MONTHLY TRAVEL BUDGET</span>
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-2xl font-black text-white font-mono">{formatCurrencyINR(account.currentSpend)}</span>
              <span className="text-xs text-slate-400 font-mono">of {formatCurrencyINR(account.monthlyBudget)}</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all ${
                  spendPercentage > 85 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                }`}
                style={{ width: `${spendPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-2">
              <span>{spendPercentage}% Budget Utilized</span>
              <span>{formatCurrencyINR(account.monthlyBudget - account.currentSpend)} remaining</span>
            </div>
          </div>
        </div>

        {/* Department Budgets */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800 space-y-3">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">DEPARTMENT BUDGET BREAKDOWN</span>
          <div className="grid sm:grid-cols-3 gap-3">
            {account.departments.map((dept: any, i: number) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-xs text-white block truncate">{dept.name}</span>
                <p className="text-sm font-black text-emerald-400 font-mono">{formatCurrencyINR(dept.spend)}</p>
                <span className="text-[10px] text-slate-400">Budget: {formatCurrencyINR(dept.budget)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manager Ride Request Approvals Queue */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              <span>EMPLOYEE RIDE APPROVAL QUEUE</span>
            </h3>
            <p className="text-xs text-slate-400">Review business travel justifications before dispatch</p>
          </div>
          <span className="text-xs bg-blue-500/20 text-blue-300 font-bold px-2.5 py-1 rounded-full border border-blue-500/30">
            {pendingApprovals.length} PENDING
          </span>
        </div>

        {pendingApprovals.length > 0 ? (
          <div className="space-y-3">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{req.employeeName}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {req.department}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{req.id}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {req.pickup} ➔ {req.destination}
                  </p>
                  <p className="text-xs text-amber-300/90 italic">
                    Reason: "{req.purpose}"
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Est. Fare</span>
                    <span className="font-mono font-bold text-white text-base">
                      {formatCurrencyINR(req.estimatedFare)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprovalAction(req.id, 'APPROVED')}
                      className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20"
                    >
                      Approve Ride ✓
                    </button>
                    <button
                      onClick={() => handleApprovalAction(req.id, 'REJECTED')}
                      className="py-2 px-3.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-rose-400 font-bold text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            All employee corporate ride requests approved!
          </div>
        )}
      </div>
    </div>
  );
};
