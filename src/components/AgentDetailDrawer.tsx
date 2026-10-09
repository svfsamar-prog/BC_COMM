'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { X, FileText, Download, Building2, MapPin, CreditCard, Shield, CalendarCheck, Calendar } from 'lucide-react';
import { exportFilteredCommissionExcel } from '@/lib/exportExcel';
import { CommissionRecord } from '@/types/commission';

export const AgentDetailDrawer: React.FC = () => {
  const {
    selectedAgent,
    setSelectedAgent,
    records,
    availableMonths,
    statementMonthLabel,
    exportSingleVoucherPdf,
  } = useCommission();

  const [activeAgentMonth, setActiveAgentMonth] = useState<string>('');

  // Synchronize with selected agent's month when opened
  useEffect(() => {
    if (selectedAgent) {
      setActiveAgentMonth(selectedAgent.statementMonth || 'AUGUST 2026');
    }
  }, [selectedAgent]);

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

  // Find agent record for chosen month
  const currentRecord: CommissionRecord | null = useMemo(() => {
    if (!selectedAgent) return null;
    if (selectedAgent.statementMonth === activeAgentMonth) return selectedAgent;
    const found = records.find(
      (r) => r.agentId === selectedAgent.agentId && r.statementMonth === activeAgentMonth
    );
    return found || selectedAgent;
  }, [selectedAgent, activeAgentMonth, records]);

  if (!selectedAgent || !currentRecord) return null;

  const handleDownloadPdf = () => {
    exportSingleVoucherPdf(currentRecord);
  };

  const handleDownloadExcel = () => {
    exportFilteredCommissionExcel([currentRecord], `BCA_Slip_${currentRecord.agentId}.xlsx`);
  };

  const tds = currentRecord.tdsDeduction ?? Number((currentRecord.bcComm * 0.02).toFixed(2));
  const netPayable = currentRecord.netPayable ?? Number((currentRecord.bcComm - tds).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Dim Backdrop */}
      <div
        onClick={() => setSelectedAgent(null)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white border-l border-[#E5E7EB] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-[#E5E7EB] bg-[#F8FAFC]">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#0A5C36] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Business Correspondent Terminal
                </span>
                <h2 className="text-xl font-extrabold text-[#0A0A0A] leading-tight mt-1">
                  {currentRecord.bcaName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#6B7280] font-mono">
                  <span>Agent ID: <strong>{currentRecord.agentId}</strong></span>
                  {currentRecord.agentIdBank && (
                    <>
                      <span>•</span>
                      <span>Bank ID: {currentRecord.agentIdBank}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedAgent(null)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Month Switcher inside Agent Card (Phase 5) */}
            {availableMonths.length > 1 && (
              <div className="mt-3.5 flex items-center gap-2 pt-2.5 border-t border-[#E2E8F0]">
                <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                <span className="text-xs text-[#6B7280] font-medium">Month:</span>
                <select
                  value={activeAgentMonth}
                  onChange={(e) => setActiveAgentMonth(e.target.value)}
                  className="text-xs font-bold text-[#0A0A0A] bg-white border border-[#CBD5E1] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0A5C36]"
                >
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Branch & Location Meta */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#374151] pt-2.5 border-t border-[#E2E8F0]">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />
                <span className="truncate">{currentRecord.baseBranch}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6B7280]" />
                <span className="truncate">{currentRecord.dist}, {currentRecord.stateName}</span>
              </div>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Hero Card: Net BCA Payout with 2% TDS */}
            <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
              <span className="text-xs font-bold text-[#166534] uppercase tracking-wider">
                Net BCA Disbursement (80% Share)
              </span>
              <div className="text-3xl font-extrabold text-[#15803D] tabular-nums">
                ₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className="space-y-1 pt-2 border-t border-[#BBF7D0] text-xs">
                <div className="flex items-center justify-between text-[#374151]">
                  <span>Gross Commission (100%):</span>
                  <span className="font-semibold tabular-nums">
                    ₹{currentRecord.netCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#166534]">
                  <span>BCA Share (80%):</span>
                  <span className="font-bold tabular-nums">
                    ₹{currentRecord.bcComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#B91C1C]">
                  <span>TDS Deduction (2%):</span>
                  <span className="font-semibold tabular-nums">
                    -₹{tds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#6B7280]">
                  <span>Corporate Retention (20%):</span>
                  <span className="font-mono tabular-nums">
                    ₹{currentRecord.corpComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Accounts & Transactions */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0A0A0A] border-b border-[#E5E7EB] pb-1">
                <CreditCard className="w-3.5 h-3.5 text-[#0A5C36]" />
                <span>Account Opening & Financial Operations</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <span className="text-[11px] text-[#6B7280]">Accounts Opened</span>
                  <p className="text-base font-bold text-[#0A0A0A] tabular-nums mt-0.5">
                    {currentRecord.totalNoOfAcctOpn}
                  </p>
                  <span className="text-[10px] text-[#6B7280]">
                    {currentRecord.fundedNoOfAcctOpn} Funded · {currentRecord.nonFundedNoOfAcctOpn} Non-Funded
                  </span>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <span className="text-[11px] text-[#6B7280]">Financial Transactions</span>
                  <p className="text-base font-bold text-[#0A0A0A] tabular-nums mt-0.5">
                    {currentRecord.financialTxn.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-[#6B7280]">
                    Vol: ₹{currentRecord.txnAmt.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Social Security Schemes (SSS) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0A0A0A] border-b border-[#E5E7EB] pb-1">
                <Shield className="w-3.5 h-3.5 text-[#0A5C36]" />
                <span>Social Security Schemes (SSS)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center">
                  <span className="text-[10px] text-[#6B7280] block font-medium">APY</span>
                  <span className="font-bold text-sm tabular-nums text-[#0A0A0A]">{currentRecord.apyCount}</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">₹{currentRecord.apyComm.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center">
                  <span className="text-[10px] text-[#6B7280] block font-medium">PMSBY</span>
                  <span className="font-bold text-sm tabular-nums text-[#0A0A0A]">{currentRecord.sbyCount}</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">₹{currentRecord.sbyComm.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center">
                  <span className="text-[10px] text-[#6B7280] block font-medium">PMJJBY</span>
                  <span className="font-bold text-sm tabular-nums text-[#0A0A0A]">{currentRecord.jbyCount}</span>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">₹{currentRecord.jbyComm.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Attendance & Device */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0A0A0A] border-b border-[#E5E7EB] pb-1">
                <CalendarCheck className="w-3.5 h-3.5 text-[#0A5C36]" />
                <span>Attendance & Terminal Status</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <span className="text-[11px] text-[#6B7280]">Login Days</span>
                  <p className="text-base font-bold text-[#0A0A0A] tabular-nums mt-0.5">
                    {currentRecord.loginDays} <span className="text-xs font-normal text-[#6B7280]">Days Active</span>
                  </p>
                  <span className={`text-[11px] font-semibold ${currentRecord.loginPercentage >= 80 ? 'text-[#15803D]' : 'text-[#D97706]'}`}>
                    {currentRecord.loginPercentage}% Attendance
                  </span>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <span className="text-[11px] text-[#6B7280]">Device Serial ID</span>
                  <p className="text-xs font-mono font-bold text-[#0A0A0A] mt-1 truncate">
                    {currentRecord.deviceId || 'TERMINAL-POS-01'}
                  </p>
                  <span className="text-[10px] text-[#6B7280]">
                    Location: {currentRecord.locationType || 'RURAL'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#084B26] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF Voucher</span>
            </button>
            <button
              onClick={handleDownloadExcel}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#374151] bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg transition-colors cursor-pointer"
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
