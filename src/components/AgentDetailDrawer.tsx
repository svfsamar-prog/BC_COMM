'use client';

import React, { useEffect } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { X, FileText, Download, UserCheck, Building2, MapPin, CreditCard, Shield, CalendarCheck } from 'lucide-react';
import { exportFilteredCommissionExcel } from '@/lib/exportExcel';

export const AgentDetailDrawer: React.FC = () => {
  const { selectedAgent, setSelectedAgent, statementMonthLabel, exportSingleVoucherPdf } = useCommission();

  // Escape key closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAgent(null);
      }
    };
    if (selectedAgent) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAgent, setSelectedAgent]);

  if (!selectedAgent) return null;

  const handleDownloadPdf = () => {
    exportSingleVoucherPdf(selectedAgent);
  };

  const handleDownloadExcel = () => {
    exportFilteredCommissionExcel([selectedAgent], `BCA_Slip_${selectedAgent.agentId}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dim Backdrop */}
      <div
        onClick={() => setSelectedAgent(null)}
        className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white border-l border-[#E5E7EB] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-[#E5E7EB] bg-[#FAFAFA]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  BCA Terminal Record
                </span>
                <h2 className="text-xl font-bold text-[#0A0A0A] leading-tight">
                  {selectedAgent.bcaName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#6B7280] font-mono">
                  <span>ID: {selectedAgent.agentId}</span>
                  {selectedAgent.agentIdBank && (
                    <>
                      <span>•</span>
                      <span>Bank ID: {selectedAgent.agentIdBank}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedAgent(null)}
                className="p-1.5 rounded-md text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#E5E7EB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Branch & Location Meta */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#374151] pt-3 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
                <span className="truncate">{selectedAgent.baseBranch}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6B7280]" />
                <span className="truncate">{selectedAgent.dist}, {selectedAgent.stateName}</span>
              </div>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Hero Number: BCA Payout */}
            <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7]">
              <span className="text-xs font-medium text-[#166534]">
                Net BCA Payout (80% Share)
              </span>
              <div className="text-3xl font-extrabold text-[#15803D] tabular-nums mt-1">
                ₹{selectedAgent.bcComm.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-xs text-[#166534] mt-2 pt-2 border-t border-[#BBF7D0]">
                <span>Gross Reconciled Commission</span>
                <span className="font-semibold tabular-nums">
                  ₹{selectedAgent.netCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#6B7280] mt-1">
                <span>Corporate Share (20%)</span>
                <span className="font-mono tabular-nums">
                  ₹{selectedAgent.corpComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Section 1: Accounts & Transactions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0A0A0A] border-b border-[#E5E7EB] pb-1.5">
                <CreditCard className="w-4 h-4 text-[#0F2942]" />
                <span>Accounts & Financial Transactions</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-md">
                  <span className="text-[11px] text-[#6B7280]">Total Accounts Opened</span>
                  <p className="text-base font-semibold text-[#0A0A0A] tabular-nums mt-0.5">
                    {selectedAgent.totalNoOfAcctOpn}
                  </p>
                  <span className="text-[10px] text-[#6B7280]">
                    {selectedAgent.fundedNoOfAcctOpn} Funded / {selectedAgent.nonFundedNoOfAcctOpn} Non-Funded
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-md">
                  <span className="text-[11px] text-[#6B7280]">Financial Transactions</span>
                  <p className="text-base font-semibold text-[#0A0A0A] tabular-nums mt-0.5">
                    {selectedAgent.financialTxn.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-[#6B7280]">
                    Vol: ₹{selectedAgent.txnAmt.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Social Security Schemes (SSS) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0A0A0A] border-b border-[#E5E7EB] pb-1.5">
                <Shield className="w-4 h-4 text-[#0F2942]" />
                <span>Social Security Schemes (SSS)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-[#FAFAFA] border border-[#E5E7EB] rounded-md text-center">
                  <span className="text-[10px] text-[#6B7280] block">APY</span>
                  <span className="font-semibold text-sm tabular-nums text-[#0A0A0A]">{selectedAgent.apyCount}</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">₹{selectedAgent.apyComm.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 bg-[#FAFAFA] border border-[#E5E7EB] rounded-md text-center">
                  <span className="text-[10px] text-[#6B7280] block">PMSBY</span>
                  <span className="font-semibold text-sm tabular-nums text-[#0A0A0A]">{selectedAgent.sbyCount}</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">₹{selectedAgent.sbyComm.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 bg-[#FAFAFA] border border-[#E5E7EB] rounded-md text-center">
                  <span className="text-[10px] text-[#6B7280] block">PMJJBY</span>
                  <span className="font-semibold text-sm tabular-nums text-[#0A0A0A]">{selectedAgent.jbyCount}</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">₹{selectedAgent.jbyComm.toLocaleString('en-IN')}</span>
                </div>
              </div>
              {selectedAgent.incentive10Sss > 0 && (
                <div className="flex items-center justify-between p-2 bg-[#FFFBEB] border border-[#FEF3C7] rounded-md text-xs text-[#92400E]">
                  <span>10% SSS Scheme Bonus</span>
                  <span className="font-bold tabular-nums">₹{selectedAgent.incentive10Sss.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Section 3: Attendance & Terminal */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0A0A0A] border-b border-[#E5E7EB] pb-1.5">
                <CalendarCheck className="w-4 h-4 text-[#0F2942]" />
                <span>Attendance & Terminal Status</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-md">
                  <span className="text-[11px] text-[#6B7280]">Login Days</span>
                  <p className="text-base font-semibold text-[#0A0A0A] tabular-nums mt-0.5">
                    {selectedAgent.loginDays} <span className="text-xs font-normal text-[#6B7280]">Days Active</span>
                  </p>
                  <span className={`text-[11px] font-medium ${selectedAgent.loginPercentage >= 80 ? 'text-[#15803D]' : 'text-[#D97706]'}`}>
                    {selectedAgent.loginPercentage}% Attendance
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-md">
                  <span className="text-[11px] text-[#6B7280]">Device Serial ID</span>
                  <p className="text-xs font-mono font-semibold text-[#0A0A0A] mt-1 truncate">
                    {selectedAgent.deviceId || 'TERMINAL-POS-01'}
                  </p>
                  <span className="text-[10px] text-[#6B7280]">
                    Period: {selectedAgent.statementMonth || statementMonthLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA] flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-white bg-[#0F2942] hover:bg-[#0A1D30] rounded-md transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF Slip</span>
            </button>
            <button
              onClick={handleDownloadExcel}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-md transition-colors"
            >
              <Download className="w-4 h-4 text-[#6B7280]" />
              <span>Excel</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
