'use client';

import React from 'react';
import { DollarSign, Wallet, Building, ArrowUpRight, Award, ShieldCheck } from 'lucide-react';
import { SummaryMetrics } from '@/types/commission';

interface CommissionSummaryProps {
  metrics: SummaryMetrics;
}

export const CommissionSummary: React.FC<CommissionSummaryProps> = ({ metrics }) => {
  return (
    <div className="svf-card overflow-hidden">
      {/* Header Banner */}
      <div className="bg-[#0f2942] text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-white/10 rounded-lg text-emerald-400 border border-white/10">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center space-x-2">
              <span>Commission & Revenue Split Matrix</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold uppercase">
                80% / 20% Standard
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Reconciled Financial Settlement • 80% BCA Direct Payout & 20% Corporate Support Allocation
            </p>
          </div>
        </div>

        {/* Total Net Commission Large Metric */}
        <div className="text-left md:text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold block">
            Total Net Billable Revenue
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight block">
            ₹{metrics.totalNetCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 80/20 Revenue Split Visual Progress Bar */}
      <div className="px-5 pt-4 pb-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="text-emerald-800 flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>80% BCA Direct Payout</span>
          </span>
          <span className="text-[#0f2942] flex items-center space-x-1">
            <span>20% Corporate Foundation Share</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0f2942] inline-block" />
          </span>
        </div>

        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-emerald-600 h-full transition-all duration-500 rounded-l-full"
            style={{ width: '80%' }}
            title="80% BCA Direct Payout"
          />
          <div
            className="bg-[#0f2942] h-full transition-all duration-500 rounded-r-full"
            style={{ width: '20%' }}
            title="20% Corporate Share"
          />
        </div>
      </div>

      {/* 4 Financial Sub-Metric Boxes */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. BCA 80% Disbursement */}
        <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold uppercase">
            <span>BCA Payout (80%)</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-2 tabular-nums">
            ₹{metrics.totalBcCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-700 mt-1">
            Payable to {metrics.activeAgents} active BCAs
          </p>
        </div>

        {/* 2. Corporate 20% Share */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-700 font-bold uppercase">
            <span>Corporate Share (20%)</span>
            <Building className="w-4 h-4 text-[#0f2942]" />
          </div>
          <p className="text-2xl font-black text-[#0f2942] mt-2 tabular-nums">
            ₹{metrics.totalCorpCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Infrastructure, cloud & field support
          </p>
        </div>

        {/* 3. Social Security (SSS) Incentives */}
        <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200">
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold uppercase">
            <span>SSS 10% Target Bonus</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-800 mt-2 tabular-nums">
            ₹{metrics.totalSssIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-amber-700 mt-1">
            Special incentive for target milestone
          </p>
        </div>

        {/* 4. Active Attendance & Efficiency */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-700 font-bold uppercase">
            <span>Average Login Attendance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {metrics.avgLoginPercentage.toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {metrics.totalAgents} total enrolled BCAs
          </p>
        </div>
      </div>
    </div>
  );
};
