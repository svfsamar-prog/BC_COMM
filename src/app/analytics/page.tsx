'use client';

import React, { useState, useMemo } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { FilterDropdownsBar } from '@/components/FilterDropdownsBar';
import { BarChart3, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegionalAnalyticsPage() {
  const router = useRouter();
  const { filteredRecords, handleFilterChange } = useCommission();
  const [activeTab, setActiveTab] = useState<'state' | 'zone' | 'district' | 'branch'>('district');

  const keyField =
    activeTab === 'state'
      ? 'stateName'
      : activeTab === 'zone'
      ? 'zoneName'
      : activeTab === 'district'
      ? 'dist'
      : 'baseBranch';

  const filterKey =
    activeTab === 'state'
      ? 'state'
      : activeTab === 'zone'
      ? 'zone'
      : activeTab === 'district'
      ? 'dist'
      : 'baseBranch';

  const aggregatedData = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        agentCount: number;
        totalAccounts: number;
        fundedAccounts: number;
        nonFundedAccounts: number;
        totalTxn: number;
        txnVolume: number;
        apyCount: number;
        sbyCount: number;
        jbyCount: number;
        totalNetCommission: number;
        totalBcCommission: number;
        totalCorpCommission: number;
        avgLoginPct: number;
      }
    >();

    filteredRecords.forEach((r) => {
      const name = r[keyField] || 'UNSPECIFIED';
      const existing = map.get(name) || {
        name,
        agentCount: 0,
        totalAccounts: 0,
        fundedAccounts: 0,
        nonFundedAccounts: 0,
        totalTxn: 0,
        txnVolume: 0,
        apyCount: 0,
        sbyCount: 0,
        jbyCount: 0,
        totalNetCommission: 0,
        totalBcCommission: 0,
        totalCorpCommission: 0,
        avgLoginPct: 0,
      };

      existing.agentCount += 1;
      existing.totalAccounts += r.totalNoOfAcctOpn;
      existing.fundedAccounts += r.fundedNoOfAcctOpn;
      existing.nonFundedAccounts += r.nonFundedNoOfAcctOpn;
      existing.totalTxn += r.financialTxn;
      existing.txnVolume += r.txnAmt;
      existing.apyCount += r.apyCount;
      existing.sbyCount += r.sbyCount;
      existing.jbyCount += r.jbyCount;
      existing.totalNetCommission += r.netCommission;
      existing.totalBcCommission += r.bcComm;
      existing.totalCorpCommission += r.corpComm;
      existing.avgLoginPct += r.loginPercentage;

      map.set(name, existing);
    });

    const list = Array.from(map.values()).map((item) => ({
      ...item,
      avgLoginPct: item.agentCount > 0 ? item.avgLoginPct / item.agentCount : 0,
    }));

    list.sort((a, b) => b.totalNetCommission - a.totalNetCommission);
    return list;
  }, [filteredRecords, keyField]);

  const handleApplyFilterAndJump = (val: string) => {
    handleFilterChange({ [filterKey]: val });
    router.push('/');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#0f2942] text-white p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-emerald-400 rounded-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wide">
              Regional Hierarchy & Performance Rankings
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Comparative Analysis Across States, Bank Operating Zones, Districts & Base Branches
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-white/10 p-1 rounded-lg border border-white/10 text-xs">
          {(['state', 'zone', 'district', 'branch'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded font-bold transition ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}-Wise
            </button>
          ))}
        </div>
      </div>

      {/* Cascading Filter Dropdowns */}
      <section>
        <FilterDropdownsBar />
      </section>

      {/* Hierarchy Ranking Table */}
      <section className="svf-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              {activeTab === 'state'
                ? 'State'
                : activeTab === 'zone'
                ? 'Zone'
                : activeTab === 'district'
                ? 'District'
                : 'Base Branch'}{' '}
              Aggregate Ranking Table ({aggregatedData.length} Regions)
            </h3>
            <p className="text-xs text-slate-500">
              Sorted by Total Net Commission Revenue. Click "Filter & View" to inspect individual BCAs.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0f2942] text-white font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider select-none">
                <th className="py-3 px-3 w-12 text-center">Rank</th>
                <th className="py-3 px-3">Regional Name</th>
                <th className="py-3 px-3 text-right">Active BCAs</th>
                <th className="py-3 px-3 text-center">Avg Login %</th>
                <th className="py-3 px-3 text-right">Accounts</th>
                <th className="py-3 px-3 text-right">Financial Txns</th>
                <th className="py-3 px-3 text-right">Txn Volume</th>
                <th className="py-3 px-3 text-center">SSS Policies (APY/SBY/JBY)</th>
                <th className="py-3 px-3 text-right">Net Commission</th>
                <th className="py-3 px-3 text-right text-emerald-300">BCA Share (80%)</th>
                <th className="py-3 px-3 text-center">Drilldown Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {aggregatedData.map((item, idx) => (
                <tr
                  key={item.name}
                  className={`hover:bg-slate-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                >
                  <td className="py-2.5 px-3 text-center font-bold text-slate-500 tabular-nums">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.name}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-800">
                    {item.agentCount}
                  </td>
                  <td className="py-2.5 px-3 text-center tabular-nums">
                    <span
                      className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${
                        item.avgLoginPct >= 80
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : item.avgLoginPct >= 60
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {item.avgLoginPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-800">
                    {item.totalAccounts}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-800">
                    {item.totalTxn.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                    ₹{item.txnVolume.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-center tabular-nums text-slate-700">
                    <span className="font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      {item.apyCount + item.sbyCount + item.jbyCount}
                    </span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">
                      {item.apyCount}A / {item.sbyCount}S / {item.jbyCount}J
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                    ₹{item.totalNetCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-700 bg-emerald-50/40">
                    ₹{item.totalBcCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleApplyFilterAndJump(item.name)}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#0f2942] bg-slate-100 border border-slate-300 rounded hover:bg-[#0f2942] hover:text-white transition inline-flex items-center space-x-1"
                    >
                      <span>Filter & View</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
