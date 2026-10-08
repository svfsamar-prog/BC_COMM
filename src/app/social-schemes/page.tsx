'use client';

import React, { useState, useMemo } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { FilterDropdownsBar } from '@/components/FilterDropdownsBar';
import { ShieldCheck, ArrowUpDown, ArrowUp, ArrowDown, Award, Users } from 'lucide-react';
import { CommissionRecord } from '@/types/commission';

export default function SocialSchemesPage() {
  const { filteredRecords, summaryMetrics, setSelectedAgent, selectedPeriod } = useCommission();

  const [sortField, setSortField] = useState<keyof CommissionRecord>('incentive10Sss');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Sorting
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortAsc
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      return sortAsc
        ? Number(aVal || 0) - Number(bVal || 0)
        : Number(bVal || 0) - Number(aVal || 0);
    });
    return list;
  }, [filteredRecords, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, safePage, pageSize]);

  const toggleSort = (field: keyof CommissionRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <div>
          <h1 className="text-lg font-bold text-[#0A0A0A]">Social Security Schemes (SSS)</h1>
          <p className="text-xs text-[#6B7280]">
            Performance across APY, PMSBY, PMJJBY insurance policies and 10% scheme bonuses
          </p>
        </div>
        <div className="text-xs text-[#6B7280]">
          Period: <span className="font-semibold text-[#0A0A0A]">{selectedPeriod === 'ALL' ? 'All Months' : selectedPeriod}</span>
        </div>
      </div>

      {/* 3 Macro SSS Scheme Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. APY (Atal Pension Yojana) */}
        <div className="clean-card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium">Atal Pension Yojana (APY)</span>
            <span className="bg-[#F3F4F6] text-[#374151] px-1.5 py-0.2 rounded font-mono text-[10px]">APY</span>
          </div>
          <div className="text-2xl font-bold text-[#0A0A0A] tabular-nums">
            {summaryMetrics.totalApyCount.toLocaleString()} <span className="text-xs font-normal text-[#6B7280]">policies</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium tabular-nums pt-0.5">
            ₹{summaryMetrics.totalApyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })} commission
          </div>
        </div>

        {/* 2. PMSBY (Suraksha Bima Yojana) */}
        <div className="clean-card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium">Suraksha Bima Yojana (PMSBY)</span>
            <span className="bg-[#F3F4F6] text-[#374151] px-1.5 py-0.2 rounded font-mono text-[10px]">PMSBY</span>
          </div>
          <div className="text-2xl font-bold text-[#0A0A0A] tabular-nums">
            {summaryMetrics.totalSbyCount.toLocaleString()} <span className="text-xs font-normal text-[#6B7280]">policies</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium tabular-nums pt-0.5">
            ₹{summaryMetrics.totalSbyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })} commission
          </div>
        </div>

        {/* 3. PMJJBY (Jeevan Jyoti Bima Yojana) */}
        <div className="clean-card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-medium">Jeevan Jyoti Bima (PMJJBY)</span>
            <span className="bg-[#F3F4F6] text-[#374151] px-1.5 py-0.2 rounded font-mono text-[10px]">PMJJBY</span>
          </div>
          <div className="text-2xl font-bold text-[#0A0A0A] tabular-nums">
            {summaryMetrics.totalJbyCount.toLocaleString()} <span className="text-xs font-normal text-[#6B7280]">policies</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium tabular-nums pt-0.5">
            ₹{summaryMetrics.totalJbyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })} commission
          </div>
        </div>
      </div>

      {/* 10% Incentive Banner */}
      {summaryMetrics.totalSssIncentive > 0 && (
        <div className="clean-card p-3 bg-[#FFFBEB] border-amber-200 flex items-center justify-between text-xs text-[#92400E]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>10% SSS Scheme Bonus:</strong> Special performance incentive of{' '}
              <strong>₹{summaryMetrics.totalSssIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> awarded across top performing BCAs.
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterDropdownsBar />

      {/* SSS Register Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB] text-[#6B7280] font-medium select-none sticky top-0 z-10">
                <th
                  onClick={() => toggleSort('bcaName')}
                  className="py-3 px-4 cursor-pointer hover:text-[#0A0A0A]"
                >
                  Agent
                </th>
                <th
                  onClick={() => toggleSort('dist')}
                  className="py-3 px-4 cursor-pointer hover:text-[#0A0A0A]"
                >
                  District
                </th>
                <th
                  onClick={() => toggleSort('apyCount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#0A0A0A]"
                >
                  APY
                </th>
                <th
                  onClick={() => toggleSort('sbyCount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#0A0A0A]"
                >
                  PMSBY
                </th>
                <th
                  onClick={() => toggleSort('jbyCount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#0A0A0A]"
                >
                  PMJJBY
                </th>
                <th
                  onClick={() => toggleSort('incentive10Sss')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#0A0A0A]"
                >
                  10% Bonus
                </th>
                <th
                  onClick={() => toggleSort('bcComm')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#0A0A0A]"
                >
                  Total BCA Payout
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#0A0A0A]">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedAgent(r)}
                    className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0A0A0A]">{r.bcaName}</div>
                      <div className="text-[11px] text-[#6B7280] font-mono">{r.agentId}</div>
                    </td>
                    <td className="py-3 px-4 text-[#374151]">{r.dist}</td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      <span className="font-medium">{r.apyCount}</span>
                      <span className="text-[10px] text-[#6B7280] block">₹{r.apyComm.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      <span className="font-medium">{r.sbyCount}</span>
                      <span className="text-[10px] text-[#6B7280] block">₹{r.sbyComm.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      <span className="font-medium">{r.jbyCount}</span>
                      <span className="text-[10px] text-[#6B7280] block">₹{r.jbyComm.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium text-amber-700">
                      {r.incentive10Sss > 0 ? `₹${r.incentive10Sss.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums text-[#15803D]">
                      ₹{r.bcComm.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B7280]">
                    <Users className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-[#0A0A0A]">No records matching filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
