'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { CommissionRecord, FilterState, SummaryMetrics } from '@/types/commission';
import { INITIAL_COMMISSION_RECORDS } from '@/lib/preloadedData';
import { exportFilteredCommissionExcel } from '@/lib/exportExcel';
import { generateSummaryReportPdf } from '@/lib/exportPdf';

interface CommissionContextType {
  records: CommissionRecord[];
  filteredRecords: CommissionRecord[];
  summaryMetrics: SummaryMetrics;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  handleFilterChange: (newFilters: Partial<FilterState>) => void;
  handleResetFilters: () => void;
  availableStates: string[];
  availableZones: string[];
  availableDistricts: string[];
  availableBranches: string[];
  availableMonths: string[];
  selectedAgent: CommissionRecord | null;
  setSelectedAgent: (agent: CommissionRecord | null) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  handleImportData: (newRecords: CommissionRecord[], mode: 'replace' | 'append') => void;
  exportCurrentExcel: () => void;
  exportCurrentPdf: () => void;
  statementMonthLabel: string;
}

const CommissionContext = createContext<CommissionContextType | undefined>(undefined);

export const CommissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<CommissionRecord[]>(INITIAL_COMMISSION_RECORDS);
  const [selectedAgent, setSelectedAgent] = useState<CommissionRecord | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    state: '',
    zone: '',
    dist: '',
    baseBranch: '',
    monthFrom: '',
    monthTo: '',
    activityFilter: 'all',
  });

  // Calculate available dropdowns dynamically
  const availableMonths = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.statementMonth).filter(Boolean))).sort();
  }, [records]);

  const availableStates = useMemo(() => {
    let list = records;
    if (filters.monthFrom && filters.monthTo) {
      list = list.filter((r) => r.statementMonth >= filters.monthFrom && r.statementMonth <= filters.monthTo);
    } else if (filters.monthFrom) {
      list = list.filter((r) => r.statementMonth === filters.monthFrom);
    }
    return Array.from(new Set(list.map((r) => r.stateName).filter(Boolean))).sort();
  }, [records, filters.monthFrom, filters.monthTo]);

  const availableZones = useMemo(() => {
    let list = records;
    if (filters.state) list = list.filter((r) => r.stateName === filters.state);
    return Array.from(new Set(list.map((r) => r.zoneName).filter(Boolean))).sort();
  }, [records, filters.state]);

  const availableDistricts = useMemo(() => {
    let list = records;
    if (filters.state) list = list.filter((r) => r.stateName === filters.state);
    if (filters.zone) list = list.filter((r) => r.zoneName === filters.zone);
    return Array.from(new Set(list.map((r) => r.dist).filter(Boolean))).sort();
  }, [records, filters.state, filters.zone]);

  const availableBranches = useMemo(() => {
    let list = records;
    if (filters.state) list = list.filter((r) => r.stateName === filters.state);
    if (filters.zone) list = list.filter((r) => r.zoneName === filters.zone);
    if (filters.dist) list = list.filter((r) => r.dist === filters.dist);
    return Array.from(new Set(list.map((r) => r.baseBranch).filter(Boolean))).sort();
  }, [records, filters.state, filters.zone, filters.dist]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      state: '',
      zone: '',
      dist: '',
      baseBranch: '',
      monthFrom: '',
      monthTo: '',
      activityFilter: 'all',
    });
  };

  const handleImportData = (newRecords: CommissionRecord[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setRecords(newRecords);
    } else {
      // Append while deduplicating by record ID
      setRecords((prev) => {
        const map = new Map<string, CommissionRecord>();
        prev.forEach((r) => map.set(r.id, r));
        newRecords.forEach((r) => map.set(r.id, r));
        return Array.from(map.values());
      });
    }
    handleResetFilters();
  };

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Month Date Range Filter
      if (filters.monthFrom && filters.monthTo) {
        if (r.statementMonth < filters.monthFrom || r.statementMonth > filters.monthTo) return false;
      } else if (filters.monthFrom) {
        if (r.statementMonth !== filters.monthFrom) return false;
      }

      // 2. Universal Search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matches =
          r.bcaName.toLowerCase().includes(q) ||
          r.agentId.toLowerCase().includes(q) ||
          (r.agentIdBank && r.agentIdBank.toLowerCase().includes(q)) ||
          r.baseBranch.toLowerCase().includes(q) ||
          (r.solId && r.solId.toLowerCase().includes(q)) ||
          r.villageName.toLowerCase().includes(q) ||
          r.dist.toLowerCase().includes(q) ||
          (r.deviceId && r.deviceId.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 3. State Filter
      if (filters.state && r.stateName !== filters.state) return false;

      // 4. Zone Filter
      if (filters.zone && r.zoneName !== filters.zone) return false;

      // 5. District Filter
      if (filters.dist && r.dist !== filters.dist) return false;

      // 6. Base Branch Filter
      if (filters.baseBranch && r.baseBranch !== filters.baseBranch) return false;

      // 7. Activity / Attendance Filter
      if (filters.activityFilter === 'high' && r.loginPercentage < 90) return false;
      if (filters.activityFilter === 'medium' && (r.loginPercentage < 70 || r.loginPercentage >= 90)) return false;
      if (filters.activityFilter === 'low' && r.loginPercentage >= 70) return false;

      return true;
    });
  }, [records, filters]);

  // Aggregate Key Summary Metrics
  const summaryMetrics: SummaryMetrics = useMemo(() => {
    let totalAccounts = 0;
    let totalFunded = 0;
    let totalNonFunded = 0;
    let totalTxn = 0;
    let totalTxnVol = 0;
    let totalTxnComm = 0;
    let totalApy = 0;
    let totalApyComm = 0;
    let totalSby = 0;
    let totalSbyComm = 0;
    let totalJby = 0;
    let totalJbyComm = 0;
    let totalSssIncentive = 0;
    let totalNetComm = 0;
    let totalBcComm = 0;
    let totalCorpComm = 0;
    let totalLoginPct = 0;
    let activeAgents = 0;

    filteredRecords.forEach((r) => {
      totalAccounts += r.totalNoOfAcctOpn;
      totalFunded += r.fundedNoOfAcctOpn;
      totalNonFunded += r.nonFundedNoOfAcctOpn;
      totalTxn += r.financialTxn;
      totalTxnVol += r.txnAmt;
      totalTxnComm += r.txnComm;
      totalApy += r.apyCount;
      totalApyComm += r.apyComm;
      totalSby += r.sbyCount;
      totalSbyComm += r.sbyComm;
      totalJby += r.jbyCount;
      totalJbyComm += r.jbyComm;
      totalSssIncentive += r.incentive10Sss;
      totalNetComm += r.netCommission;
      totalBcComm += r.bcComm;
      totalCorpComm += r.corpComm;
      totalLoginPct += r.loginPercentage;
      if (r.loginDays > 0) activeAgents += 1;
    });

    const avgLoginPercentage = filteredRecords.length > 0 ? totalLoginPct / filteredRecords.length : 0;

    return {
      totalAgents: filteredRecords.length,
      activeAgents,
      avgLoginPercentage,
      totalAccountsOpened: totalAccounts,
      totalFundedAccounts: totalFunded,
      totalNonFundedAccounts: totalNonFunded,
      totalTxnCount: totalTxn,
      totalTxnVolume: totalTxnVol,
      totalTxnComm: totalTxnComm,
      totalApyCount: totalApy,
      totalApyComm: totalApyComm,
      totalSbyCount: totalSby,
      totalSbyComm: totalSbyComm,
      totalJbyCount: totalJby,
      totalJbyComm: totalJbyComm,
      totalSssIncentive,
      totalNetCommission: totalNetComm,
      totalBcCommission: totalBcComm,
      totalCorpCommission: totalCorpComm,
    };
  }, [filteredRecords]);

  // Export handlers
  const exportCurrentExcel = () => {
    const title = filters.dist || filters.zone || filters.state || 'All_Districts';
    exportFilteredCommissionExcel(filteredRecords, `Sanjivani_Commission_${title}.xlsx`);
  };

  const exportCurrentPdf = () => {
    const title = filters.dist || filters.zone || filters.state || 'All Districts';
    generateSummaryReportPdf(filteredRecords, title);
  };

  const statementMonthLabel = availableMonths.length > 1 ? `${availableMonths[0]} – ${availableMonths[availableMonths.length - 1]}` : (availableMonths[0] || 'AUGUST 2026');

  return (
    <CommissionContext.Provider
      value={{
        records,
        filteredRecords,
        summaryMetrics,
        filters,
        setFilters,
        handleFilterChange,
        handleResetFilters,
        availableStates,
        availableZones,
        availableDistricts,
        availableBranches,
        availableMonths,
        selectedAgent,
        setSelectedAgent,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        handleImportData,
        exportCurrentExcel,
        exportCurrentPdf,
        statementMonthLabel,
      }}
    >
      {children}
    </CommissionContext.Provider>
  );
};

export const useCommission = () => {
  const context = useContext(CommissionContext);
  if (!context) {
    throw new Error('useCommission must be used within a CommissionProvider');
  }
  return context;
};
