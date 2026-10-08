'use client';

import React from 'react';
import { useCommission } from '@/context/CommissionContext';
import { FilterDropdownsBar } from '@/components/FilterDropdownsBar';
import { AgentDataTable } from '@/components/AgentDataTable';
import { Users, MapPin, Building, Smartphone } from 'lucide-react';

export default function AgentsDirectoryPage() {
  const { filteredRecords, summaryMetrics, selectedAgent, setSelectedAgent } = useCommission();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#0f2942] text-white p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-emerald-400 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wide">
              BCA Agent Directory & Terminal Register
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Master Registry of Business Correspondents, Micro-ATMs / POS Terminals, SOL IDs, and Branch Mappings
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-300">Total Active POS:</span>{' '}
            <strong className="text-emerald-300 font-bold ml-1">{filteredRecords.length} Outlets</strong>
          </div>
        </div>
      </div>

      {/* Directory Summary Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="svf-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total BCAs</span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {summaryMetrics.totalAgents} Agents
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Active in current filter scope
          </p>
        </div>

        <div className="svf-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Avg Login Attendance</span>
          <p className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
            {summaryMetrics.avgLoginPercentage.toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Across {summaryMetrics.activeAgents} active BCAs
          </p>
        </div>

        <div className="svf-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Rural Coverage</span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {filteredRecords.filter((r) => r.locationType === 'RURAL').length} Outlets
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Gram Panchayat banking points
          </p>
        </div>

        <div className="svf-card p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Urban Outlets</span>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {filteredRecords.filter((r) => r.locationType !== 'RURAL').length} Outlets
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Semi-urban & town branches
          </p>
        </div>
      </section>

      {/* Cascading Filter Dropdowns */}
      <section>
        <FilterDropdownsBar />
      </section>

      {/* Main Agent Performance & Directory Table */}
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
