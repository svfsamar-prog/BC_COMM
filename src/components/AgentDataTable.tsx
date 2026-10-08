'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  User,
  Shield,
  Clock,
  Eye,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CommissionRecord } from '@/types/commission';
import { generateAgentCommissionPdf } from '@/lib/exportPdf';
import { exportSingleAgentExcel } from '@/lib/exportExcel';

interface AgentDataTableProps {
  records: CommissionRecord[];
  onSelectAgent: (agent: CommissionRecord) => void;
  selectedAgentId: string | null;
}

type SortField =
  | 'agentId'
  | 'bcaName'
  | 'baseBranch'
  | 'dist'
  | 'loginPercentage'
  | 'totalNoOfAcctOpn'
  | 'financialTxn'
  | 'txnAmt'
  | 'apyCount'
  | 'netCommission'
  | 'bcComm'
  | 'corpComm';

export const AgentDataTable: React.FC<AgentDataTableProps> = ({
  records,
  onSelectAgent,
  selectedAgentId,
}) => {
  const [sortField, setSortField] = useState<SortField>('netCommission');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Sorting
  const sortedRecords = useMemo(() => {
    const list = [...records];
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [records, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = sortedRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-3 h-3 text-slate-400 opacity-60 inline ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-emerald-400 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 text-emerald-400 inline ml-1" />
    );
  };

  return (
    <div className="svf-card overflow-hidden flex flex-col">
      {/* Table Header Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
            <span>Business Correspondent Commission Register</span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {records.length} BCAs Active
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed 33-Column operational metrics, SSS performance, and 80/20 revenue disbursement ledger
          </p>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0f2942] text-white font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider select-none">
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th
                onClick={() => handleSort('agentId')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition"
              >
                Agent ID {renderSortIcon('agentId')}
              </th>
              <th
                onClick={() => handleSort('bcaName')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition"
              >
                BCA Name {renderSortIcon('bcaName')}
              </th>
              <th
                onClick={() => handleSort('baseBranch')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition"
              >
                Base Branch (SOL) {renderSortIcon('baseBranch')}
              </th>
              <th
                onClick={() => handleSort('dist')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition"
              >
                District / Zone {renderSortIcon('dist')}
              </th>
              <th
                onClick={() => handleSort('loginPercentage')}
                className="py-3 px-3 text-center cursor-pointer hover:bg-slate-800 transition"
              >
                Attendance {renderSortIcon('loginPercentage')}
              </th>
              <th
                onClick={() => handleSort('totalNoOfAcctOpn')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800 transition"
              >
                Accounts {renderSortIcon('totalNoOfAcctOpn')}
              </th>
              <th
                onClick={() => handleSort('financialTxn')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800 transition"
              >
                Txns {renderSortIcon('financialTxn')}
              </th>
              <th
                onClick={() => handleSort('apyCount')}
                className="py-3 px-3 text-center cursor-pointer hover:bg-slate-800 transition"
              >
                SSS (APY/SBY/JBY) {renderSortIcon('apyCount')}
              </th>
              <th
                onClick={() => handleSort('netCommission')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800 transition"
              >
                Gross Comm {renderSortIcon('netCommission')}
              </th>
              <th
                onClick={() => handleSort('bcComm')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800 text-emerald-300 transition"
              >
                BCA Share (80%) {renderSortIcon('bcComm')}
              </th>
              <th
                onClick={() => handleSort('corpComm')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800 transition"
              >
                Corp (20%) {renderSortIcon('corpComm')}
              </th>
              <th className="py-3 px-3 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-12 text-center text-slate-500 text-xs">
                  No Business Correspondent records match the current filter selection.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((rec, idx) => {
                const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                const isSelected = selectedAgentId === rec.agentId;
                const sssTotal = rec.apyCount + rec.sbyCount + rec.jbyCount;

                return (
                  <tr
                    key={rec.id}
                    onClick={() => onSelectAgent(rec)}
                    className={`cursor-pointer transition group ${
                      isSelected
                        ? 'bg-emerald-50 border-l-4 border-l-emerald-600'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50/60 hover:bg-slate-100/70'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums text-center">{globalIdx}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 tabular-nums">{rec.agentId}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{rec.bcaName}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {rec.baseBranch} <span className="text-[10px] text-slate-400">({rec.solId})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {rec.dist} <span className="text-[10px] text-slate-400">({rec.zoneName})</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block font-bold text-[10.5px] px-2 py-0.5 rounded-full tabular-nums border ${
                          rec.loginPercentage >= 80
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : rec.loginPercentage >= 60
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {rec.loginPercentage.toFixed(0)}% ({rec.loginDays}d)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                      <span className="font-semibold text-slate-900">{rec.totalNoOfAcctOpn}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {rec.fundedNoOfAcctOpn}F / {rec.nonFundedNoOfAcctOpn}NF
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                      <span className="font-semibold text-slate-900">{rec.financialTxn}</span>
                      <span className="text-[10px] text-slate-400 block">
                        ₹{(rec.txnAmt / 1000).toFixed(0)}k
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums">
                      <span className="font-bold text-slate-800">{sssTotal}</span>
                      <span className="text-[9.5px] text-slate-400 block">
                        {rec.apyCount}A / {rec.sbyCount}S / {rec.jbyCount}J
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                      ₹{rec.netCommission.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-700 bg-emerald-50/50">
                      ₹{rec.bcComm.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                      ₹{rec.corpComm.toFixed(2)}
                    </td>
                    <td
                      className="py-2.5 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => generateAgentCommissionPdf(rec)}
                          className="p-1.5 text-slate-600 hover:text-white bg-slate-100 hover:bg-[#0f2942] rounded transition"
                          title="Download Commission PDF Slip"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => exportSingleAgentExcel(rec)}
                          className="p-1.5 text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-700 rounded transition"
                          title="Download Excel Record"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectAgent(rec)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition"
                          title="View Full 33-Column Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
        <div>
          Showing <strong className="text-slate-900">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
          <strong className="text-slate-900">{Math.min(currentPage * pageSize, sortedRecords.length)}</strong> of{' '}
          <strong className="text-slate-900">{sortedRecords.length}</strong> BCAs
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold disabled:opacity-40 hover:bg-slate-50 transition shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <span className="px-2 font-bold text-slate-800">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold disabled:opacity-40 hover:bg-slate-50 transition shadow-2xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
