'use client';

import React, { useState, useMemo } from 'react';
import { CommissionRecord } from '@/types/commission';
import { useCommission } from '@/context/CommissionContext';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Users, AlertCircle } from 'lucide-react';

export const AgentDataTable: React.FC = () => {
  const { filteredRecords, setSelectedAgent, handleResetFilters } = useCommission();

  const [sortField, setSortField] = useState<keyof CommissionRecord | 'sssTotal' | 'netPayable'>('bcComm');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Sorting
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    list.sort((a, b) => {
      if (sortField === 'sssTotal') {
        const sssA = (a.apyCount || 0) + (a.sbyCount || 0) + (a.jbyCount || 0);
        const sssB = (b.apyCount || 0) + (b.sbyCount || 0) + (b.jbyCount || 0);
        return sortAsc ? sssA - sssB : sssB - sssA;
      }

      if (sortField === 'netPayable') {
        const netA = a.netPayable ?? (a.bcComm * 0.98);
        const netB = b.netPayable ?? (b.bcComm * 0.98);
        return sortAsc ? netA - netB : netB - netA;
      }

      let aVal = a[sortField as keyof CommissionRecord];
      let bVal = b[sortField as keyof CommissionRecord];

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

  const toggleSort = (field: keyof CommissionRecord | 'sssTotal' | 'netPayable') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const renderSortIcon = (field: keyof CommissionRecord | 'sssTotal' | 'netPayable') => {
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
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col shadow-xs select-none">
      {/* Table Container */}
      <div className="overflow-x-auto relative">
        <table className="w-full text-left text-xs border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#475569] font-semibold select-none sticky top-0 z-20">
              {/* 1. Agent Name & ID (Sticky Left) */}
              <th
                onClick={() => toggleSort('bcaName')}
                className="py-3 px-4 cursor-pointer group hover:text-[#0A0A0A] transition-colors sticky left-0 z-30 bg-[#F8FAFC] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Agent Name & ID</span>
                  {renderSortIcon('bcaName')}
                </div>
              </th>

              {/* 2. Branch & SOL */}
              <th
                onClick={() => toggleSort('baseBranch')}
                className="py-3 px-3 cursor-pointer group hover:text-[#0A0A0A] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Branch / SOL</span>
                  {renderSortIcon('baseBranch')}
                </div>
              </th>

              {/* 3. District */}
              <th
                onClick={() => toggleSort('dist')}
                className="py-3 px-3 cursor-pointer group hover:text-[#0A0A0A] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>District</span>
                  {renderSortIcon('dist')}
                </div>
              </th>

              {/* 4. Accounts */}
              <th
                onClick={() => toggleSort('totalNoOfAcctOpn')}
                className="py-3 px-3 text-right cursor-pointer group hover:text-[#0A0A0A] transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Accounts</span>
                  {renderSortIcon('totalNoOfAcctOpn')}
                </div>
              </th>

              {/* 5. Txns */}
              <th
                onClick={() => toggleSort('financialTxn')}
                className="py-3 px-3 text-right cursor-pointer group hover:text-[#0A0A0A] transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Txns</span>
                  {renderSortIcon('financialTxn')}
                </div>
              </th>

              {/* 6. Schemes (APY+SBY+JBY) */}
              <th
                onClick={() => toggleSort('sssTotal')}
                className="py-3 px-3 text-right cursor-pointer group hover:text-[#0A0A0A] transition-colors"
                title="Social Security Schemes (APY + PMSBY + PMJJBY)"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Schemes (SSS)</span>
                  {renderSortIcon('sssTotal')}
                </div>
              </th>

              {/* 7. Login Days & % */}
              <th
                onClick={() => toggleSort('loginDays')}
                className="py-3 px-3 text-right cursor-pointer group hover:text-[#0A0A0A] transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Attendance</span>
                  {renderSortIcon('loginDays')}
                </div>
              </th>

              {/* 8. BC Commission (80%) */}
              <th
                onClick={() => toggleSort('bcComm')}
                className="py-3 px-4 text-right cursor-pointer group hover:text-[#0A0A0A] transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>BC Commission</span>
                  {renderSortIcon('bcComm')}
                </div>
              </th>

              {/* 9. 2% TDS */}
              <th className="py-3 px-3 text-right text-rose-700">
                <span>TDS (2%)</span>
              </th>

              {/* 10. Net Payable */}
              <th
                onClick={() => toggleSort('netPayable')}
                className="py-3 px-4 text-right cursor-pointer group hover:text-[#0A0A0A] transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Net Payable</span>
                  {renderSortIcon('netPayable')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] text-[#0A0A0A]">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((record) => {
                const sssTotal = (record.apyCount || 0) + (record.sbyCount || 0) + (record.jbyCount || 0);
                const tds = record.tdsDeduction ?? Number((record.bcComm * 0.02).toFixed(2));
                const net = record.netPayable ?? Number((record.bcComm - tds).toFixed(2));
                const isLowAttendance = record.loginDays < 15;

                return (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedAgent(record)}
                    className="hover:bg-[#F0FDF4]/60 cursor-pointer transition-colors group"
                  >
                    {/* Agent Name + ID (Sticky Left Column) */}
                    <td className="py-2.5 px-4 sticky left-0 z-10 bg-white group-hover:bg-[#F8FCF9] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                      <div className="font-bold text-[#0A0A0A]">{record.bcaName}</div>
                      <div className="text-[11px] text-[#6B7280] font-mono">{record.agentId}</div>
                    </td>

                    {/* Branch */}
                    <td className="py-2.5 px-3 text-[#374151]">
                      <div className="font-medium">{record.baseBranch}</div>
                      <div className="text-[11px] text-[#6B7280]">
                        {record.solId ? `SOL ${record.solId}` : record.villageName}
                      </div>
                    </td>

                    {/* District */}
                    <td className="py-2.5 px-3 text-[#374151]">
                      <div className="font-medium">{record.dist}</div>
                      <div className="text-[11px] text-[#6B7280]">{record.stateName}</div>
                    </td>

                    {/* Accounts */}
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#0A0A0A]">
                      {record.totalNoOfAcctOpn.toLocaleString()}
                    </td>

                    {/* Txns */}
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#0A0A0A]">
                      {record.financialTxn.toLocaleString()}
                    </td>

                    {/* Schemes (APY + SBY + JBY) */}
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#4B5563]" title={`APY: ${record.apyCount || 0} | PMSBY: ${record.sbyCount || 0} | PMJJBY: ${record.jbyCount || 0}`}>
                      <div>{sssTotal.toLocaleString()}</div>
                      <div className="text-[10px] text-[#9CA3AF]">
                        {record.apyCount || 0}/{record.sbyCount || 0}/{record.jbyCount || 0}
                      </div>
                    </td>

                    {/* Login Days & Attendance */}
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums">
                      <div className="flex items-center justify-end gap-1">
                        {isLowAttendance && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 px-1 py-0.2 rounded" title="Low login (<15 days)">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Low
                          </span>
                        )}
                        <span>{record.loginDays}d</span>
                      </div>
                      <div className="text-[10px] text-[#6B7280]">{record.loginPercentage}%</div>
                    </td>

                    {/* BCA Commission (80%) */}
                    <td className="py-2.5 px-4 text-right font-semibold tabular-nums text-[#0A0A0A]">
                      ₹{record.bcComm.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* TDS (2%) */}
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-rose-700">
                      -₹{tds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Net Payable */}
                    <td className="py-2.5 px-4 text-right font-extrabold tabular-nums text-[#15803D]">
                      ₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#6B7280]">
                  <Users className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-[#0A0A0A]">No Business Correspondents match filters</p>
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

      {/* Table Footer with Pagination & Rows Per Page (U5) */}
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

            {/* Rows per page selector (25, 50, 100) */}
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
  );
};
