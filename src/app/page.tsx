'use client';

import React, { useMemo } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { FilterDropdownsBar } from '@/components/FilterDropdownsBar';
import { AgentDataTable } from '@/components/AgentDataTable';
import { AlertCircle, ArrowRight, BarChart2, TrendingUp, Users, Building, ArrowUpRight } from 'lucide-react';

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
  } = useCommission();

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

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header (Overview vs BCA Register) */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-fast ${
              activeTab === 'overview'
                ? 'bg-white text-[#0A0A0A] shadow-xs'
                : 'text-[#6B7280] hover:text-[#0A0A0A]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-fast flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-white text-[#0A0A0A] shadow-xs'
                : 'text-[#6B7280] hover:text-[#0A0A0A]'
            }`}
          >
            <span>BCA Register</span>
            <span className="text-[10px] bg-[#E5E7EB] text-[#374151] px-1.5 py-0.2 rounded-full font-mono">
              {filteredRecords.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-[#6B7280]">
          Statement: <span className="font-semibold text-[#0A0A0A]">{selectedPeriod === 'ALL' ? 'All Months' : selectedPeriod}</span>
        </div>
      </div>

      {activeTab === 'overview' ? (
        /* ==================== OVERVIEW VIEW ==================== */
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 3 Headline Numbers (Visible in 1st second without scrolling) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Gross Commission */}
            <div className="clean-card p-5 space-y-1">
              <span className="text-xs font-medium text-[#6B7280]">Gross commission</span>
              <div className="text-3xl font-extrabold text-[#0A0A0A] tabular-nums tracking-tight">
                {formatCompactInr(summaryMetrics.totalNetCommission)}
              </div>
              <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1">
                <span>Exact: ₹{summaryMetrics.totalNetCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Reconciled</span>
              </div>
            </div>

            {/* 2. BCA Payout (80%) */}
            <div className="clean-card p-5 space-y-1 bg-[#F0FDF4]/30 border-emerald-200">
              <span className="text-xs font-medium text-[#166534]">BCA payout (80%)</span>
              <div className="text-3xl font-extrabold text-[#15803D] tabular-nums tracking-tight">
                {formatCompactInr(summaryMetrics.totalBcCommission)}
              </div>
              <div className="flex items-center justify-between text-xs text-[#166534] pt-1">
                <span>Exact: ₹{summaryMetrics.totalBcCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="font-medium">{summaryMetrics.totalAgents} BCAs</span>
              </div>
            </div>

            {/* 3. Corporate Share (20%) */}
            <div className="clean-card p-5 space-y-1">
              <span className="text-xs font-medium text-[#6B7280]">Corporate (20%)</span>
              <div className="text-3xl font-extrabold text-[#0F2942] tabular-nums tracking-tight">
                {formatCompactInr(summaryMetrics.totalCorpCommission)}
              </div>
              <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1">
                <span>Exact: ₹{summaryMetrics.totalCorpCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span>Foundation Share</span>
              </div>
            </div>
          </div>

          {/* 2 Visuals: Commission by District Bar Chart + Top 5 BCAs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual 1: Commission by District (Clickable Bars) */}
            <div className="lg:col-span-2 clean-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#0A0A0A]">Commission by district</h3>
                  <p className="text-xs text-[#6B7280]">Click any district bar to inspect filtered agent register</p>
                </div>
                <span className="text-xs text-[#6B7280] font-mono">BCA 80% Share</span>
              </div>

              {/* Horizontal / Bar visualization */}
              <div className="space-y-3 pt-2">
                {districtAggregates.map((item) => {
                  const percentage = Math.round((item.totalComm / maxDistrictComm) * 100);

                  return (
                    <div
                      key={item.dist}
                      onClick={() => filterByDistrict(item.dist)}
                      className="group cursor-pointer space-y-1 hover:bg-[#F9FAFB] p-1.5 rounded transition-colors"
                      title={`Click to view all ${item.bcaCount} BCAs in ${item.dist}`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#0A0A0A] group-hover:text-[#0F2942] flex items-center gap-1">
                          <span>{item.dist}</span>
                          <span className="text-[10px] text-[#6B7280]">({item.bcaCount} BCAs)</span>
                        </span>
                        <span className="font-semibold tabular-nums text-[#0A0A0A]">
                          ₹{item.totalComm.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      {/* Bar Track */}
                      <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0F2942] group-hover:bg-emerald-600 transition-all duration-300 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual 2: Top 5 BCAs */}
            <div className="clean-card p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#0A0A0A]">Top 5 BCAs</h3>
                  <span className="text-xs text-[#6B7280]">Highest Payout</span>
                </div>

                <div className="divide-y divide-[#E5E7EB] text-xs">
                  {top5Bcas.map((bca, index) => (
                    <div
                      key={bca.id}
                      onClick={() => setSelectedAgent(bca)}
                      className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F9FAFB] px-1 rounded transition-colors group"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-[#0A0A0A] group-hover:text-[#0F2942] flex items-center gap-1.5">
                          <span className="text-[11px] text-[#6B7280] font-mono w-3.5">#{index + 1}</span>
                          <span className="truncate max-w-[120px]">{bca.bcaName}</span>
                        </div>
                        <div className="text-[10px] text-[#6B7280] pl-5">
                          {bca.dist} • {bca.baseBranch}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#15803D] tabular-nums">
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
                className="w-full mt-3 py-2 px-3 text-xs font-medium text-[#0F2942] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-md transition-colors flex items-center justify-center gap-1"
              >
                <span>View All {records.length} BCAs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Needs Attention Module */}
          <div className="clean-card p-4 flex items-center justify-between bg-[#FFFBEB]/50 border-amber-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-[#92400E]">Needs attention:</span>{' '}
                <span className="text-xs text-[#78350F]">
                  <strong>{needsAttentionCount} BCAs</strong> have fewer than 15 login days in this statement period.
                </span>
              </div>
            </div>
            <button
              onClick={filterByNeedsAttention}
              className="flex items-center gap-1 text-xs font-medium text-[#92400E] hover:underline whitespace-nowrap ml-4"
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
