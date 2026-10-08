'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { CommissionRecord, FilterState, SummaryMetrics } from '@/types/commission';
import { INITIAL_COMMISSION_RECORDS } from '@/lib/preloadedData';
import { exportFilteredCommissionExcel } from '@/lib/exportExcel';
import { generateSummaryReportPdf, generatePayoutListPdf, generateBulkVouchersPdf, generateAgentCommissionVoucherPdf } from '@/lib/exportPdf';

export interface ToastNotification {
  id: number;
  message: string;
  onUndo?: () => void;
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
  availableMonths: string[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  selectedAgent: CommissionRecord | null;
  setSelectedAgent: (agent: CommissionRecord | null) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  handleImportData: (newRecords: CommissionRecord[]) => Promise<void>;
  toast: ToastNotification | null;
  dismissToast: () => void;
  exportCurrentExcel: () => void;
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
}

const CommissionContext = createContext<CommissionContextType | undefined>(undefined);

export const CommissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<CommissionRecord[]>(INITIAL_COMMISSION_RECORDS);
  const [previousSnapshot, setPreviousSnapshot] = useState<CommissionRecord[] | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<CommissionRecord | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // 1. Remember Last Opened Tab
  const [activeTab, setActiveTabState] = useState<'overview' | 'register' | 'schemes'>('overview');

  // 2. Remember Last Selected Period
  const [selectedPeriod, setSelectedPeriodState] = useState<string>('AUGUST 2026');

  // 3. Remember Last Applied Filters
  const [filters, setFiltersState] = useState<FilterState>({
    searchQuery: '',
    state: '',
    zone: '',
    dist: '',
    baseBranch: '',
    monthFrom: '',
    monthTo: '',
    activityFilter: 'all',
  });

  // Restore saved settings on mount
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem('svf_active_tab') as any;
      if (savedTab && ['overview', 'register', 'schemes'].includes(savedTab)) {
        setActiveTabState(savedTab);
      }

      const savedPeriod = localStorage.getItem('svf_selected_period');
      if (savedPeriod) {
        setSelectedPeriodState(savedPeriod);
      }

      const savedFilters = localStorage.getItem('svf_filters');
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        setFiltersState((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('LocalStorage restore error:', e);
    }
  }, []);

  const setActiveTab = (tab: 'overview' | 'register' | 'schemes') => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('svf_active_tab', tab);
    } catch (e) {}
  };

  const setSelectedPeriod = (period: string) => {
    setSelectedPeriodState(period);
    try {
      localStorage.setItem('svf_selected_period', period);
    } catch (e) {}

    if (period === 'ALL') {
      setFilters((prev) => ({ ...prev, monthFrom: '', monthTo: '' }));
    } else {
      setFilters((prev) => ({ ...prev, monthFrom: period, monthTo: period }));
    }
  };

  const setFilters: React.Dispatch<React.SetStateAction<FilterState>> = (updater) => {
    setFiltersState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem('svf_filters', JSON.stringify(next));
      } catch (e) {}
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
      monthFrom: selectedPeriod !== 'ALL' ? selectedPeriod : '',
      monthTo: selectedPeriod !== 'ALL' ? selectedPeriod : '',
      activityFilter: 'all',
    });
  };

  // Fetch persisted statements from database on mount
  useEffect(() => {
    async function loadPersistedRecords() {
      setIsLoadingDb(true);
      try {
        const res = await fetch('/api/records');
        if (res.ok) {
          const json = await res.json();
          if (json.records && json.records.length > 0) {
            setRecords(json.records);
          }
        }
      } catch (e) {
        console.warn('Database load fallback to initial dataset:', e);
      } finally {
        setIsLoadingDb(false);
      }
    }
    loadPersistedRecords();
  }, []);

  // Available Months detected from dataset
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.statementMonth) set.add(r.statementMonth);
    });
    return Array.from(set).sort();
  }, [records]);

  // Keep selectedPeriod valid when dataset changes
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedPeriod) && selectedPeriod !== 'ALL') {
      const fallback = availableMonths[availableMonths.length - 1] || 'AUGUST 2026';
      setSelectedPeriodState(fallback);
      try {
        localStorage.setItem('svf_selected_period', fallback);
      } catch (e) {}
    }
  }, [availableMonths, selectedPeriod]);

  // Dynamic cascading dropdowns
  const availableStates = useMemo(() => {
    let list = records;
    if (selectedPeriod !== 'ALL' && selectedPeriod) {
      list = list.filter((r) => r.statementMonth === selectedPeriod);
    }
    return Array.from(new Set(list.map((r) => r.stateName).filter(Boolean))).sort();
  }, [records, selectedPeriod]);

  const availableZones = useMemo(() => {
    let list = records;
    if (selectedPeriod !== 'ALL' && selectedPeriod) {
      list = list.filter((r) => r.statementMonth === selectedPeriod);
    }
    if (filters.state) list = list.filter((r) => r.stateName === filters.state);
    return Array.from(new Set(list.map((r) => r.zoneName).filter(Boolean))).sort();
  }, [records, selectedPeriod, filters.state]);

  const availableDistricts = useMemo(() => {
    let list = records;
    if (selectedPeriod !== 'ALL' && selectedPeriod) {
      list = list.filter((r) => r.statementMonth === selectedPeriod);
    }
    if (filters.state) list = list.filter((r) => r.stateName === filters.state);
    if (filters.zone) list = list.filter((r) => r.zoneName === filters.zone);
    return Array.from(new Set(list.map((r) => r.dist).filter(Boolean))).sort();
  }, [records, selectedPeriod, filters.state, filters.zone]);

  const availableBranches = useMemo(() => {
    let list = records;
    if (selectedPeriod !== 'ALL' && selectedPeriod) {
      list = list.filter((r) => r.statementMonth === selectedPeriod);
    }
    if (filters.state) list = list.filter((r) => r.stateName === filters.state);
    if (filters.zone) list = list.filter((r) => r.zoneName === filters.zone);
    if (filters.dist) list = list.filter((r) => r.dist === filters.dist);
    return Array.from(new Set(list.map((r) => r.baseBranch).filter(Boolean))).sort();
  }, [records, selectedPeriod, filters.state, filters.zone, filters.dist]);

  // 1-step intelligent Import + Database Persistence + Undo
  const handleImportData = async (newRecords: CommissionRecord[]) => {
    if (!newRecords || newRecords.length === 0) return;

    const prevData = [...records];
    setPreviousSnapshot(prevData);

    const importedMonths = Array.from(new Set(newRecords.map((r) => r.statementMonth).filter(Boolean)));
    const targetMonthStr = importedMonths.join(', ') || 'Current Statement';

    // Replace matching month records, keep all others in memory
    const remainingRecords = prevData.filter((r) => !importedMonths.includes(r.statementMonth));
    const mergedRecords = [...remainingRecords, ...newRecords];

    setRecords(mergedRecords);
    if (importedMonths.length > 0) {
      setSelectedPeriod(importedMonths[0]);
    }
    handleResetFilters();

    setToast({
      id: Date.now(),
      message: `${newRecords.length} BCAs imported for ${targetMonthStr}. Saving to database...`,
      onUndo: async () => {
        setRecords(prevData);
        try {
          await fetch('/api/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: prevData }),
          });
        } catch (e) {
          console.error('Undo persist error:', e);
        }
        setToast({
          id: Date.now(),
          message: `Import undone. Restored previous dataset in database.`,
        });
      },
    });

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: newRecords }),
      });
      if (res.ok) {
        setToast({
          id: Date.now(),
          message: `${newRecords.length} BCAs saved to database for ${targetMonthStr}.`,
        });
      }
    } catch (e) {
      console.error('Failed to persist to database:', e);
    }
  };

  const dismissToast = () => {
    setToast(null);
  };

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Month Filter
      if (selectedPeriod !== 'ALL' && selectedPeriod) {
        if (r.statementMonth !== selectedPeriod) return false;
      } else if (filters.monthFrom && filters.monthTo) {
        if (r.statementMonth < filters.monthFrom || r.statementMonth > filters.monthTo) return false;
      }

      // 2. Search Query
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

      // 3. State
      if (filters.state && r.stateName !== filters.state) return false;

      // 4. Zone
      if (filters.zone && r.zoneName !== filters.zone) return false;

      // 5. District
      if (filters.dist && r.dist !== filters.dist) return false;

      // 6. Base Branch
      if (filters.baseBranch && r.baseBranch !== filters.baseBranch) return false;

      // 7. Activity Filter
      if (filters.activityFilter === 'high' && r.loginPercentage < 90) return false;
      if (filters.activityFilter === 'medium' && (r.loginPercentage < 70 || r.loginPercentage >= 90)) return false;
      if (filters.activityFilter === 'low' && r.loginPercentage >= 70) return false;
      if (filters.activityFilter === 'attention' && r.loginDays >= 15) return false;

      return true;
    });
  }, [records, selectedPeriod, filters]);

  // Summary Metrics calculation (Strictly preserved mathematical integrity)
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

  // Clickable bar on overview chart filters Register by district
  const filterByDistrict = (district: string) => {
    handleResetFilters();
    setFilters((prev) => ({ ...prev, dist: district }));
    setActiveTab('register');
  };

  // "Needs attention" list item clicks to register
  const filterByNeedsAttention = () => {
    handleResetFilters();
    setFilters((prev) => ({ ...prev, activityFilter: 'attention' }));
    setActiveTab('register');
  };

  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);

  // Exports
  const exportCurrentExcel = () => {
    const title = filters.dist || filters.state || (selectedPeriod === 'ALL' ? 'All_Periods' : selectedPeriod) || 'Filtered_BCAs';
    exportFilteredCommissionExcel(filteredRecords, `Sanjivani_Commission_${title}.xlsx`);
    setToast({
      id: Date.now(),
      message: `Exported ${filteredRecords.length} BCAs to Excel (33 Columns)`,
    });
  };

  const exportCurrentPdf = () => {
    const title = filters.dist || filters.state || (selectedPeriod === 'ALL' ? 'All Statements' : selectedPeriod) || 'Commission Summary';
    generateSummaryReportPdf(filteredRecords, title);
    setToast({
      id: Date.now(),
      message: `Exported summary report for ${filteredRecords.length} BCAs`,
    });
  };

  const exportPayoutListPdf = () => {
    const title = filters.dist || filters.state || (selectedPeriod === 'ALL' ? 'All Statements' : selectedPeriod) || 'Payout List';
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

  const statementMonthLabel = selectedPeriod === 'ALL' ? 'All Statements' : (selectedPeriod || 'August 2026');

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
        selectedPeriod,
        setSelectedPeriod,
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
