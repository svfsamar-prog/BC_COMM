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
    <div className="space-y-2.5">
      {/* Search & Top Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Universal Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            ref={searchInputRef}
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
            placeholder="Search name, Agent ID, branch, village... (Press /)"
            className="w-full pl-8 pr-7 py-1.5 text-xs text-[#0A0A0A] bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0F2942] transition-fast placeholder-[#9CA3AF]"
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
            className="h-8 px-2.5 pr-7 text-xs text-[#0A0A0A] bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0F2942] appearance-none cursor-pointer"
          >
            <option value="">All States</option>
            {availableStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]" />
        </div>

        {/* District Dropdown */}
        <div className="relative">
          <select
            value={filters.dist}
            onChange={(e) => handleFilterChange({ dist: e.target.value, baseBranch: '' })}
            className="h-8 px-2.5 pr-7 text-xs text-[#0A0A0A] bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0F2942] appearance-none cursor-pointer"
          >
            <option value="">All Districts</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]" />
        </div>

        {/* + Filters Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
            className={`h-8 px-2.5 flex items-center gap-1.5 text-xs font-medium border rounded-md transition-fast ${
              extraFiltersActiveCount > 0
                ? 'bg-[#0F2942] text-white border-[#0F2942]'
                : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#FAFAFA]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>+ Filters</span>
            {extraFiltersActiveCount > 0 && (
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {extraFiltersActiveCount}
              </span>
            )}
          </button>

          {isMoreFiltersOpen && (
            <div className="absolute right-0 mt-1 w-72 bg-white border border-[#E5E7EB] rounded-lg shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6]">
                <span className="text-xs font-semibold text-[#0A0A0A]">Additional Filters</span>
                <button
                  onClick={() => setIsMoreFiltersOpen(false)}
                  className="text-[#9CA3AF] hover:text-[#0A0A0A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Zone */}
              <div>
                <label className="block text-[11px] text-[#6B7280] mb-1">Administrative Zone</label>
                <select
                  value={filters.zone}
                  onChange={(e) => handleFilterChange({ zone: e.target.value, dist: '', baseBranch: '' })}
                  className="w-full h-8 px-2 text-xs border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0F2942]"
                >
                  <option value="">All Zones</option>
                  {availableZones.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              {/* Base Branch */}
              <div>
                <label className="block text-[11px] text-[#6B7280] mb-1">Base Branch</label>
                <select
                  value={filters.baseBranch}
                  onChange={(e) => handleFilterChange({ baseBranch: e.target.value })}
                  className="w-full h-8 px-2 text-xs border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0F2942]"
                >
                  <option value="">All Branches</option>
                  {availableBranches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-[11px] text-[#6B7280] mb-1">Attendance & Activity</label>
                <select
                  value={filters.activityFilter}
                  onChange={(e) => handleFilterChange({ activityFilter: e.target.value as any })}
                  className="w-full h-8 px-2 text-xs border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#0F2942]"
                >
                  <option value="all">All Activity Levels</option>
                  <option value="high">High Activity (&gt;90% Login)</option>
                  <option value="medium">Medium Activity (70-90% Login)</option>
                  <option value="low">Low Activity (&lt;70% Login)</option>
                  <option value="attention">Needs Attention (&lt;15 Days Login)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#F3F4F6] flex justify-end">
                <button
                  onClick={() => setIsMoreFiltersOpen(false)}
                  className="px-3 py-1 bg-[#0F2942] text-white text-xs font-medium rounded-md hover:bg-[#0A1D30]"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Chips & Counter */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#6B7280]">Active filters:</span>
          {activeChips.map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-[#F3F4F6] text-[#374151] rounded border border-[#E5E7EB]"
            >
              <span>{chip.label}</span>
              <button
                onClick={chip.onRemove}
                className="hover:text-[#DC2626] transition-colors ml-0.5"
                title="Remove filter"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-[#0F2942] hover:underline font-medium ml-1"
          >
            Clear all
          </button>
          <span className="text-[11px] text-[#6B7280] ml-auto">
            Showing <strong className="text-[#0A0A0A]">{filteredRecords.length.toLocaleString()}</strong> of {records.length.toLocaleString()} BCAs
          </span>
        </div>
      )}
    </div>
  );
};
