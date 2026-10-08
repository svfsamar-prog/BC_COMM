'use client';

import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  Percent,
  Award,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { SummaryMetrics } from '@/types/commission';

interface SocialSchemesSummaryProps {
  metrics: SummaryMetrics;
}

export const SocialSchemesSummary: React.FC<SocialSchemesSummaryProps> = ({ metrics }) => {
  return (
    <div className="bg-white border border-slate-200 rounded p-5 shadow-sm space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-teal-50 text-teal-700 rounded border border-teal-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Social Security Schemes (SSS) & Account Operations
            </h2>
            <p className="text-xs text-slate-500">
              Government Mandated Financial Inclusion Performance & Attendance Tracking
            </p>
          </div>
        </div>

        {/* Global Average Login % Badge */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded">
          <Clock className="w-4 h-4 text-slate-600" />
          <span className="text-xs text-slate-600 font-medium">Avg Login %:</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              metrics.avgLoginPercentage >= 80
                ? 'bg-emerald-100 text-emerald-800'
                : metrics.avgLoginPercentage >= 60
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {metrics.avgLoginPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Grid of Key Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* APY */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase">APY Enrollments</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
              PFRDA
            </span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
            {metrics.totalApyCount.toLocaleString('en-IN')}
          </p>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Commission:</span>
            <span className="font-bold text-teal-700 tabular-nums">
              ₹{metrics.totalApyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* PM-SBY */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase">PMSBY (Accident)</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
              Govt. Ins
            </span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
            {metrics.totalSbyCount.toLocaleString('en-IN')}
          </p>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Commission:</span>
            <span className="font-bold text-teal-700 tabular-nums">
              ₹{metrics.totalSbyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* PM-JBY */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase">PMJJBY (Life)</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
              Govt. Life
            </span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
            {metrics.totalJbyCount.toLocaleString('en-IN')}
          </p>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Commission:</span>
            <span className="font-bold text-teal-700 tabular-nums">
              ₹{metrics.totalJbyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Accounts Opened */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase">Total Accounts</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">
              CASA
            </span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
            {metrics.totalAccountsOpened.toLocaleString('en-IN')}
          </p>
          <div className="mt-1 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Funded: {metrics.totalFundedAccounts}</span>
            <span>Non-Fund: {metrics.totalNonFundedAccounts}</span>
          </div>
        </div>

        {/* 10% SSS Special Incentive */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase">10% SSS Bonus</span>
            <Award className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="mt-1 text-lg font-bold text-amber-800 tabular-nums">
            ₹{metrics.totalSssIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-1 text-[11px] text-slate-500">
            Special Target Bonus
          </div>
        </div>

        {/* Financial Txn Volume */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase">Txn Volume</span>
            <Wallet className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
            ₹{(metrics.totalTxnVolume / 100000).toFixed(1)}L
          </p>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Count:</span>
            <span className="font-bold text-slate-700 tabular-nums">
              {metrics.totalTxnCount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
