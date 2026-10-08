'use client';

import React, { useState, useMemo } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { FilterDropdownsBar } from '@/components/FilterDropdownsBar';
import {
  ShieldCheck,
  Award,
  Users,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Download,
} from 'lucide-react';
import { generateAgentCommissionPdf } from '@/lib/exportPdf';

export default function SocialSchemesPage() {
  const { filteredRecords, summaryMetrics, setSelectedAgent } = useCommission();

  const [sortField, setSortField] = useState<'totalSss' | 'apyCount' | 'sbyCount' | 'jbyCount' | 'loginPercentage'>('totalSss');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const sortedList = useMemo(() => {
    const list = [...filteredRecords];
    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === 'totalSss') {
        valA = a.apyCount + a.sbyCount + a.jbyCount;
        valB = b.apyCount + b.sbyCount + b.jbyCount;
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
    return list;
  }, [filteredRecords, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedList.length / pageSize) || 1;
  const paginatedList = sortedList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#0f2942] text-white p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-emerald-400 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wide">
              Social Security Schemes (SSS) & Attendance Hub
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Government Mandated Financial Inclusion: APY, PM-SBY, PM-JJBY & CASA Account Operations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-300">Avg Attendance:</span>{' '}
            <strong className="text-emerald-300 font-bold ml-1">{summaryMetrics.avgLoginPercentage.toFixed(1)}%</strong>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-300">Total Policies:</span>{' '}
            <strong className="text-emerald-300 font-bold ml-1">
              {(summaryMetrics.totalApyCount + summaryMetrics.totalSbyCount + summaryMetrics.totalJbyCount).toLocaleString('en-IN')}
            </strong>
          </div>
        </div>
      </div>

      {/* 5 Macro SSS Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. APY */}
        <div className="svf-card p-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
            <span>Atal Pension Yojana</span>
            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              APY
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {summaryMetrics.totalApyCount.toLocaleString('en-IN')}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Commission:</span>
            <span className="font-bold text-emerald-700 tabular-nums">
              ₹{summaryMetrics.totalApyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 2. PM-SBY */}
        <div className="svf-card p-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
            <span>PM Suraksha Bima</span>
            <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
              PMSBY
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {summaryMetrics.totalSbyCount.toLocaleString('en-IN')}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Commission:</span>
            <span className="font-bold text-sky-700 tabular-nums">
              ₹{summaryMetrics.totalSbyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 3. PM-JBY */}
        <div className="svf-card p-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
            <span>PM Jeevan Jyoti</span>
            <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
              PMJJBY
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {summaryMetrics.totalJbyCount.toLocaleString('en-IN')}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Commission:</span>
            <span className="font-bold text-indigo-700 tabular-nums">
              ₹{summaryMetrics.totalJbyComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 4. 10% SSS Bonus */}
        <div className="svf-card p-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
            <span>10% Target Bonus</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-800 mt-2 tabular-nums">
            ₹{summaryMetrics.totalSssIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
            Special Target Milestone
          </p>
        </div>

        {/* 5. CASA Account Opening */}
        <div className="svf-card p-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
            <span>Accounts Opened</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {summaryMetrics.totalAccountsOpened.toLocaleString('en-IN')}
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span>Funded: <strong className="text-slate-900 font-bold">{summaryMetrics.totalFundedAccounts}</strong></span>
            <span>Non-Fund: <strong className="text-slate-900 font-bold">{summaryMetrics.totalNonFundedAccounts}</strong></span>
          </div>
        </div>
      </section>

      {/* Cascading Filter Dropdowns */}
      <section>
        <FilterDropdownsBar />
      </section>

      {/* Dedicated Social Security Performance Register Table */}
      <section className="svf-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Social Security Schemes (SSS) Agent Performance Register
            </h3>
            <p className="text-xs text-slate-500">
              Sorted by overall policy productivity across APY, PM-SBY, PM-JJBY, and Login Attendance
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0f2942] text-white font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider select-none">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Agent ID</th>
                <th className="py-3 px-3">BCA Name</th>
                <th className="py-3 px-3">Branch / District</th>
                <th
                  onClick={() => handleSort('loginPercentage')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-800 transition"
                >
                  Login % (Days)
                </th>
                <th
                  onClick={() => handleSort('apyCount')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800 transition"
                >
                  APY Count (Comm)
                </th>
                <th
                  onClick={() => handleSort('sbyCount')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800 transition"
                >
                  PMSBY Count (Comm)
                </th>
                <th
                  onClick={() => handleSort('jbyCount')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800 transition"
                >
                  PMJJBY Count (Comm)
                </th>
                <th className="py-3 px-3 text-right">10% SSS Bonus</th>
                <th
                  onClick={() => handleSort('totalSss')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-800 text-emerald-300 transition"
                >
                  Total SSS Policies
                </th>
                <th className="py-3 px-3 text-center">Voucher Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 text-xs">
                    No Business Correspondent records match the current filter selection.
                  </td>
                </tr>
              ) : (
                paginatedList.map((rec, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const totalSssCount = rec.apyCount + rec.sbyCount + rec.jbyCount;

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedAgent(rec)}
                      className={`cursor-pointer transition hover:bg-emerald-50/60 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-400 tabular-nums text-center">{globalIdx}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 tabular-nums">{rec.agentId}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{rec.bcaName}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {rec.baseBranch} ({rec.dist})
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
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <span className="font-bold text-slate-900">{rec.apyCount}</span>
                        <span className="text-[10px] text-emerald-700 block">₹{rec.apyComm.toFixed(2)}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <span className="font-bold text-slate-900">{rec.sbyCount}</span>
                        <span className="text-[10px] text-sky-700 block">₹{rec.sbyComm.toFixed(2)}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <span className="font-bold text-slate-900">{rec.jbyCount}</span>
                        <span className="text-[10px] text-indigo-700 block">₹{rec.jbyComm.toFixed(2)}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-amber-800">
                        ₹{rec.incentive10Sss.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-black text-emerald-900 bg-emerald-50/50">
                        {totalSssCount} Policies
                      </td>
                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => generateAgentCommissionPdf(rec)}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#0f2942] hover:bg-slate-800 rounded transition"
                          title="Download Commission Slip"
                        >
                          Download Slip
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1 bg-white border border-slate-300 rounded font-semibold disabled:opacity-40 hover:bg-slate-50 transition"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1 bg-white border border-slate-300 rounded font-semibold disabled:opacity-40 hover:bg-slate-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
