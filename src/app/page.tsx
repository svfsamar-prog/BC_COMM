'use client';

import React, { useMemo } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { FilterDropdownsBar } from '@/components/FilterDropdownsBar';
import { AgentDataTable } from '@/components/AgentDataTable';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  Loader2,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';

export default function HomePage() {
  const {
    records,
    filteredRecords,
    summaryMetrics,
    selectedPeriod,
    statementMonthLabel,
    activeTab,
    setActiveTab,
    filterByDistrict,
    filterByNeedsAttention,
    setSelectedAgent,
    reconciliation,
    isLoadingDb,
    dbError,
    refreshData,
    setIsUploadModalOpen,
  } = useCommission();

  // District Commission Aggregations for the Bar Chart
  const districtAggregates = useMemo(() => {
    const map = new Map<string, { dist: string; totalComm: number; bcaCount: number }>();
    records.forEach((r) => {
      const d = r.dist || 'Other';
      const curr = map.get(d) || { dist: d, totalComm: 0, bcaCount: 0 };
      curr.totalComm += r.bcComm;
      curr.bcaCount += 1;
      map.set(d, curr);
    });
    return Array.from(map.values())
      .sort((a, b) => b.totalComm - a.totalComm)
      .slice(0, 8);
  }, [records]);

  const maxDistrictComm = useMemo(() => {
    return Math.max(...districtAggregates.map((d) => d.totalComm), 1);
  }, [districtAggregates]);

  // Top 5 BCAs by Payout
  const top5Bcas = useMemo(() => {
    return [...records].sort((a, b) => (b.bcComm || 0) - (a.bcComm || 0)).slice(0, 5);
  }, [records]);

  // Needs Attention Count (< 15 Login Days)
  const needsAttentionCount = useMemo(() => {
    return records.filter((r) => r.loginDays < 15).length;
  }, [records]);

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

  // 1. Loading State (U8)
  if (isLoadingDb && records.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-[#E5E7EB] p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A5C36]" />
        <p className="text-sm font-semibold text-[#0A0A0A]">Loading commission records from database...</p>
        <p className="text-xs text-[#6B7280]">Statement Period: {statementMonthLabel}</p>
      </div>
    );
  }

  // 2. Error State with Retry (U8)
  if (dbError && records.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 bg-white rounded-xl border border-rose-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0A0A0A]">Failed to load commission data</h2>
          <p className="text-xs text-rose-600 mt-1 max-w-md">{dbError}</p>
        </div>
        <button
          onClick={refreshData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A5C36] hover:bg-[#084B26] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // 3. Empty State with Import (U8)
  if (!isLoadingDb && records.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#0A5C36]">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0A0A0A]">No records found for {statementMonthLabel}</h2>
          <p className="text-xs text-[#6B7280] mt-1 max-w-md">
            No bank statement has been uploaded for this period yet. Upload the bank Excel file to populate the register.
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A5C36] hover:bg-[#084B26] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Import Statement File</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Header Banner & Reconciliation Status */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#0A0A0A]">
              Commission Statement Overview
            </h1>
            <span className="text-xs bg-emerald-100 text-[#0A5C36] font-bold px-2 py-0.5 rounded-full">
              {statementMonthLabel}
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time financial reconciliation and performance metrics
          </p>
        </div>

        {/* Reconciliation Status Badge */}
        <div className="flex items-center gap-2">
          {reconciliation.isReconciled ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-xs font-semibold text-[#15803D]">
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
              <span>{reconciliation.statusText}</span>
              <span className="text-[11px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
                {reconciliation.actualCount} Agents
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Discrepancy: {reconciliation.actualCount} / {reconciliation.expectedCount} Agents</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Key Metric Cards (Phase 4 Default Dashboard) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Agents */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] space-y-1">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Agents</span>
            <Users className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0A0A0A] tabular-nums">
            {summaryMetrics.totalAgents.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#6B7280]">
            <strong className="text-[#0A5C36]">{summaryMetrics.activeAgents}</strong> Active (&gt;0 days)
          </div>
        </div>

        {/* Card 2: Avg Login % */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] space-y-1">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Attendance</span>
            <Activity className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0A0A0A] tabular-nums">
            {summaryMetrics.avgLoginPercentage}%
          </div>
          <div className="text-[10px] text-[#6B7280]">Average across terminals</div>
        </div>

        {/* Card 3: Gross Commission */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] space-y-1 border-t-3 border-t-[#0A5C36]">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gross Commission</span>
            <TrendingUp className="w-4 h-4 text-[#0A5C36]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0A0A0A] tabular-nums">
            {formatCompactInr(summaryMetrics.totalNetCommission)}
          </div>
          <div className="text-[10px] text-[#6B7280] truncate" title={`Exact: ₹${summaryMetrics.totalNetCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}>
            ₹{summaryMetrics.totalNetCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 4: BCA Payout (80%) */}
        <div className="bg-[#F0FDF4] p-3.5 rounded-xl border border-[#BBF7D0] space-y-1 border-t-3 border-t-[#15803D]">
          <div className="flex items-center justify-between text-[#166534]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">BCA Payout (80%)</span>
            <span className="text-[10px] bg-emerald-200 text-[#166534] font-bold px-1.5 py-0.2 rounded">80%</span>
          </div>
          <div className="text-2xl font-extrabold text-[#15803D] tabular-nums">
            {formatCompactInr(summaryMetrics.totalBcCommission)}
          </div>
          <div className="text-[10px] text-[#166534] truncate">
            ₹{summaryMetrics.totalBcCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 5: Corporate Share (20%) */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] space-y-1 border-t-3 border-t-[#0A5C36]">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Corporate Share</span>
            <span className="text-[10px] bg-slate-100 text-[#475569] font-bold px-1.5 py-0.2 rounded">20%</span>
          </div>
          <div className="text-2xl font-extrabold text-[#0A0A0A] tabular-nums">
            {formatCompactInr(summaryMetrics.totalCorpCommission)}
          </div>
          <div className="text-[10px] text-[#6B7280] truncate">
            ₹{summaryMetrics.totalCorpCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 6: TDS Deduction (2%) */}
        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-1 border-t-3 border-t-amber-600">
          <div className="flex items-center justify-between text-amber-900">
            <span className="text-[11px] font-semibold uppercase tracking-wider">TDS (2% BCA)</span>
            <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded">2%</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-900 tabular-nums">
            {formatCompactInr(summaryMetrics.totalTdsDeduction)}
          </div>
          <div className="text-[10px] text-amber-800 truncate">
            Net: {formatCompactInr(summaryMetrics.totalNetPayable)}
          </div>
        </div>
      </div>

      {/* 3. Social Security Schemes (SSS) Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* APY */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Atal Pension (APY)</span>
            <div className="text-2xl font-extrabold text-[#0A0A0A] tabular-nums">
              {summaryMetrics.totalApyCount.toLocaleString()} <span className="text-xs font-normal text-[#6B7280]">policies</span>
            </div>
            <div className="text-xs text-[#0A5C36] font-semibold">
              Comm: ₹{summaryMetrics.totalApyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#0A5C36] flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* PMSBY */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Suraksha Bima (PMSBY)</span>
            <div className="text-2xl font-extrabold text-[#0A0A0A] tabular-nums">
              {summaryMetrics.totalSbyCount.toLocaleString()} <span className="text-xs font-normal text-[#6B7280]">policies</span>
            </div>
            <div className="text-xs text-[#0A5C36] font-semibold">
              Comm: ₹{summaryMetrics.totalSbyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* PMJJBY */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Jeevan Jyoti (PMJJBY)</span>
            <div className="text-2xl font-extrabold text-[#0A0A0A] tabular-nums">
              {summaryMetrics.totalJbyCount.toLocaleString()} <span className="text-xs font-normal text-[#6B7280]">policies</span>
            </div>
            <div className="text-xs text-[#0A5C36] font-semibold">
              Comm: ₹{summaryMetrics.totalJbyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Tab Switcher (Overview vs BCA Master Register) */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pt-1 pb-3">
        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-[#0A5C36] shadow-xs'
                : 'text-[#64748B] hover:text-[#0A0A0A]'
            }`}
          >
            Dashboard Performance
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-[#0A5C36] shadow-xs'
                : 'text-[#64748B] hover:text-[#0A0A0A]'
            }`}
          >
            <span>Commission Register</span>
            <span className="text-[10px] bg-[#E2E8F0] text-[#0A5C36] font-bold px-1.5 py-0.2 rounded-full font-mono">
              {filteredRecords.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-[#6B7280]">
          Statement: <span className="font-bold text-[#0A5C36]">{statementMonthLabel}</span>
        </div>
      </div>

      {activeTab === 'overview' ? (
        /* ==================== OVERVIEW VIEW ==================== */
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Visuals: District Breakdown + Top 5 BCAs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Visual 1: Commission by District */}
            <div className="lg:col-span-2 bg-white rounded-xl p-5 space-y-4 border border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0A]">District-Wise Commission Breakdown</h3>
                  <p className="text-xs text-[#6B7280]">Click any district bar to filter the Commission Register</p>
                </div>
                <span className="text-xs text-[#0A5C36] font-bold">BCA 80% Share</span>
              </div>

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
            <div className="bg-white rounded-xl p-5 space-y-4 flex flex-col justify-between border border-[#E5E7EB]">
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
                className="w-full mt-3 py-2 px-3 text-xs font-bold text-white bg-[#0A5C36] hover:bg-[#084B26] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>View All {records.length} BCAs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Needs Attention Module */}
          <div className="p-4 flex items-center justify-between bg-[#FFFBEB] border border-[#FDE68A] rounded-xl">
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
              className="flex items-center gap-1 text-xs font-bold text-[#92400E] hover:underline whitespace-nowrap ml-4 cursor-pointer"
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
