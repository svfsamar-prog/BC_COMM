'use client';

import React, { useState } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { HierarchyCards } from '@/components/HierarchyCards';
import { VisualAnalytics } from '@/components/VisualAnalytics';
import { CommissionSummary } from '@/components/CommissionSummary';
import { FilterDropdownsBar } from '@/components/FilterDropdownsBar';
import { AgentDataTable } from '@/components/AgentDataTable';
import { HierarchyModal } from '@/components/HierarchyModal';
import { Users, Wallet, ShieldCheck, DollarSign, ArrowRight, Building, Award } from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const {
    filteredRecords,
    records,
    summaryMetrics,
    selectedAgent,
    setSelectedAgent,
    handleFilterChange,
  } = useCommission();

  const [hierarchyModalType, setHierarchyModalType] = useState<'state' | 'zone' | 'district' | null>(null);

  return (
    <div className="space-y-6">
      {/* 1. Top Executive KPI Ribbon */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Network Strength */}
        <div className="svf-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>BCA Network Strength</span>
            <div className="p-2 rounded-lg bg-slate-100 text-[#0f2942]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            {summaryMetrics.totalAgents}{' '}
            <span className="text-xs font-semibold text-slate-500">BCAs</span>
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">Active Rate:</span>
            <span className="font-bold text-emerald-700">
              {summaryMetrics.activeAgents} Active ({((summaryMetrics.activeAgents / (summaryMetrics.totalAgents || 1)) * 100).toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Card 2: Financial Volume */}
        <div className="svf-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Gross Txn Volume</span>
            <div className="p-2 rounded-lg bg-slate-100 text-[#0f2942]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            ₹{(summaryMetrics.totalTxnVolume / 10000000).toFixed(2)} Cr
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">Total Txns:</span>
            <span className="font-bold text-slate-800 tabular-nums">
              {summaryMetrics.totalTxnCount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Card 3: Gross Net Commission */}
        <div className="svf-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Gross Commission</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 tabular-nums">
            ₹{(summaryMetrics.totalNetCommission / 100000).toFixed(2)} L
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">80% BCA Share:</span>
            <span className="font-bold text-emerald-700 tabular-nums">
              ₹{(summaryMetrics.totalBcCommission / 100000).toFixed(2)} L
            </span>
          </div>
        </div>

        {/* Card 4: Social Security Schemes */}
        <div className="svf-card p-4">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Social Schemes (SSS)</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
            {(summaryMetrics.totalApyCount + summaryMetrics.totalSbyCount + summaryMetrics.totalJbyCount).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-semibold text-slate-500">Policies</span>
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">APY + SBY + JBY:</span>
            <Link
              href="/social-schemes"
              className="font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center space-x-0.5"
            >
              <span>Explore SSS Hub</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Top 3 Hierarchy Action Cards (Zone, State, District drilldowns) */}
      <section>
        <HierarchyCards
          records={filteredRecords}
          onOpenHierarchyModal={(type) => setHierarchyModalType(type)}
          selectedHierarchyType={hierarchyModalType}
        />
      </section>

      {/* 3. Visual Analytics & Distribution */}
      <section>
        <VisualAnalytics records={filteredRecords} />
      </section>

      {/* 4. Commission Breakdown Matrix (80% BCA / 20% Corp Split) */}
      <section>
        <CommissionSummary metrics={summaryMetrics} />
      </section>

      {/* 5. Cascading Filter Dropdowns Bar */}
      <section>
        <FilterDropdownsBar />
      </section>

      {/* 6. Main Data Register Table */}
      <section>
        <AgentDataTable
          records={filteredRecords}
          onSelectAgent={(agent) => setSelectedAgent(agent)}
          selectedAgentId={selectedAgent?.agentId || null}
        />
      </section>

      {/* Hierarchy Drilldown Modal */}
      {hierarchyModalType && (
        <HierarchyModal
          isOpen={Boolean(hierarchyModalType)}
          onClose={() => setHierarchyModalType(null)}
          type={hierarchyModalType}
          records={records}
          onSelectFilter={(key, value) => {
            if (key === 'state') handleFilterChange({ state: value, zone: '', dist: '', baseBranch: '' });
            if (key === 'zone') handleFilterChange({ zone: value, dist: '', baseBranch: '' });
            if (key === 'dist') handleFilterChange({ dist: value, baseBranch: '' });
          }}
        />
      )}
    </div>
  );
}
