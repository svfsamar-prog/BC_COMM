'use client';

import React, { useMemo } from 'react';
import { Building2, Layers, MapPin, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { CommissionRecord } from '@/types/commission';

interface HierarchyCardsProps {
  records: CommissionRecord[];
  onOpenHierarchyModal: (type: 'state' | 'zone' | 'district') => void;
  selectedHierarchyType: 'state' | 'zone' | 'district' | null;
}

export const HierarchyCards: React.FC<HierarchyCardsProps> = ({
  records,
  onOpenHierarchyModal,
  selectedHierarchyType,
}) => {
  // Aggregate Zone Stats
  const zoneStats = useMemo(() => {
    const zones = new Set<string>();
    let totalComm = 0;
    records.forEach((r) => {
      if (r.zoneName) zones.add(r.zoneName);
      totalComm += r.netCommission;
    });
    return { count: zones.size, totalComm };
  }, [records]);

  // Aggregate State Stats
  const stateStats = useMemo(() => {
    const states = new Set<string>();
    let totalComm = 0;
    records.forEach((r) => {
      if (r.stateName) states.add(r.stateName);
      totalComm += r.netCommission;
    });
    return { count: states.size, totalComm };
  }, [records]);

  // Aggregate District Stats
  const districtStats = useMemo(() => {
    const dists = new Set<string>();
    let totalComm = 0;
    records.forEach((r) => {
      if (r.dist) dists.add(r.dist);
      totalComm += r.netCommission;
    });
    return { count: dists.size, totalComm };
  }, [records]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Zone-Wise Action Card */}
      <div
        onClick={() => onOpenHierarchyModal('zone')}
        className={`svf-card p-5 cursor-pointer group border-t-4 border-t-[#0f2942] ${
          selectedHierarchyType === 'zone' ? 'ring-2 ring-[#0f2942] shadow-md' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-slate-100 text-[#0f2942] rounded-lg group-hover:bg-[#0f2942] group-hover:text-white transition">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
            {zoneStats.count} Zones Active
          </span>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
            <span>Zone-Wise Summary</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#0f2942] transition" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Bank administrative operating zones & regional clusters
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Gross Volume:</span>
          <span className="font-bold text-[#0f2942] tabular-nums">
            ₹{zoneStats.totalComm.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* 2. State-Wise Action Card */}
      <div
        onClick={() => onOpenHierarchyModal('state')}
        className={`svf-card p-5 cursor-pointer group border-t-4 border-t-emerald-600 ${
          selectedHierarchyType === 'state' ? 'ring-2 ring-emerald-600 shadow-md' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-700 group-hover:text-white transition">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {stateStats.count} States Active
          </span>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
            <span>State-Wise Summary</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-700 transition" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            State-level financial inclusion tallies & BCA network
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Gross Volume:</span>
          <span className="font-bold text-emerald-700 tabular-nums">
            ₹{stateStats.totalComm.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* 3. District-Wise Action Card */}
      <div
        onClick={() => onOpenHierarchyModal('district')}
        className={`svf-card p-5 cursor-pointer group border-t-4 border-t-amber-600 ${
          selectedHierarchyType === 'district' ? 'ring-2 ring-amber-600 shadow-md' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-700 group-hover:text-white transition">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {districtStats.count} Districts Active
          </span>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
            <span>District-Wise Summary</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-700 transition" />
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            District branch networks, SOL mappings & Gram Panchayats
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Gross Volume:</span>
          <span className="font-bold text-amber-700 tabular-nums">
            ₹{districtStats.totalComm.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
};
