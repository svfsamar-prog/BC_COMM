'use client';

import React from 'react';
import {
  X,
  User,
  MapPin,
  Shield,
  FileSpreadsheet,
  Download,
  Wallet,
  Clock,
} from 'lucide-react';
import { CommissionRecord } from '@/types/commission';
import { generateAgentCommissionPdf } from '@/lib/exportPdf';
import { exportSingleAgentExcel } from '@/lib/exportExcel';

interface AgentDetailDrawerProps {
  agent: CommissionRecord | null;
  onClose: () => void;
}

export const AgentDetailDrawer: React.FC<AgentDetailDrawerProps> = ({ agent, onClose }) => {
  if (!agent) return null;

  const handleDownloadPdf = () => {
    generateAgentCommissionPdf(agent);
  };

  const handleDownloadExcel = () => {
    exportSingleAgentExcel(agent);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md md:max-w-lg bg-white border-l border-slate-200 text-slate-900 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 bg-[#0f2942] text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wide uppercase">{agent.bcaName}</h2>
                <p className="text-xs text-slate-300">
                  Agent ID: <span className="font-semibold text-emerald-300">{agent.agentId}</span> • Bank ID: {agent.agentIdBank || 'N/A'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Quick Action Download Buttons */}
            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0f2942] rounded-lg hover:bg-slate-800 transition"
              >
                <Download className="w-3.5 h-3.5 text-rose-400" />
                <span>Download PDF Slip</span>
              </button>
              <button
                onClick={handleDownloadExcel}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download XLSX</span>
              </button>
            </div>

            {/* Attendance & Login Ratio */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase">
                    Attendance & Login Ratio
                  </span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    agent.loginPercentage >= 80
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : agent.loginPercentage >= 60
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {agent.loginPercentage.toFixed(1)}% Active
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    agent.loginPercentage >= 80
                      ? 'bg-emerald-600'
                      : agent.loginPercentage >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(agent.loginPercentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Active Login Days: <strong className="text-slate-900">{agent.loginDays} Days</strong></span>
                <span>Base Days: {agent.totalDaysInMonth} Days</span>
              </div>
            </div>

            {/* Location & Outlet Metadata */}
            <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Outlet & Banking Metadata</span>
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">State:</span>
                  <p className="font-semibold text-slate-900">{agent.stateName}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Zone:</span>
                  <p className="font-semibold text-slate-900">{agent.zoneName}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">District:</span>
                  <p className="font-semibold text-slate-900">{agent.dist}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Base Branch:</span>
                  <p className="font-semibold text-slate-900">{agent.baseBranch} (SOL: {agent.solId})</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Village / Mandal:</span>
                  <p className="font-semibold text-slate-900">{agent.villageName || agent.mandal || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Device ID / Type:</span>
                  <p className="font-semibold text-slate-900">{agent.deviceId} ({agent.locationType})</p>
                </div>
              </div>
            </div>

            {/* Social Security Schemes (SSS) Breakdown */}
            <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Social Security Performance (SSS)</span>
                </div>
                {agent.incentive10Sss > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                    +10% Incentive
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold">APY Count</span>
                  <p className="text-sm font-bold text-slate-900 tabular-nums">{agent.apyCount}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold tabular-nums">₹{agent.apyComm.toFixed(2)}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold">PMSBY Count</span>
                  <p className="text-sm font-bold text-slate-900 tabular-nums">{agent.sbyCount}</p>
                  <p className="text-[10px] text-sky-700 font-semibold tabular-nums">₹{agent.sbyComm.toFixed(2)}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-bold">PMJJBY Count</span>
                  <p className="text-sm font-bold text-slate-900 tabular-nums">{agent.jbyCount}</p>
                  <p className="text-[10px] text-indigo-700 font-semibold tabular-nums">₹{agent.jbyComm.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Financial Transactions & Accounts */}
            <div className="border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center space-x-1.5">
                <Wallet className="w-3.5 h-3.5 text-slate-600" />
                <span>Financial Transactions & CASA</span>
              </h3>
              <div className="space-y-1.5 pt-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Financial Txns:</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {agent.financialTxn} Txns (₹{agent.txnAmt.toLocaleString('en-IN')})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Txn Commission:</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹{agent.txnComm.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accounts Opened (Funded/Non):</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {agent.totalNoOfAcctOpn} Total ({agent.fundedNoOfAcctOpn} Funded / {agent.nonFundedNoOfAcctOpn} Non-Funded)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Account Opening Comm:</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹{agent.commTotalAcctOpn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remittance Txns:</span>
                  <span className="font-bold text-slate-900 tabular-nums">{agent.remittanceCount} Txns (₹{agent.remittanceRs10.toFixed(2)})</span>
                </div>
                <div className="flex justify-between">
                  <span>Fixed Base Commission:</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹{agent.fixedCommission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Re-KYC Verification Comm:</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹{agent.reKycComm.toFixed(2)} ({agent.reKycCount} Re-KYCs)</span>
                </div>
              </div>
            </div>

            {/* Total Payout & Split Box */}
            <div className="bg-[#0f2942] text-white rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs text-slate-300 font-semibold uppercase">Gross Net Commission</span>
                <span className="text-base font-bold tabular-nums">
                  ₹{agent.netCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-emerald-950/70 border border-emerald-700 rounded-lg p-2.5 text-center">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase">BCA Payout (80%)</span>
                  <p className="text-base font-black text-emerald-400 tabular-nums mt-0.5">
                    ₹{agent.bcComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-center">
                  <span className="text-[10px] text-slate-300 font-bold uppercase">Corporate Share (20%)</span>
                  <p className="text-base font-black text-slate-200 tabular-nums mt-0.5">
                    ₹{agent.corpComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Close */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition"
            >
              Close Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
