'use client';

import React, { useMemo } from 'react';
import { Landmark, ShieldCheck, Users } from 'lucide-react';
import { CommissionRecord } from '@/types/commission';

interface VisualAnalyticsProps {
  records: CommissionRecord[];
}

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({ records }) => {
  // Top 5 Districts by Total Commission
  const topDistricts = useMemo(() => {
    const map = new Map<string, { dist: string; netComm: number; bcaCount: number; sssCount: number }>();
    records.forEach((r) => {
      const dist = r.dist || 'Other';
      const curr = map.get(dist) || { dist, netComm: 0, bcaCount: 0, sssCount: 0 };
      curr.netComm += r.netCommission;
      curr.bcaCount += 1;
      curr.sssCount += r.apyCount + r.sbyCount + r.jbyCount;
      map.set(dist, curr);
    });

    const list = Array.from(map.values()).sort((a, b) => b.netComm - a.netComm);
    const maxVal = list[0]?.netComm || 1;
    return list.slice(0, 5).map((d) => ({
      ...d,
      pct: Math.round((d.netComm / maxVal) * 100),
    }));
  }, [records]);

  // SSS Distribution (APY vs PMSBY vs PMJJBY)
  const sssDistribution = useMemo(() => {
    let apy = 0;
    let sby = 0;
    let jby = 0;
    records.forEach((r) => {
      apy += r.apyCount;
      sby += r.sbyCount;
      jby += r.jbyCount;
    });
    const total = apy + sby + jby || 1;
    return {
      apy,
      sby,
      jby,
      total,
      apyPct: ((apy / total) * 100).toFixed(1),
      sbyPct: ((sby / total) * 100).toFixed(1),
      jbyPct: ((jby / total) * 100).toFixed(1),
    };
  }, [records]);

  // Attendance spread
  const attendanceSpread = useMemo(() => {
    let tier100 = 0; // >=95%
    let tier80 = 0;  // 80-94%
    let tier50 = 0;  // 50-79%
    let tierLow = 0; // <50%

    records.forEach((r) => {
      if (r.loginPercentage >= 95) tier100++;
      else if (r.loginPercentage >= 80) tier80++;
      else if (r.loginPercentage >= 50) tier50++;
      else tierLow++;
    });

    const total = records.length || 1;
    return [
      { label: 'Exemplary (≥95%)', count: tier100, pct: (tier100 / total) * 100, color: 'bg-emerald-600', text: 'text-emerald-700' },
      { label: 'Standard (80-94%)', count: tier80, pct: (tier80 / total) * 100, color: 'bg-[#0f2942]', text: 'text-[#0f2942]' },
      { label: 'Moderate (50-79%)', count: tier50, pct: (tier50 / total) * 100, color: 'bg-amber-500', text: 'text-amber-700' },
      { label: 'Critical (<50%)', count: tierLow, pct: (tierLow / total) * 100, color: 'bg-rose-500', text: 'text-rose-700' },
    ];
  }, [records]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Top 5 Districts by Net Commission */}
      <div className="svf-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-slate-100 text-[#0f2942] rounded">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Top Districts by Revenue
              </h4>
              <p className="text-[10px] text-slate-500">Highest gross commission revenue centers</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
            Rank 1-5
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {topDistricts.map((d, idx) => (
            <div key={d.dist} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center space-x-2">
                  <span className="w-4 h-4 rounded bg-slate-100 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{d.dist}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({d.bcaCount} BCAs)</span>
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{d.netComm.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0f2942] h-full rounded-full transition-all duration-500"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Social Security Scheme Ratio */}
      <div className="svf-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                SSS Scheme Share
              </h4>
              <p className="text-[10px] text-slate-500">APY vs PMSBY vs PMJJBY policy mix</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full tabular-nums">
            {sssDistribution.total} Policies
          </span>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="space-y-3 pt-1">
          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="bg-emerald-600 h-full transition-all duration-500"
              style={{ width: `${sssDistribution.apyPct}%` }}
              title={`APY: ${sssDistribution.apy} (${sssDistribution.apyPct}%)`}
            />
            <div
              className="bg-sky-600 h-full transition-all duration-500"
              style={{ width: `${sssDistribution.sbyPct}%` }}
              title={`PMSBY: ${sssDistribution.sby} (${sssDistribution.sbyPct}%)`}
            />
            <div
              className="bg-[#0f2942] h-full transition-all duration-500"
              style={{ width: `${sssDistribution.jbyPct}%` }}
              title={`PMJJBY: ${sssDistribution.jby} (${sssDistribution.jbyPct}%)`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <div className="flex items-center justify-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-[10px] font-bold text-slate-700 uppercase">APY</span>
              </div>
              <p className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                {sssDistribution.apy.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold">{sssDistribution.apyPct}%</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <div className="flex items-center justify-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-600" />
                <span className="text-[10px] font-bold text-slate-700 uppercase">PMSBY</span>
              </div>
              <p className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                {sssDistribution.sby.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-sky-700 font-semibold">{sssDistribution.sbyPct}%</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <div className="flex items-center justify-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0f2942]" />
                <span className="text-[10px] font-bold text-slate-700 uppercase">PMJJBY</span>
              </div>
              <p className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                {sssDistribution.jby.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-[#0f2942] font-semibold">{sssDistribution.jbyPct}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BCA Attendance & Login Spread */}
      <div className="svf-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-slate-100 text-[#0f2942] rounded">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Attendance Compliance
              </h4>
              <p className="text-[10px] text-slate-500">Active login ratio distribution</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
            4 Tiers
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {attendanceSpread.map((tier) => (
            <div key={tier.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 text-[11px] font-medium">{tier.label}</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {tier.count} BCAs <span className="text-[10px] text-slate-400 font-normal">({tier.pct.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`${tier.color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${tier.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
