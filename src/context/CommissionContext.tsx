'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { CommissionRecord, FilterState, SummaryMetrics, PeriodInfo } from '@/types/commission';
import { INITIAL_COMMISSION_RECORDS } from '@/lib/preloadedData';
import { exportMultiPeriodCommissionExcel } from '@/lib/exportExcel';
import { generateSummaryReportPdf, generatePayoutListPdf, generateBulkVouchersPdf, generateAgentCommissionVoucherPdf } from '@/lib/exportPdf';
import { sortMonthYearArray, parseMonthYearString } from '@/lib/normalization';

export interface ToastNotification {
  id: number;
  message: string;
  onUndo?: () => void;
}

export interface ReconciliationStatus {
  isReconciled: boolean;
  expectedCount: number;
  actualCount: number;
  expectedGross: number;
  actualGross: number;
  differenceGross: number;
  statusText: string;
}

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
  availablePeriods: PeriodInfo[];
  availableMonths: string[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  monthFrom: string;
  setMonthFrom: (m: string) => void;
  monthTo: string;
  setMonthTo: (m: string) => void;
  setMonthRange: (from: string, to: string) => void;
  selectedAgent: CommissionRecord | null;
  setSelectedAgent: (agent: CommissionRecord | null) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  handleImportData: (newRecords: CommissionRecord[], targetMonth: string, targetYear: number, targetDays: number) => Promise<void>;
  toast: ToastNotification | null;
  dismissToast: () => void;
  exportCurrentExcel: (mode?: 'month_wise' | 'cumulative') => void;
  exportCurrentPdf: () => void;
  exportPayoutListPdf: () => void;
  exportBulkVouchersPdf: () => Promise<void>;
  exportSingleVoucherPdf: (record: CommissionRecord) => Promise<void>;
  isGeneratingBulk: boolean;
  bulkProgress: { current: number; total: number } | null;
  statementMonthLabel: string;
  activeTab: 'overview' | 'register' | 'schemes';
  setActiveTab: (tab: 'overview' | 'register' | 'schemes') => void;
  filterByDistrict: (district: string) => void;
  filterByNeedsAttention: () => void;
  isLoadingDb: boolean;
  dbError: string | null;
  reconciliation: ReconciliationStatus;
  refreshData: () => Promise<void>;
}

const CommissionContext = createContext<CommissionContextType | undefined>(undefined);

export const CommissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<CommissionRecord | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [availablePeriods, setAvailablePeriods] = useState<PeriodInfo[]>([]);

  // Navigation tab
  const [activeTab, setActiveTabState] = useState<'overview' | 'register' | 'schemes'>('overview');

  // Month Selection State: Single / Range driven
  const [selectedPeriod, setSelectedPeriodState] = useState<string>('AUGUST 2026');
  const [monthFrom, setMonthFromState] = useState<string>('AUGUST 2026');
  const [monthTo, setMonthToState] = useState<string>('AUGUST 2026');

  // Reconciliation state
  const [reconciliation, setReconciliation] = useState<ReconciliationStatus>({
    isReconciled: true,
    expectedCount: 0,
    actualCount: 0,
    expectedGross: 0,
    actualGross: 0,
    differenceGross: 0,
    statusText: 'Loading reconciliation...',
  });

  // Filters State
  const [filters, setFiltersState] = useState<FilterState>({
    searchQuery: '',
    state: '',
    zone: '',
    dist: '',
    baseBranch: '',
    monthFrom: 'AUGUST 2026',
    monthTo: 'AUGUST 2026',
    activityFilter: 'all',
  });

  // Fetch Available Periods from server on mount
  useEffect(() => {
    async function initPeriods() {
      try {
        const res = await fetch('/api/periods');
        if (res.ok) {
          const data = await res.json();
          if (data.periods && data.periods.length > 0) {
            setAvailablePeriods(data.periods);
            const latest = data.periods[0].month_year;
            setSelectedPeriodState(latest);
            setMonthFromState(latest);
            setMonthToState(latest);
            setFiltersState((prev) => ({ ...prev, monthFrom: latest, monthTo: latest }));
          }
        }
      } catch (e: any) {
        console.warn('Periods fetch warning:', e);
      }
    }
    initPeriods();
  }, []);

  // Fetch Persisted Records for the currently chosen period/range
  const loadRecords = useCallback(async (fromM: string, toM: string) => {
    setIsLoadingDb(true);
    setDbError(null);
    try {
      const isSingle = fromM === toM;
      let url = isSingle ? `/api/records?month=${encodeURIComponent(fromM)}` : `/api/records?monthFrom=${encodeURIComponent(fromM)}&monthTo=${encodeURIComponent(toM)}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.records) {
          setRecords(json.records);
        }
        if (json.reconciliation) {
          setReconciliation(json.reconciliation);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setDbError(errJson.error || `Failed to fetch data (status ${res.status})`);
        setRecords([]);
      }
    } catch (e: any) {
      console.error('Database load error:', e);
      setDbError(e.message || 'Network connection to database failed.');
      setRecords([]);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  useEffect(() => {
    if (monthFrom && monthTo) {
      loadRecords(monthFrom, monthTo);
    }
  }, [monthFrom, monthTo, loadRecords]);

  const setActiveTab = (tab: 'overview' | 'register' | 'schemes') => {
    setActiveTabState(tab);
  };

  const setSelectedPeriod = (period: string) => {
    setSelectedPeriodState(period);
    setMonthFromState(period);
    setMonthToState(period);
    setFilters((prev) => ({ ...prev, monthFrom: period, monthTo: period }));
  };

  const setMonthFrom = (m: string) => {
    setMonthFromState(m);
    setFilters((prev) => ({ ...prev, monthFrom: m }));
  };

  const setMonthTo = (m: string) => {
    setMonthToState(m);
    setFilters((prev) => ({ ...prev, monthTo: m }));
  };

  const setMonthRange = (from: string, to: string) => {
    setMonthFromState(from);
    setMonthToState(to);
    setSelectedPeriodState(from === to ? from : `${from} - ${to}`);
    setFilters((prev) => ({ ...prev, monthFrom: from, monthTo: to }));
  };

  const setFilters: React.Dispatch<React.SetStateAction<FilterState>> = (updater) => {
    setFiltersState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
  };

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
      monthFrom: monthFrom,
      monthTo: monthTo,
      activityFilter: 'all',
    });
  };

  const availableMonths = useMemo(() => {
    if (availablePeriods.length > 0) {
      return availablePeriods.map((p) => p.month_year);
    }
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.statementMonth) set.add(r.statementMonth);
    });
    return sortMonthYearArray(Array.from(set));
  }, [availablePeriods, records]);

  // Dynamic cascading dropdowns
  const availableStates = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.stateName).filter(Boolean))).sort();
  }, [records]);

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

  // Save statement data
  const handleImportData = async (
    newRecords: CommissionRecord[],
    targetMonth: string,
    targetYear: number,
    targetDays: number
  ) => {
    if (!newRecords || newRecords.length === 0) return;

    const targetMonthStr = `${targetMonth.toUpperCase()} ${targetYear}`;

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: newRecords,
          month: targetMonth,
          year: targetYear,
          daysInMonth: targetDays,
        }),
      });

      if (res.ok) {
        setToast({
          id: Date.now(),
          message: `Saved ${newRecords.length} BCAs for ${targetMonthStr} to database.`,
        });
        // Refresh periods and records
        const pRes = await fetch('/api/periods');
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.periods) setAvailablePeriods(pData.periods);
        }
        setSelectedPeriod(targetMonthStr);
      } else {
        const errJson = await res.json();
        setToast({
          id: Date.now(),
          message: `Import failed: ${errJson.error || 'Server error'}`,
        });
      }
    } catch (e: any) {
      setToast({
        id: Date.now(),
        message: `Network error during save: ${e.message}`,
      });
    }
  };

  const dismissToast = () => {
    setToast(null);
  };

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Search Query
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

      // 2. State
      if (filters.state && r.stateName !== filters.state) return false;

      // 3. Zone
      if (filters.zone && r.zoneName !== filters.zone) return false;

      // 4. District
      if (filters.dist && r.dist !== filters.dist) return false;

      // 5. Base Branch
      if (filters.baseBranch && r.baseBranch !== filters.baseBranch) return false;

      // 6. Activity Filter
      if (filters.activityFilter === 'high' && r.loginPercentage < 90) return false;
      if (filters.activityFilter === 'medium' && (r.loginPercentage < 70 || r.loginPercentage >= 90)) return false;
      if (filters.activityFilter === 'low' && r.loginPercentage >= 70) return false;
      if (filters.activityFilter === 'attention' && r.loginDays >= 15) return false;

      return true;
    });
  }, [records, filters]);

  // Summary Metrics calculation (Accurate sum across filtered records)
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
      totalAccounts += r.totalNoOfAcctOpn || 0;
      totalFunded += r.fundedNoOfAcctOpn || 0;
      totalNonFunded += r.nonFundedNoOfAcctOpn || 0;
      totalTxn += r.financialTxn || 0;
      totalTxnVol += r.txnAmt || 0;
      totalTxnComm += r.txnComm || 0;
      totalApy += r.apyCount || 0;
      totalApyComm += r.apyComm || 0;
      totalSby += r.sbyCount || 0;
      totalSbyComm += r.sbyComm || 0;
      totalJby += r.jbyCount || 0;
      totalJbyComm += r.jbyComm || 0;
      totalSssIncentive += r.incentive10Sss || 0;
      totalNetComm += r.netCommission || 0;
      totalBcComm += r.bcComm || 0;
      totalCorpComm += r.corpComm || 0;
      totalLoginPct += r.loginPercentage || 0;
      if (r.loginDays > 0) activeAgents += 1;
    });

    const avgLoginPercentage = filteredRecords.length > 0 ? totalLoginPct / filteredRecords.length : 0;
    const totalTdsDeduction = Number((totalBcComm * 0.02).toFixed(2));
    const totalNetPayable = Number((totalBcComm - totalTdsDeduction).toFixed(2));

    return {
      totalAgents: filteredRecords.length,
      activeAgents,
      avgLoginPercentage: Number(avgLoginPercentage.toFixed(2)),
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
      totalNetCommission: Number(totalNetComm.toFixed(2)),
      totalBcCommission: Number(totalBcComm.toFixed(2)),
      totalCorpCommission: Number(totalCorpComm.toFixed(2)),
      totalTdsDeduction,
      totalNetPayable,
    };
  }, [filteredRecords]);

  const filterByDistrict = (district: string) => {
    handleResetFilters();
    setFilters((prev) => ({ ...prev, dist: district }));
    setActiveTab('register');
  };

  const filterByNeedsAttention = () => {
    handleResetFilters();
    setFilters((prev) => ({ ...prev, activityFilter: 'attention' }));
    setActiveTab('register');
  };

  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);

  // Exports
  const exportCurrentExcel = (mode: 'month_wise' | 'cumulative' = 'month_wise') => {
    const title = filters.dist || filters.state || selectedPeriod.replace(/\s+/g, '_') || 'Filtered_BCAs';
    exportMultiPeriodCommissionExcel(filteredRecords, `Sanjivani_Commission_${title}.xlsx`, mode);
    setToast({
      id: Date.now(),
      message: `Exported ${filteredRecords.length} BCAs to Excel (${mode === 'cumulative' ? 'Cumulative' : 'Month-wise'})`,
    });
  };

  const exportCurrentPdf = () => {
    const title = filters.dist || filters.state || selectedPeriod || 'Commission Summary';
    generateSummaryReportPdf(filteredRecords, title);
    setToast({
      id: Date.now(),
      message: `Exported summary report for ${filteredRecords.length} BCAs`,
    });
  };

  const exportPayoutListPdf = () => {
    const title = filters.dist || filters.state || selectedPeriod || 'Payout List';
    generatePayoutListPdf(filteredRecords, title);
    setToast({
      id: Date.now(),
      message: `Exported payout disbursement list for ${filteredRecords.length} BCAs`,
    });
  };

  const exportBulkVouchersPdf = async () => {
    if (filteredRecords.length === 0) return;
    setIsGeneratingBulk(true);
    setBulkProgress({ current: 0, total: filteredRecords.length });

    try {
      await generateBulkVouchersPdf(filteredRecords, (current, total) => {
        setBulkProgress({ current, total });
      });
      setToast({
        id: Date.now(),
        message: `Exported all ${filteredRecords.length} commission vouchers with QR codes`,
      });
    } catch (err) {
      console.error('Failed to generate bulk vouchers:', err);
      setToast({
        id: Date.now(),
        message: 'Failed to generate bulk vouchers. Please try again.',
      });
    } finally {
      setIsGeneratingBulk(false);
      setBulkProgress(null);
    }
  };

  const exportSingleVoucherPdf = async (record: CommissionRecord) => {
    try {
      await generateAgentCommissionVoucherPdf(record);
      setToast({
        id: Date.now(),
        message: `Downloaded voucher for ${record.bcaName} (${record.agentId})`,
      });
    } catch (err) {
      console.error('Failed to generate single voucher:', err);
    }
  };

  const refreshData = async () => {
    await loadRecords(monthFrom, monthTo);
  };

  const statementMonthLabel = monthFrom === monthTo ? monthFrom : `${monthFrom} to ${monthTo}`;

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
        availablePeriods,
        availableMonths,
        selectedPeriod,
        setSelectedPeriod,
        monthFrom: monthFrom,
        setMonthFrom,
        monthTo: monthTo,
        setMonthTo,
        setMonthRange,
        selectedAgent,
        setSelectedAgent,
        isUploadModalOpen,
        setIsUploadModalOpen,
        handleImportData,
        toast,
        dismissToast,
        exportCurrentExcel,
        exportCurrentPdf,
        exportPayoutListPdf,
        exportBulkVouchersPdf,
        exportSingleVoucherPdf,
        isGeneratingBulk,
        bulkProgress,
        statementMonthLabel,
        activeTab,
        setActiveTab,
        filterByDistrict,
        filterByNeedsAttention,
        isLoadingDb,
        dbError,
        reconciliation,
        refreshData,
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
