'use client';

import React from 'react';
import { Search, Calendar, MapPin, Building, Activity, X, Sparkles, Filter, Users, TrendingUp, ShieldAlert } from 'lucide-react';
import { FilterState } from '@/types/commission';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  availableStates: string[];
  availableZones: string[];
  availableDistricts: string[];
  availableMonths: string[];
  activePreset: string | null;
  onSelectPreset: (preset: string | null) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  availableStates,
  availableZones,
  availableDistricts,
  availableMonths,
  activePreset,
  onSelectPreset,
}) => {
  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    Boolean(filters.state) ||
    Boolean(filters.zone) ||
    Boolean(filters.dist) ||
    filters.activityFilter !== 'all' ||
    Boolean(activePreset);

  const presets = [
    { id: 'all', label: 'All BCAs', icon: null },
    { id: 'top-earners', label: 'Top Earners (₹10k+)', icon: TrendingUp },
    { id: 'high-sss', label: 'High SSS (15+ Policies)', icon: Sparkles },
    { id: 'perfect-login', label: '100% Attendance (31d)', icon: Users },
    { id: 'low-activity', label: 'Low Activity (<15d)', icon: ShieldAlert },
    { id: 'high-casa', label: 'High CASA (10+ A/Cs)', icon: Filter },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded p-4 shadow-sm space-y-3">
      {/* Top Header & Reset */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Universal Filters & Analytical Presets
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => {
              onReset();
              onSelectPreset(null);
            }}
            className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-800 font-semibold transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear All Filters</span>
          </button>
        )}
      </div>

      {/* Preset Chips Row */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase flex-shrink-0">
          Quick Views:
        </span>
        {presets.map((p) => {
          const isSelected = (!activePreset && p.id === 'all') || activePreset === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id === 'all' ? null : p.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {Icon && <Icon className={`w-3 h-3 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />}
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cascading Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        {/* Universal Search Input */}
        <div className="lg:col-span-2 relative">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Universal Agent Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Search Name, Agent ID, SOL, Branch, Village..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* State Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            State
          </label>
          <select
            value={filters.state}
            onChange={(e) => onFilterChange({ state: e.target.value, zone: '', dist: '' })}
            className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
          >
            <option value="">All States ({availableStates.length})</option>
            {availableStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Zone Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Bank Zone
          </label>
          <select
            value={filters.zone}
            onChange={(e) => onFilterChange({ zone: e.target.value, dist: '' })}
            className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
          >
            <option value="">All Zones ({availableZones.length})</option>
            {availableZones.map((zn) => (
              <option key={zn} value={zn}>
                {zn}
              </option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            District
          </label>
          <select
            value={filters.dist}
            onChange={(e) => onFilterChange({ dist: e.target.value })}
            className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
          >
            <option value="">All Districts ({availableDistricts.length})</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Login Activity / Attendance Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Login Activity (%)
          </label>
          <select
            value={filters.activityFilter}
            onChange={(e) =>
              onFilterChange({
                activityFilter: e.target.value as FilterState['activityFilter'],
              })
            }
            className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
          >
            <option value="all">All Activity Levels</option>
            <option value="high">High Activity (≥90%)</option>
            <option value="medium">Moderate (70% - 89%)</option>
            <option value="low">Low Activity (&lt;70%)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
