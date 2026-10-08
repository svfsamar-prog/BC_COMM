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
  Grid,
  Menu,
  User,
  LogOut,
  Clock,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    availableMonths,
    selectedPeriod,
    setSelectedPeriod,
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
      // Format: Thursday, 8 October 2026
      const dateStr = now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      // Format: 05:18 PM
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

  const scopeLabel = `${filteredRecords.length} BCAs · ${filters.dist || filters.state || 'All Districts'} · ${selectedPeriod === 'ALL' ? 'All Months' : selectedPeriod}`;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between gap-3 shadow-xs">
        {/* Left: Search Bar with (Ctrl + /) shortcut as in screenshot */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
              placeholder="Search modules, reports, or anything... (Ctrl + /)"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0A5C36] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right: Live Date & Time, Period, Upload, Export, and Profile */}
        <div className="flex items-center gap-2.5">
          {/* Live Clock Badge (Green pill matching screenshot) */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-[#F0FDF4] border border-[#DCFCE7] rounded-full text-xs font-medium text-[#166534]">
            <Calendar className="w-3.5 h-3.5 text-[#15803D]" />
            <span>{currentDateTime || 'Thursday, 8 October 2026'}</span>
            <span className="bg-[#0A5C36] text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {currentTimeStr || '05:18 PM'}
            </span>
          </div>

          {/* Period Selector Dropdown */}
          <div className="relative" ref={periodRef}>
            <button
              onClick={() => setIsPeriodOpen(!isPeriodOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#374151] bg-[#FAFAFA] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg transition-fast"
            >
              <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
              <span className="hidden sm:inline">Period:</span>
              <span className="font-semibold text-[#0A0A0A]">{selectedPeriod === 'ALL' ? 'All Months' : selectedPeriod}</span>
              <ChevronDown className="w-3 h-3 text-[#6B7280]" />
            </button>

            {isPeriodOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#6B7280] border-b border-[#F3F4F6]">
                  Select Statement Period
                </div>
                {availableMonths.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedPeriod(m);
                      setIsPeriodOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#0A0A0A] hover:bg-[#F3F4F6] flex items-center justify-between transition-colors"
                  >
                    <span>{m}</span>
                    {selectedPeriod === m && <Check className="w-3.5 h-3.5 text-[#0A5C36]" />}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSelectedPeriod('ALL');
                    setIsPeriodOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#0A0A0A] hover:bg-[#F3F4F6] flex items-center justify-between border-t border-[#F3F4F6] transition-colors"
                >
                  <span>All Periods Combined</span>
                  {selectedPeriod === 'ALL' && <Check className="w-3.5 h-3.5 text-[#0A5C36]" />}
                </button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0A5C36] hover:bg-[#084B26] rounded-lg transition-fast shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A5C36] bg-white hover:bg-[#F0FDF4] border border-[#0A5C36] rounded-lg transition-fast shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-[#E5E7EB] rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* Dynamic Scope Header */}
                <div className="px-3.5 py-2 text-[11px] text-[#6B7280] bg-[#FAFAFA] border-b border-[#E5E7EB]">
                  <div className="font-semibold text-[#0A0A0A] truncate">{scopeLabel}</div>
                  <div className="text-[10px] text-[#9CA3AF] mt-0.5">Select export format below</div>
                </div>

                {/* 1. Summary Report (PDF) */}
                <button
                  onClick={() => {
                    exportCurrentPdf();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#0A0A0A] hover:bg-[#F3F4F6] flex items-center gap-2.5 transition-colors"
                >
                  <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-medium text-[#0A0A0A]">Summary report (PDF)</div>
                    <div className="text-[10px] text-[#6B7280]">Landscape · Executive + 9-col register</div>
                  </div>
                </button>

                {/* 2. Payout List (PDF) */}
                <button
                  onClick={() => {
                    exportPayoutListPdf();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#0A0A0A] hover:bg-[#F3F4F6] flex items-center gap-2.5 transition-colors border-t border-[#F3F4F6]"
                >
                  <ClipboardList className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="font-medium text-[#0A0A0A]">Payout list (PDF)</div>
                    <div className="text-[10px] text-[#6B7280]">Portrait · Signatures & words total</div>
                  </div>
                </button>

                {/* 3. All Vouchers (PDF) */}
                <button
                  onClick={() => {
                    exportBulkVouchersPdf();
                    setIsExportOpen(false);
                  }}
                  disabled={isGeneratingBulk}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#0A0A0A] hover:bg-[#F3F4F6] flex items-center gap-2.5 transition-colors border-t border-[#F3F4F6] disabled:opacity-50"
                >
                  <QrCode className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-medium text-[#0A0A0A]">All vouchers (PDF)</div>
                    <div className="text-[10px] text-[#6B7280]">1 page/BCA · Verifiable QR codes</div>
                  </div>
                </button>

                {/* 4. Excel (full 33 columns) */}
                <button
                  onClick={() => {
                    exportCurrentExcel();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#0A0A0A] hover:bg-[#F3F4F6] flex items-center gap-2.5 transition-colors border-t border-[#F3F4F6]"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-medium text-[#0A0A0A]">Excel (full 33 columns)</div>
                    <div className="text-[10px] text-[#6B7280]">Complete financial matrix with totals</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Pill (SAMAR RAJ) matching screenshot */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E5E7EB] rounded-full transition-colors"
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
                  <p className="text-[10px] text-[#6B7280]">{user?.username || 'SANJ00103S'} • Admin</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
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
            {/* Progress Bar */}
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

      {/* Floating Toast Notification with Undo */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A5C36] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-3 duration-150 border border-emerald-700">
          <span className="font-medium">{toast.message}</span>
          {toast.onUndo && (
            <button
              onClick={() => {
                toast.onUndo?.();
                dismissToast();
              }}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white font-semibold px-2 py-1 rounded transition-colors"
            >
              <Undo2 className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}
          <button
            onClick={dismissToast}
            className="text-emerald-200 hover:text-white transition-colors ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
