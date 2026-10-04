import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, Sparkles, Gift, CheckCircle } from 'lucide-react';
import { formatCurrencyINR } from '@fairride/shared';

export const WalletPage: React.FC = () => {
  const { currentUser, activeRoleView } = useAppStore();

  const [balance, setBalance] = useState(activeRoleView === 'DRIVER' ? 3420 : 1250);
  const [fairPoints, setFairPoints] = useState(240);
  const [topupAmount, setTopupAmount] = useState('500');

  const [transactions, setTransactions] = useState([
    {
      id: 'tx_01',
      desc: 'Ride Payment (FR-HIST-1002)',
      amount: activeRoleView === 'DRIVER' ? 540 : -617,
      type: activeRoleView === 'DRIVER' ? 'CREDIT' : 'DEBIT',
      date: 'Today, 10:24 AM'
    },
    {
      id: 'tx_02',
      desc: 'Dispute Refund Granted (DISP-DEMO-001)',
      amount: 150,
      type: 'CREDIT',
      date: 'Yesterday'
    },
    {
      id: 'tx_03',
      desc: 'Green EV Carbon Bonus Points',
      amount: 50,
      type: 'CREDIT',
      date: '2 days ago'
    }
  ]);

  const handleTopup = () => {
    const val = parseInt(topupAmount, 10);
    if (!val || val <= 0) return;
    setBalance((prev) => prev + val);
    setTransactions((prev) => [
      {
        id: `tx_${Date.now()}`,
        desc: 'Wallet Top-up via UPI',
        amount: val,
        type: 'CREDIT',
        date: 'Just now'
      },
      ...prev
    ]);
    alert(`₹${val} added to your FairRide Wallet!`);
  };

  const handleWithdraw = () => {
    if (balance < 500) {
      alert('Minimum withdrawal amount is ₹500');
      return;
    }
    const withdrawAmt = balance;
    setBalance(0);
    setTransactions((prev) => [
      {
        id: `tx_${Date.now()}`,
        desc: 'Payout Settlement to Primary Bank Account',
        amount: -withdrawAmt,
        type: 'DEBIT',
        date: 'Just now'
      },
      ...prev
    ]);
    alert(`₹${withdrawAmt} settlement dispatched to your registered bank account!`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">FAIRRIDE WALLET & LEDGER</h1>
          <p className="text-xs text-slate-400">Ledger-based transparency for rides, settlements, and refunds</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-tr from-slate-900 via-slate-900 to-emerald-950/40 shadow-2xl">
        <div className="grid sm:grid-cols-2 gap-6 items-center">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              AVAILABLE BALANCE
            </span>
            <p className="text-4xl font-black text-white font-mono tracking-tight mt-1">
              {formatCurrencyINR(balance)}
            </p>
            <span className="text-xs text-emerald-400 font-semibold mt-1 inline-block">
              ✓ Instant payment enabled • Zero transaction fees
            </span>
          </div>

          <div className="space-y-3">
            {activeRoleView === 'DRIVER' ? (
              <button
                onClick={handleWithdraw}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20"
              >
                Withdraw Full Earnings to Bank Account
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {['200', '500', '1000'].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTopupAmount(amt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        topupAmount === amt
                          ? 'bg-brand-500/20 text-brand-300 border-brand-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleTopup}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20"
                >
                  Top Up Wallet (+₹{topupAmount})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FairPoints Loyalty Card */}
      <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">FairPoints Loyalty Balance</h4>
            <p className="text-xs text-slate-400">Earn 1 pt per ₹20 spent • 2x points on Green EV rides</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-amber-400 font-mono">{fairPoints} pts</p>
          <button
            onClick={() => alert('240 FairPoints redeemed for ₹50 ride discount coupon!')}
            className="text-xs text-amber-300 font-bold hover:underline"
          >
            Redeem ₹50 Voucher
          </button>
        </div>
      </div>

      {/* Ledger Transaction History */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white">Immutable Ledger Transactions</h3>
        <div className="space-y-2">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    t.type === 'CREDIT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {t.type === 'CREDIT' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-bold text-white">{t.desc}</p>
                  <span className="text-[10px] text-slate-400">{t.date}</span>
                </div>
              </div>
              <span
                className={`font-mono font-bold text-sm ${
                  t.type === 'CREDIT' ? 'text-emerald-400' : 'text-slate-200'
                }`}
              >
                {t.type === 'CREDIT' ? '+' : ''}
                {formatCurrencyINR(Math.abs(t.amount))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
