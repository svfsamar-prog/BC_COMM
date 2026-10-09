'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Calendar,
  ChevronDown,
  Check,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  ClipboardList,
  QrCode,
  Undo2,
  X,
  Loader2,
  LogOut,
  Layers,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    availableMonths,
    selectedPeriod,
    setSelectedPeriod,
    monthFrom,
    monthTo,
    setMonthRange,
    setIsUploadModalOpen,
    filteredRecords,
    filters,
    handleFilterChange,
    exportCurrentExcel,
    exportCurrentPdf,
    exportPayoutListPdf,
    exportBulkVouchersPdf,
    isGeneratingBulk,
    bulkProgress,
    availablePeriods,
    reconciliation,
    toast,
    dismissToast,
  } = useCommission();

  const { user, logout } = useAuth();

  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  const periodRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Live Date & Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentDateTime(dateStr);
      setCurrentTimeStr(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setIsPeriodOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Data status line (U3)
  const currentPeriodMeta = availablePeriods.find((p) => p.month_year === (monthFrom === monthTo ? monthFrom : monthTo));
  const importDateStr = currentPeriodMeta?.uploaded_at
    ? new Date(currentPeriodMeta.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '9 Oct';
  const uploaderName = currentPeriodMeta?.uploaded_by || user?.name || 'Admin';
  const agentCount = filteredRecords.length;
  const matchStatus = reconciliation.isReconciled ? 'matches file' : 'discrepancy detected';
  const dataStatusLine = `Data for ${monthFrom === monthTo ? monthFrom : `${monthFrom} - ${monthTo}`}, imported on ${importDateStr} by ${uploaderName}, ${agentCount} agents, ${matchStatus}`;

  const scopeLabel = `${filteredRecords.length} BCAs · ${filters.dist || filters.state || 'All Districts'} · ${monthFrom === monthTo ? monthFrom : `${monthFrom} - ${monthTo}`}`;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between gap-3 shadow-xs">
        {/* Left: Universal Search Input */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
              placeholder="Search BCAs, Agent ID, branch, district... (Press /)"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0A5C36] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right: Data Status Line, Range Period Picker, Upload, Export, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Data Status Line (U3) */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1 border rounded-lg text-xs font-medium ${
              reconciliation.isReconciled
                ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#166534]'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
            title={dataStatusLine}
          >
            <Check className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
            <span className="truncate max-w-[340px] xl:max-w-none">{dataStatusLine}</span>
          </div>

          {/* Period & Month Range Dropdown (Phase 3 & 6) */}
          <div className="relative" ref={periodRef}>
            <button
              onClick={() => setIsPeriodOpen(!isPeriodOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#374151] bg-[#FAFAFA] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg transition-fast cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#0A5C36]" />
              <span className="hidden sm:inline text-[#6B7280]">Period:</span>
              <span className="font-bold text-[#0A0A0A]">
                {monthFrom === monthTo ? monthFrom : `${monthFrom} → ${monthTo}`}
              </span>
              <ChevronDown className="w-3 h-3 text-[#6B7280]" />
            </button>

            {isPeriodOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                  <span className="text-xs font-bold text-[#0A0A0A]">Statement Period Selection</span>
                  <span className="text-[10px] text-[#0A5C36] font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">Range Mode</span>
                </div>

                {/* Range Selectors */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-[#6B7280] font-medium mb-1">From Month</label>
                    <select
                      value={monthFrom}
                      onChange={(e) => {
                        setMonthRange(e.target.value, monthTo);
                      }}
                      className="w-full text-xs font-semibold p-1.5 border border-[#CBD5E1] rounded bg-white text-[#0A0A0A]"
                    >
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#6B7280] font-medium mb-1">To Month</label>
                    <select
                      value={monthTo}
                      onChange={(e) => {
                        setMonthRange(monthFrom, e.target.value);
                      }}
                      className="w-full text-xs font-semibold p-1.5 border border-[#CBD5E1] rounded bg-white text-[#0A0A0A]"
                    >
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Single Month Buttons */}
                <div className="pt-2 border-t border-[#F3F4F6] space-y-1">
                  <div className="text-[10px] text-[#6B7280] font-medium mb-1">Single Month Jump</div>
                  <div className="flex flex-wrap gap-1">
                    {availableMonths.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setSelectedPeriod(m);
                          setIsPeriodOpen(false);
                        }}
                        className={`text-[11px] px-2 py-1 rounded transition-colors ${
                          monthFrom === m && monthTo === m
                            ? 'bg-[#0A5C36] text-white font-bold'
                            : 'bg-[#F1F5F9] text-[#374151] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F3F4F6] flex justify-end">
                  <button
                    onClick={() => setIsPeriodOpen(false)}
                    className="px-3 py-1 bg-[#0A5C36] text-white text-xs font-semibold rounded-lg hover:bg-[#084B26]"
                  >
                    Apply Period
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0A5C36] hover:bg-[#084B26] rounded-lg transition-fast shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Export Dropdown with Month-wise & Cumulative options (Phase 6) */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A5C36] bg-white hover:bg-[#F0FDF4] border border-[#0A5C36] rounded-lg transition-fast shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-white border border-[#E5E7EB] rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 text-[11px] text-[#6B7280] bg-[#FAFAFA] border-b border-[#E5E7EB]">
                  <div className="font-bold text-[#0A0A0A] truncate">{scopeLabel}</div>
                  <div className="text-[10px] text-[#9CA3AF] mt-0.5">Select export matrix or report below</div>
                </div>

                {/* 1. Month-wise Excel Matrix */}
                <button
                  onClick={() => {
                    exportCurrentExcel('month_wise');
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#0A0A0A] hover:bg-[#F3F4F6] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-[#0A0A0A]">Excel: Month-Wise Matrix</div>
                    <div className="text-[10px] text-[#6B7280]">2 Tabs: Schemes + Commissions with 2% TDS</div>
                  </div>
                </button>

                {/* 2. Cumulative Excel Matrix */}
                <button
                  onClick={() => {
                    exportCurrentExcel('cumulative');
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#0A0A0A] hover:bg-[#F3F4F6] flex items-center gap-2.5 transition-colors border-t border-[#F3F4F6] cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="font-bold text-[#0A0A0A]">Excel: Cumulative Range Total</div>
                    <div className="text-[10px] text-[#6B7280]">1 row/BCA summed across {monthFrom === monthTo ? '1 month' : 'selected range'}</div>
                  </div>
                </button>

                {/* 3. Summary Report (PDF) */}
                <button
                  onClick={() => {
                    exportCurrentPdf();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#0A0A0A] hover:bg-[#F3F4F6] flex items-center gap-2.5 transition-colors border-t border-[#F3F4F6] cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-[#0A0A0A]">Summary report (PDF)</div>
                    <div className="text-[10px] text-[#6B7280]">Landscape · Executive cards + TDS totals</div>
                  </div>
                </button>

                {/* 4. Payout List (PDF) */}
                <button
                  onClick={() => {
                    exportPayoutListPdf();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#0A0A0A] hover:bg-[#F3F4F6] flex items-center gap-2.5 transition-colors border-t border-[#F3F4F6] cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-[#0A0A0A]">Payout list (PDF)</div>
                    <div className="text-[10px] text-[#6B7280]">Portrait · 3 lines with 2% TDS & signatures</div>
                  </div>
                </button>

                {/* 5. All Vouchers (PDF) */}
                <button
                  onClick={() => {
                    exportBulkVouchersPdf();
                    setIsExportOpen(false);
                  }}
                  disabled={isGeneratingBulk}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#0A0A0A] hover:bg-[#F3F4F6] flex items-center gap-2.5 transition-colors border-t border-[#F3F4F6] disabled:opacity-50 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-[#0A0A0A]">All vouchers (PDF)</div>
                    <div className="text-[10px] text-[#6B7280]">1 page/BCA · Net payable + QR verification</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E5E7EB] rounded-full transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#0A5C36] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name.charAt(0) : 'S'}
              </div>
              <span className="text-xs font-bold text-[#0A0A0A] tracking-wider uppercase">
                {user?.name || 'SAMAR RAJ'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#6B7280]" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-[#F3F4F6]">
                  <p className="text-xs font-bold text-[#0A0A0A]">{user?.name || 'SAMAR RAJ'}</p>
                  <p className="text-[10px] text-[#6B7280]">
                    {user?.username || 'SANJ00103S'} • {user?.role === 'admin' ? 'Administrator' : 'Viewer'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bulk Generation Progress Modal */}
      {isGeneratingBulk && bulkProgress && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-[#E5E7EB] text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0A0A0A]">Generating Commission Vouchers</h3>
              <p className="text-xs text-[#6B7280] mt-1">
                Creating QR verified voucher pages ({bulkProgress.current} / {bulkProgress.total})
              </p>
            </div>
            <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0A5C36] h-full transition-all duration-150"
                style={{ width: `${Math.round((bulkProgress.current / Math.max(bulkProgress.total, 1)) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-[#9CA3AF] font-mono">
              {Math.round((bulkProgress.current / Math.max(bulkProgress.total, 1)) * 100)}% complete
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A5C36] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-3 duration-150 border border-emerald-700">
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={dismissToast}
            className="text-emerald-200 hover:text-white transition-colors ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
