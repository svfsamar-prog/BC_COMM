'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCommission } from '@/context/CommissionContext';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

export const FilterDropdownsBar: React.FC = () => {
  const {
    filters,
    handleFilterChange,
    handleResetFilters,
    availableStates,
    availableZones,
    availableDistricts,
    availableBranches,
    filteredRecords,
    records,
  } = useCommission();

  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close "+ Filters" popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsMoreFiltersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Active filter chips list
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (filters.state) {
    activeChips.push({ label: `State: ${filters.state}`, onRemove: () => handleFilterChange({ state: '' }) });
  }
  if (filters.dist) {
    activeChips.push({ label: `District: ${filters.dist}`, onRemove: () => handleFilterChange({ dist: '' }) });
  }
  if (filters.zone) {
    activeChips.push({ label: `Zone: ${filters.zone}`, onRemove: () => handleFilterChange({ zone: '' }) });
  }
  if (filters.baseBranch) {
    activeChips.push({ label: `Branch: ${filters.baseBranch}`, onRemove: () => handleFilterChange({ baseBranch: '' }) });
  }
  if (filters.activityFilter && filters.activityFilter !== 'all') {
    const labelMap: Record<string, string> = {
      high: 'High (>90% Login)',
      medium: 'Medium (70-90% Login)',
      low: 'Low (<70% Login)',
      attention: 'Needs Attention (<15 Days)',
    };
    activeChips.push({
      label: labelMap[filters.activityFilter] || filters.activityFilter,
      onRemove: () => handleFilterChange({ activityFilter: 'all' }),
    });
  }
  if (filters.searchQuery) {
    activeChips.push({
      label: `"${filters.searchQuery}"`,
      onRemove: () => handleFilterChange({ searchQuery: '' }),
    });
  }

  const hasActiveFilters = activeChips.length > 0;
  const extraFiltersActiveCount = (filters.zone ? 1 : 0) + (filters.baseBranch ? 1 : 0) + (filters.activityFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-2.5 bg-white p-3 rounded-xl border border-[#E5E7EB] shadow-xs">
      {/* 1. All Filter Dropdowns Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            ref={searchInputRef}
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
            placeholder="Search name, Agent ID, branch... (Press /)"
            className="w-full pl-8 pr-7 py-1.5 text-xs text-[#0A0A0A] bg-[#F8FAFC] border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5C36] focus:border-transparent transition-fast placeholder-[#9CA3AF]"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0A0A0A]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* State Dropdown */}
        <div className="relative">
          <select
            value={filters.state}
            onChange={(e) => handleFilterChange({ state: e.target.value, zone: '', dist: '', baseBranch: '' })}
            className="w-full h-8 px-2.5 pr-7 text-xs font-medium text-[#0A0A0A] bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5C36] appearance-none cursor-pointer"
          >
            <option value="">All States</option>
            {availableStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]" />
        </div>

        {/* Zone Dropdown */}
        <div className="relative">
          <select
            value={filters.zone}
            onChange={(e) => handleFilterChange({ zone: e.target.value, dist: '', baseBranch: '' })}
            className="w-full h-8 px-2.5 pr-7 text-xs font-medium text-[#0A0A0A] bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5C36] appearance-none cursor-pointer"
          >
            <option value="">All Zones</option>
            {availableZones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]" />
        </div>

        {/* District Dropdown */}
        <div className="relative">
          <select
            value={filters.dist}
            onChange={(e) => handleFilterChange({ dist: e.target.value, baseBranch: '' })}
            className="w-full h-8 px-2.5 pr-7 text-xs font-medium text-[#0A0A0A] bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5C36] appearance-none cursor-pointer"
          >
            <option value="">All Districts</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]" />
        </div>

        {/* Base Branch Dropdown */}
        <div className="relative">
          <select
            value={filters.baseBranch}
            onChange={(e) => handleFilterChange({ baseBranch: e.target.value })}
            className="w-full h-8 px-2.5 pr-7 text-xs font-medium text-[#0A0A0A] bg-white border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5C36] appearance-none cursor-pointer"
          >
            <option value="">All Branches</option>
            {availableBranches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]" />
        </div>
      </div>

      {/* 2. Active Filter Chips, Attendance Filter & Counter Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F3F4F6]">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Quick Attendance Selector */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-lg text-[11px] font-medium text-[#475569]">
            <button
              onClick={() => handleFilterChange({ activityFilter: 'all' })}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filters.activityFilter === 'all' ? 'bg-white font-bold text-[#0A5C36] shadow-xs' : 'hover:text-[#0A0A0A]'
              }`}
            >
              All Activity
            </button>
            <button
              onClick={() => handleFilterChange({ activityFilter: 'high' })}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filters.activityFilter === 'high' ? 'bg-white font-bold text-[#0A5C36] shadow-xs' : 'hover:text-[#0A0A0A]'
              }`}
            >
              High (&gt;90%)
            </button>
            <button
              onClick={() => handleFilterChange({ activityFilter: 'low' })}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filters.activityFilter === 'low' ? 'bg-white font-bold text-amber-700 shadow-xs' : 'hover:text-[#0A0A0A]'
              }`}
            >
              Low (&lt;70%)
            </button>
            <button
              onClick={() => handleFilterChange({ activityFilter: 'attention' })}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                filters.activityFilter === 'attention' ? 'bg-white font-bold text-amber-700 shadow-xs' : 'hover:text-[#0A0A0A]'
              }`}
            >
              Attention (&lt;15d)
            </button>
          </div>

          {/* Active Chips */}
          {hasActiveFilters && (
            <>
              {activeChips.map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-[#F0FDF4] text-[#166534] rounded-md border border-[#BBF7D0]"
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={chip.onRemove}
                    className="hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                    title="Remove filter"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[#0A5C36] hover:underline font-semibold ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Counter */}
        <div className="text-xs text-[#6B7280]">
          Showing <strong className="text-[#0A0A0A] font-bold">{filteredRecords.length.toLocaleString()}</strong> of {records.length.toLocaleString()} agents
        </div>
      </div>
    </div>
  );
};
