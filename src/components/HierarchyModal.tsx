'use client';

import React, { useMemo } from 'react';
import { X, Layers, Building2, MapPin, ChevronRight } from 'lucide-react';
import { CommissionRecord } from '@/types/commission';

interface HierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'state' | 'zone' | 'district';
  records: CommissionRecord[];
  onSelectFilter: (key: 'state' | 'zone' | 'dist', value: string) => void;
}

export const HierarchyModal: React.FC<HierarchyModalProps> = ({
  isOpen,
  onClose,
  type,
  records,
  onSelectFilter,
}) => {
  if (!isOpen) return null;

  const title =
    type === 'state' ? 'State-Wise Breakdown' : type === 'zone' ? 'Zone-Wise Breakdown' : 'District-Wise Breakdown';
  const icon =
    type === 'state' ? (
      <Layers className="w-5 h-5 text-emerald-600" />
    ) : type === 'zone' ? (
      <Building2 className="w-5 h-5 text-[#0f2942]" />
    ) : (
      <MapPin className="w-5 h-5 text-amber-600" />
    );

  const keyField: 'stateName' | 'zoneName' | 'dist' =
    type === 'state' ? 'stateName' : type === 'zone' ? 'zoneName' : 'dist';

  const filterKey: 'state' | 'zone' | 'dist' =
    type === 'state' ? 'state' : type === 'zone' ? 'zone' : 'dist';

  // Group records by keyField
  const groupedData = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        agentCount: number;
        totalAccounts: number;
        totalTxn: number;
        txnVolume: number;
        apyCount: number;
        sbyCount: number;
        jbyCount: number;
        totalNetCommission: number;
        totalBcCommission: number;
        avgLoginPct: number;
      }
    >();

    records.forEach((r) => {
      const name = r[keyField] || 'UNSPECIFIED';
      const existing = map.get(name) || {
        name,
        agentCount: 0,
        totalAccounts: 0,
        totalTxn: 0,
        txnVolume: 0,
        apyCount: 0,
        sbyCount: 0,
        jbyCount: 0,
        totalNetCommission: 0,
        totalBcCommission: 0,
        avgLoginPct: 0,
      };

      existing.agentCount += 1;
      existing.totalAccounts += r.totalNoOfAcctOpn;
      existing.totalTxn += r.financialTxn;
      existing.txnVolume += r.txnAmt;
      existing.apyCount += r.apyCount;
      existing.sbyCount += r.sbyCount;
      existing.jbyCount += r.jbyCount;
      existing.totalNetCommission += r.netCommission;
      existing.totalBcCommission += r.bcComm;
      existing.avgLoginPct += r.loginPercentage;

      map.set(name, existing);
    });

    const list = Array.from(map.values()).map((item) => ({
      ...item,
      avgLoginPct: item.agentCount > 0 ? item.avgLoginPct / item.agentCount : 0,
    }));

    list.sort((a, b) => b.totalNetCommission - a.totalNetCommission);
    return list;
  }, [records, keyField]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                {icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
                <p className="text-xs text-slate-500">
                  Click any regional row to apply as active filter on main register
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto max-h-[60vh] rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#0f2942] text-white font-bold border-b border-slate-800 text-[10px] uppercase tracking-wider z-10">
                <tr>
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Region Name</th>
                  <th className="py-3 px-3 text-right">BCAs</th>
                  <th className="py-3 px-3 text-right">Accounts</th>
                  <th className="py-3 px-3 text-right">Txns</th>
                  <th className="py-3 px-3 text-right">Txn Volume</th>
                  <th className="py-3 px-3 text-center">SSS Total</th>
                  <th className="py-3 px-3 text-right">Net Comm</th>
                  <th className="py-3 px-3 text-right text-emerald-300">BCA Share (80%)</th>
                  <th className="py-3 px-3 text-center">Avg Attendance</th>
                  <th className="py-3 px-3 text-center">Filter Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {groupedData.map((item, idx) => (
                  <tr
                    key={item.name}
                    className="hover:bg-slate-50 cursor-pointer transition"
                    onClick={() => {
                      onSelectFilter(filterKey, item.name);
                      onClose();
                    }}
                  >
                    <td className="py-2.5 px-3 text-slate-500 tabular-nums">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center space-x-1.5">
                      <span>{item.name}</span>
                      {idx < 3 && (
                        <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-bold">
                          TOP {idx + 1}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{item.agentCount}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{item.totalAccounts}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{item.totalTxn}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                      ₹{item.txnVolume.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums">
                      <span className="font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10.5px]">
                        {item.apyCount + item.sbyCount + item.jbyCount}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">
                      ₹{item.totalNetCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-700 bg-emerald-50/30">
                      ₹{item.totalBcCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums">
                      <span
                        className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full border ${
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
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFilter(filterKey, item.name);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-slate-100 text-[#0f2942] hover:bg-[#0f2942] hover:text-white border border-slate-300 rounded text-[10.5px] font-bold transition"
                      >
                        Filter Register
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
