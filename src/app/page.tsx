'use client';

import React, { useMemo, useState } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { FilterDropdownsBar } from '@/components/FilterDropdownsBar';
import { AgentDataTable } from '@/components/AgentDataTable';
import {
  Users,
  Receipt,
  QrCode,
  FileSpreadsheet,
  ShieldCheck,
  UploadCloud,
  CalendarCheck,
  FileText,
  AlertCircle,
  ArrowRight,
  Pause,
  Play,
  X,
  TrendingUp,
  Download,
} from 'lucide-react';

export default function HomePage() {
  const {
    records,
    filteredRecords,
    summaryMetrics,
    selectedPeriod,
    activeTab,
    setActiveTab,
    filterByDistrict,
    filterByNeedsAttention,
    setSelectedAgent,
    setIsUploadModalOpen,
    exportCurrentPdf,
    exportPayoutListPdf,
    exportBulkVouchersPdf,
    exportCurrentExcel,
  } = useCommission();

  const [isTickerPaused, setIsTickerPaused] = useState(false);
  const [showNotice, setShowNotice] = useState(true);

  // District Commission Aggregations for the Bar Chart
  const districtAggregates = useMemo(() => {
    const map = new Map<string, { dist: string; totalComm: number; bcaCount: number }>();
    records.forEach((r) => {
      if (selectedPeriod !== 'ALL' && selectedPeriod && r.statementMonth !== selectedPeriod) return;
      const d = r.dist || 'Other';
      const curr = map.get(d) || { dist: d, totalComm: 0, bcaCount: 0 };
      curr.totalComm += r.bcComm;
      curr.bcaCount += 1;
      map.set(d, curr);
    });
    return Array.from(map.values())
      .sort((a, b) => b.totalComm - a.totalComm)
      .slice(0, 8); // Top 8 districts for clean bar chart
  }, [records, selectedPeriod]);

  const maxDistrictComm = useMemo(() => {
    return Math.max(...districtAggregates.map((d) => d.totalComm), 1);
  }, [districtAggregates]);

  // Top 5 BCAs by Payout
  const top5Bcas = useMemo(() => {
    const list = records.filter((r) => {
      if (selectedPeriod !== 'ALL' && selectedPeriod && r.statementMonth !== selectedPeriod) return false;
      return true;
    });
    return [...list].sort((a, b) => b.bcComm - a.bcComm).slice(0, 5);
  }, [records, selectedPeriod]);

  // Needs Attention Count (< 15 Login Days)
  const needsAttentionCount = useMemo(() => {
    return records.filter((r) => {
      if (selectedPeriod !== 'ALL' && selectedPeriod && r.statementMonth !== selectedPeriod) return false;
      return r.loginDays < 15;
    }).length;
  }, [records, selectedPeriod]);

  // Indian compact currency format
  const formatCompactInr = (num: number) => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  // Commission Action Modules with Screenshot Design Language
  const commissionModules = [
    {
      id: 'register',
      title: 'COMMISSION MASTER REGISTER',
      accentColor: 'border-l-4 border-l-[#15803D]',
      textColor: 'text-[#15803D]',
      icon: Users,
      btnLabel: 'View Register',
      btnBg: 'bg-[#E59819] hover:bg-[#D97706] text-white',
      action: () => setActiveTab('register'),
    },
    {
      id: 'payout_list',
      title: 'BCA DISBURSEMENT PAYOUT LIST',
      accentColor: 'border-l-4 border-l-[#15803D]',
      textColor: 'text-[#15803D]',
      icon: Receipt,
      btnLabel: 'Export PDF',
      btnBg: 'bg-[#E59819] hover:bg-[#D97706] text-white',
      action: () => exportPayoutListPdf(),
    },
    {
      id: 'vouchers',
      title: 'ALL VOUCHERS (QR VERIFIED)',
      accentColor: 'border-l-4 border-l-[#15803D]',
      textColor: 'text-[#15803D]',
      icon: QrCode,
      btnLabel: 'Generate All',
      btnBg: 'bg-[#E59819] hover:bg-[#D97706] text-white',
      action: () => exportBulkVouchersPdf(),
    },
    {
      id: 'excel_export',
      title: 'STATEMENT EXCEL (33 COLUMNS)',
      accentColor: 'border-l-4 border-l-[#3B82F6]',
      textColor: 'text-[#2563EB]',
      icon: FileSpreadsheet,
      btnLabel: 'Download Excel',
      btnBg: 'bg-[#4338CA] hover:bg-[#3730A3] text-white',
      action: () => exportCurrentExcel(),
    },
    {
      id: 'schemes',
      title: 'SOCIAL SECURITY SCHEMES (SSS)',
      accentColor: 'border-l-4 border-l-[#3B82F6]',
      textColor: 'text-[#2563EB]',
      icon: ShieldCheck,
      btnLabel: 'Open Portal',
      btnBg: 'bg-[#4338CA] hover:bg-[#3730A3] text-white',
      action: () => {
        window.location.href = '/social-schemes';
      },
    },
    {
      id: 'upload_statement',
      title: 'MONTHLY STATEMENT IMPORT',
      accentColor: 'border-l-4 border-l-[#15803D]',
      textColor: 'text-[#15803D]',
      icon: UploadCloud,
      btnLabel: 'Upload File',
      btnBg: 'bg-[#E59819] hover:bg-[#D97706] text-white',
      action: () => setIsUploadModalOpen(true),
    },
    {
      id: 'attendance',
      title: 'ATTENDANCE & LOGIN TARGETS',
      accentColor: 'border-l-4 border-l-[#15803D]',
      textColor: 'text-[#15803D]',
      icon: CalendarCheck,
      btnLabel: 'Review List',
      btnBg: 'bg-[#E59819] hover:bg-[#D97706] text-white',
      action: () => filterByNeedsAttention(),
    },
    {
      id: 'summary_report',
      title: 'REGIONAL SUMMARY REPORT',
      accentColor: 'border-l-4 border-l-[#15803D]',
      textColor: 'text-[#15803D]',
      icon: FileText,
      btnLabel: 'Generate PDF',
      btnBg: 'bg-[#15803D] hover:bg-[#166534] text-white',
      action: () => exportCurrentPdf(),
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Ticker / Notice Banner (Matching Screenshot Design) */}
      {showNotice && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg shadow-xs overflow-hidden flex items-center justify-between px-3 py-1.5 text-xs text-[#92400E]">
          <div className="flex items-center gap-3 overflow-hidden flex-1 mr-4">
            {/* Saffron NOTICE Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#D97706] text-white font-bold rounded text-[11px] uppercase tracking-wider shrink-0 shadow-xs">
              <span>NOTICE</span>
            </div>

            {/* Marquee Notice Content */}
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <div className={`inline-block font-medium ${isTickerPaused ? '' : 'animate-marquee'}`}>
                Ensure to follow the working hours from 8 AM to 8 PM - Keep the working place clean with proper sitting arrangements for the customer - All Business Correspondents must complete monthly statement reconciliation by 10th of every month - APY, PMSBY, PMJJBY social security schemes must be strictly enrolled as per RBI & DFS guidelines.
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0 text-[#B45309]">
            <button
              onClick={() => setIsTickerPaused(!isTickerPaused)}
              className="p-1 hover:bg-[#FEF3C7] rounded text-[#92400E]"
              title={isTickerPaused ? 'Play Notice' : 'Pause Notice'}
            >
              {isTickerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowNotice(false)}
              className="p-1 hover:bg-[#FEF3C7] rounded text-[#92400E]"
              title="Close Notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Commission Action Module Cards (Clean card styling matching screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {commissionModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              className={`bg-white rounded-lg p-3.5 shadow-xs border border-[#E5E7EB] ${mod.accentColor} flex flex-col justify-between hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className={`text-[11px] font-bold tracking-tight uppercase leading-snug ${mod.textColor}`}>
                  {mod.title}
                </h4>
                <Icon className="w-5 h-5 text-[#9CA3AF]/40 shrink-0" />
              </div>

              <div className="mt-4 pt-2">
                <button
                  onClick={mod.action}
                  className={`px-4 py-1 rounded text-[11px] font-bold transition-all shadow-xs ${mod.btnBg}`}
                >
                  {mod.btnLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Tab Switcher Header (Overview vs BCA Master Register) */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pt-3 pb-3">
        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-[#0A5C36] shadow-xs'
                : 'text-[#64748B] hover:text-[#0A0A0A]'
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'register'
                ? 'bg-white text-[#0A5C36] shadow-xs'
                : 'text-[#64748B] hover:text-[#0A0A0A]'
            }`}
          >
            <span>Commission Master Register</span>
            <span className="text-[10px] bg-[#E2E8F0] text-[#0A5C36] font-bold px-1.5 py-0.2 rounded-full font-mono">
              {filteredRecords.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-[#6B7280]">
          Statement: <span className="font-bold text-[#0A5C36]">{selectedPeriod === 'ALL' ? 'All Months' : selectedPeriod}</span>
        </div>
      </div>

      {activeTab === 'overview' ? (
        /* ==================== OVERVIEW VIEW ==================== */
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 3 Headline Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Gross Commission */}
            <div className="clean-card p-5 space-y-1 bg-white border border-[#E5E7EB] border-t-3 border-t-[#0A5C36]">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Gross Reconciled Commission</span>
              <div className="text-3xl font-extrabold text-[#0A0A0A] tabular-nums tracking-tight">
                {formatCompactInr(summaryMetrics.totalNetCommission)}
              </div>
              <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1">
                <span>Exact: ₹{summaryMetrics.totalNetCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">100% Reconciled</span>
              </div>
            </div>

            {/* 2. BCA Payout (80%) */}
            <div className="clean-card p-5 space-y-1 bg-[#F0FDF4] border border-[#BBF7D0] border-t-3 border-t-[#15803D]">
              <span className="text-xs font-semibold text-[#166534] uppercase tracking-wider">BCA Disbursement (80% Share)</span>
              <div className="text-3xl font-extrabold text-[#15803D] tabular-nums tracking-tight">
                {formatCompactInr(summaryMetrics.totalBcCommission)}
              </div>
              <div className="flex items-center justify-between text-xs text-[#166534] pt-1">
                <span>Exact: ₹{summaryMetrics.totalBcCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="font-bold">{summaryMetrics.totalAgents} Active BCAs</span>
              </div>
            </div>

            {/* 3. Corporate Share (20%) */}
            <div className="clean-card p-5 space-y-1 bg-white border border-[#E5E7EB] border-t-3 border-t-[#0A5C36]">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Corporate Share (20%)</span>
              <div className="text-3xl font-extrabold text-[#0A5C36] tabular-nums tracking-tight">
                {formatCompactInr(summaryMetrics.totalCorpCommission)}
              </div>
              <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1">
                <span>Exact: ₹{summaryMetrics.totalCorpCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span>Sanjivani Foundation</span>
              </div>
            </div>
          </div>

          {/* 2 Visuals: Commission by District Bar Chart + Top 5 BCAs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Visual 1: Commission by District (Clickable Bars) */}
            <div className="lg:col-span-2 clean-card p-5 space-y-4 bg-white border border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0A]">District-Wise Commission Breakdown</h3>
                  <p className="text-xs text-[#6B7280]">Click any district bar to filter the BCA Register</p>
                </div>
                <span className="text-xs text-[#0A5C36] font-bold">BCA 80% Share</span>
              </div>

              {/* Horizontal / Bar visualization */}
              <div className="space-y-3 pt-2">
                {districtAggregates.map((item) => {
                  const percentage = Math.round((item.totalComm / maxDistrictComm) * 100);

                  return (
                    <div
                      key={item.dist}
                      onClick={() => filterByDistrict(item.dist)}
                      className="group cursor-pointer space-y-1 hover:bg-[#F0FDF4] p-2 rounded-lg transition-colors"
                      title={`Click to view all ${item.bcaCount} BCAs in ${item.dist}`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#0A0A0A] group-hover:text-[#0A5C36] flex items-center gap-1.5">
                          <span>{item.dist}</span>
                          <span className="text-[10px] text-[#6B7280] font-normal">({item.bcaCount} BCAs)</span>
                        </span>
                        <span className="font-bold tabular-nums text-[#0A0A0A]">
                          ₹{item.totalComm.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      {/* Bar Track */}
                      <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0A5C36] group-hover:bg-[#15803D] transition-all duration-300 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual 2: Top 5 BCAs */}
            <div className="clean-card p-5 space-y-4 flex flex-col justify-between bg-white border border-[#E5E7EB]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#0A0A0A]">Top Performing BCAs</h3>
                  <span className="text-xs font-semibold text-[#0A5C36]">Highest Payout</span>
                </div>

                <div className="divide-y divide-[#F1F5F9] text-xs">
                  {top5Bcas.map((bca, index) => (
                    <div
                      key={bca.id}
                      onClick={() => setSelectedAgent(bca)}
                      className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F0FDF4] px-1.5 rounded-lg transition-colors group"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-[#0A0A0A] group-hover:text-[#0A5C36] flex items-center gap-1.5">
                          <span className="text-[11px] text-[#6B7280] font-mono w-3.5">#{index + 1}</span>
                          <span className="truncate max-w-[120px]">{bca.bcaName}</span>
                        </div>
                        <div className="text-[10px] text-[#6B7280] pl-5">
                          {bca.dist} • {bca.baseBranch}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#15803D] tabular-nums">
                          ₹{bca.bcComm.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-[10px] text-[#6B7280]">
                          {bca.financialTxn} txns
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('register')}
                className="w-full mt-3 py-2 px-3 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#084B26] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>View All {records.length} BCAs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Needs Attention Module */}
          <div className="clean-card p-4 flex items-center justify-between bg-[#FFFBEB] border border-[#FDE68A] rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#92400E]">Needs attention:</span>{' '}
                <span className="text-xs text-[#78350F]">
                  <strong>{needsAttentionCount} BCAs</strong> have fewer than 15 login days in this statement period.
                </span>
              </div>
            </div>
            <button
              onClick={filterByNeedsAttention}
              className="flex items-center gap-1 text-xs font-bold text-[#92400E] hover:underline whitespace-nowrap ml-4"
            >
              <span>View list</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* ==================== BCA REGISTER VIEW ==================== */
        <div className="space-y-4 animate-in fade-in duration-150">
          <FilterDropdownsBar />
          <AgentDataTable />
        </div>
      )}
    </div>
  );
}
