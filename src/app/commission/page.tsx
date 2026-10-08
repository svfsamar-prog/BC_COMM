'use client';

import React from 'react';
import { useCommission } from '@/context/CommissionContext';
import { CommissionSummary } from '@/components/CommissionSummary';
import { FilterDropdownsBar } from '@/components/FilterDropdownsBar';
import { AgentDataTable } from '@/components/AgentDataTable';
import { DollarSign, Wallet, FileSpreadsheet, FileText } from 'lucide-react';

export default function CommissionPage() {
  const { filteredRecords, summaryMetrics, selectedAgent, setSelectedAgent, exportCurrentExcel, exportCurrentPdf } = useCommission();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#0f2942] text-white p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-emerald-400 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wide">
              Commission & Revenue Split Matrix (80% / 20%)
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Gross Billables, BCA Payout Disbursements (80%), Corporate Infrastructure Margins (20%) & Slab Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCurrentExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export 33-Col XLSX</span>
          </button>
          <button
            onClick={exportCurrentPdf}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition shadow-xs"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Executive PDF</span>
          </button>
        </div>
      </div>

      {/* 80/20 Revenue Split Summary Card */}
      <section>
        <CommissionSummary metrics={summaryMetrics} />
      </section>

      {/* Operational Fee Component Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="svf-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Txn Commission</span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            ₹{summaryMetrics.totalTxnComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Cash Out / Deposit Commissions
          </p>
        </div>

        <div className="svf-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Account Opening Fee</span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            ₹{(summaryMetrics.totalAccountsOpened * 20).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Funded + Non-Funded CASA
          </p>
        </div>

        <div className="svf-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase">10% SSS Bonus Incentive</span>
          <p className="text-xl font-bold text-amber-800 mt-1 tabular-nums">
            ₹{summaryMetrics.totalSssIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Special Target Bonus Slabs
          </p>
        </div>

        <div className="svf-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Fixed Base Commission</span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            ₹{(summaryMetrics.activeAgents * 2000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            ₹2,000 / Active Month Allowance
          </p>
        </div>
      </section>

      {/* Cascading Filter Dropdowns */}
      <section>
        <FilterDropdownsBar />
      </section>

      {/* Full Financial Ledger Table */}
      <section>
        <AgentDataTable
          records={filteredRecords}
          onSelectAgent={(agent) => setSelectedAgent(agent)}
          selectedAgentId={selectedAgent?.agentId || null}
        />
      </section>
    </div>
  );
}
