'use client';

import React, { useState, useMemo } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { FilterDropdownsBar } from '@/components/FilterDropdownsBar';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Award, Users, Shield } from 'lucide-react';
import { CommissionRecord } from '@/types/commission';

export default function SocialSchemesPage() {
  const { filteredRecords, summaryMetrics, setSelectedAgent, statementMonthLabel, handleResetFilters } = useCommission();

  const [sortField, setSortField] = useState<keyof CommissionRecord>('incentive10Sss');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

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

  const renderSortIcon = (field: keyof CommissionRecord) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-[#0A5C36]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#0A5C36]" />
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#0A0A0A]">Social Security Schemes (SSS)</h1>
            <span className="text-xs bg-emerald-100 text-[#0A5C36] font-bold px-2 py-0.5 rounded-full">
              {statementMonthLabel}
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Performance across APY, PMSBY, PMJJBY insurance policies and scheme bonuses
          </p>
        </div>
      </div>

      {/* 3 Macro SSS Scheme Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. APY */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Atal Pension (APY)</span>
            <span className="bg-emerald-50 text-[#0A5C36] px-1.5 py-0.2 rounded font-mono text-[10px] font-bold">APY</span>
          </div>
          <div className="text-2xl font-extrabold text-[#0A0A0A] tabular-nums">
            {summaryMetrics.totalApyCount.toLocaleString()} <span className="text-xs font-normal text-[#6B7280]">policies</span>
          </div>
          <div className="text-xs text-[#0A5C36] font-semibold tabular-nums pt-0.5">
            ₹{summaryMetrics.totalApyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })} commission
          </div>
        </div>

        {/* 2. PMSBY */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Suraksha Bima (PMSBY)</span>
            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-mono text-[10px] font-bold">PMSBY</span>
          </div>
          <div className="text-2xl font-extrabold text-[#0A0A0A] tabular-nums">
            {summaryMetrics.totalSbyCount.toLocaleString()} <span className="text-xs font-normal text-[#6B7280]">policies</span>
          </div>
          <div className="text-xs text-[#0A5C36] font-semibold tabular-nums pt-0.5">
            ₹{summaryMetrics.totalSbyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })} commission
          </div>
        </div>

        {/* 3. PMJJBY */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Jeevan Jyoti (PMJJBY)</span>
            <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-mono text-[10px] font-bold">PMJJBY</span>
          </div>
          <div className="text-2xl font-extrabold text-[#0A0A0A] tabular-nums">
            {summaryMetrics.totalJbyCount.toLocaleString()} <span className="text-xs font-normal text-[#6B7280]">policies</span>
          </div>
          <div className="text-xs text-[#0A5C36] font-semibold tabular-nums pt-0.5">
            ₹{summaryMetrics.totalJbyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })} commission
          </div>
        </div>
      </div>

      {/* 10% Incentive Banner */}
      {summaryMetrics.totalSssIncentive > 0 && (
        <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl flex items-center justify-between text-xs text-[#92400E]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>
              <strong>10% SSS Scheme Bonus:</strong> Special performance incentive of{' '}
              <strong>₹{summaryMetrics.totalSssIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> awarded across top performing BCAs.
            </span>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <FilterDropdownsBar />

      {/* SSS Register Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col shadow-xs select-none">
        <div className="overflow-x-auto relative">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#475569] font-semibold select-none sticky top-0 z-20">
                <th
                  onClick={() => toggleSort('bcaName')}
                  className="py-3 px-4 cursor-pointer group hover:text-[#0A0A0A] sticky left-0 z-30 bg-[#F8FAFC] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Agent Name & ID</span>
                    {renderSortIcon('bcaName')}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('dist')}
                  className="py-3 px-3 cursor-pointer group hover:text-[#0A0A0A]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>District</span>
                    {renderSortIcon('dist')}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('apyCount')}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-[#0A0A0A]"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>APY</span>
                    {renderSortIcon('apyCount')}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('sbyCount')}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-[#0A0A0A]"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>PMSBY</span>
                    {renderSortIcon('sbyCount')}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('jbyCount')}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-[#0A0A0A]"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>PMJJBY</span>
                    {renderSortIcon('jbyCount')}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('incentive10Sss')}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-[#0A0A0A]"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>10% Bonus</span>
                    {renderSortIcon('incentive10Sss')}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('bcComm')}
                  className="py-3 px-4 text-right cursor-pointer group hover:text-[#0A0A0A]"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total BCA Payout</span>
                    {renderSortIcon('bcComm')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#0A0A0A]">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedAgent(r)}
                    className="hover:bg-[#F0FDF4]/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-4 sticky left-0 z-10 bg-white group-hover:bg-[#F8FCF9] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                      <div className="font-bold text-[#0A0A0A]">{r.bcaName}</div>
                      <div className="text-[11px] text-[#6B7280] font-mono">{r.agentId}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#374151] font-medium">{r.dist}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className="font-bold text-[#0A0A0A]">{r.apyCount}</span>
                      <span className="text-[10px] text-[#6B7280] block">₹{r.apyComm.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className="font-bold text-[#0A0A0A]">{r.sbyCount}</span>
                      <span className="text-[10px] text-[#6B7280] block">₹{r.sbyComm.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className="font-bold text-[#0A0A0A]">{r.jbyCount}</span>
                      <span className="text-[10px] text-[#6B7280] block">₹{r.jbyComm.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-amber-800">
                      {r.incentive10Sss > 0 ? `₹${r.incentive10Sss.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-extrabold tabular-nums text-[#15803D]">
                      ₹{r.bcComm.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B7280]">
                    <Users className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-[#0A0A0A]">No records matching filters</p>
                    <p className="text-xs text-[#6B7280] mt-1">Try clearing or widening your selected filters.</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold text-[#0A5C36] bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] rounded-lg transition-colors cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        {sortedRecords.length > 0 && (
          <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 text-xs text-[#6B7280]">
            <div className="flex items-center gap-3">
              <div>
                Showing <span className="font-bold text-[#0A0A0A]">{(safePage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-bold text-[#0A0A0A]">
                  {Math.min(safePage * pageSize, sortedRecords.length)}
                </span>{' '}
                of <span className="font-bold text-[#0A0A0A]">{sortedRecords.length.toLocaleString()}</span> agents
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-[#D1D5DB] rounded px-1.5 py-0.5 text-[#0A0A0A] font-semibold cursor-pointer"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1 rounded-md border border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-[#0A0A0A]">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1 rounded-md border border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
