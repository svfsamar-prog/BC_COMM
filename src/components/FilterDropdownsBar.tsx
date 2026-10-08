'use client';

import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { useCommission } from '@/context/CommissionContext';

export const FilterDropdownsBar: React.FC = () => {
  const {
    filters,
    availableMonths,
    availableZones,
    availableStates,
    availableDistricts,
    availableBranches,
    handleFilterChange,
    handleResetFilters,
    filteredRecords,
    records,
  } = useCommission();

  const isFiltered =
    Boolean(filters.zone) ||
    Boolean(filters.state) ||
    Boolean(filters.dist) ||
    Boolean(filters.baseBranch) ||
    Boolean(filters.searchQuery) ||
    filters.activityFilter !== 'all' ||
    Boolean(filters.monthFrom) ||
    Boolean(filters.monthTo);

  return (
    <div className="svf-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-slate-100 text-[#0f2942] rounded">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Multi-Tier Regional & Parameter Filters
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {filteredRecords.length} / {records.length} BCAs
          </span>
        </div>

        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Row 1: Cascading Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Month From */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
            Period From
          </label>
          <select
            value={filters.monthFrom}
            onChange={(e) => handleFilterChange({ monthFrom: e.target.value })}
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
          >
            <option value="">Start Period ({availableMonths.length})</option>
            {availableMonths.map((m) => (
              <option key={`from-${m}`} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Month To */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
            Period To
          </label>
          <select
            value={filters.monthTo}
            onChange={(e) => handleFilterChange({ monthTo: e.target.value })}
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
          >
            <option value="">End Period ({availableMonths.length})</option>
            {availableMonths.map((m) => (
              <option key={`to-${m}`} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Zone Dropdown */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
            Zone
          </label>
          <select
            value={filters.zone}
            onChange={(e) =>
              handleFilterChange({
                zone: e.target.value,
                dist: '',
                baseBranch: '',
              })
            }
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
          >
            <option value="">All Zones ({availableZones.length})</option>
            {availableZones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        {/* State Dropdown */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
            State
          </label>
          <select
            value={filters.state}
            onChange={(e) =>
              handleFilterChange({
                state: e.target.value,
                zone: '',
                dist: '',
                baseBranch: '',
              })
            }
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
          >
            <option value="">All States ({availableStates.length})</option>
            {availableStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* District Dropdown */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
            District
          </label>
          <select
            value={filters.dist}
            onChange={(e) =>
              handleFilterChange({
                dist: e.target.value,
                baseBranch: '',
              })
            }
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
          >
            <option value="">All Districts ({availableDistricts.length})</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Base Branch Dropdown */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
            Base Branch
          </label>
          <select
            value={filters.baseBranch}
            onChange={(e) => handleFilterChange({ baseBranch: e.target.value })}
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
          >
            <option value="">All Branches ({availableBranches.length})</option>
            {availableBranches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Search & Activity Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
        {/* Instant Search Bar */}
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search BCA Name, Agent ID, SOL ID, Base Branch, or Location..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
          />
        </div>

        {/* Activity Level Selector */}
        <div>
          <select
            value={filters.activityFilter}
            onChange={(e) => handleFilterChange({ activityFilter: e.target.value as any })}
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
          >
            <option value="all">All Activity Levels</option>
            <option value="high">High Activity (≥90% Attendance)</option>
            <option value="medium">Moderate Activity (70-89%)</option>
            <option value="low">Critical / Inactive (&lt;70%)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
