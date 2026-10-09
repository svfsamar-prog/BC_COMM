import { supabase, mapMonthlyRecordToCommission } from './supabaseClient';
import { CommissionRecord, SummaryMetrics, PeriodInfo, UserSession } from '@/types/commission';
import { INITIAL_COMMISSION_RECORDS } from './preloadedData';
import { sortMonthYearArray, parseMonthYearString, normalizeStateName, normalizeZoneName, normalizeDistName } from './normalization';

export interface QueryRecordsParams {
  month?: string;
  monthFrom?: string;
  monthTo?: string;
  state?: string;
  zone?: string;
  dist?: string;
  baseBranch?: string;
  searchQuery?: string;
  user?: UserSession | null;
  includeZeroFilled?: boolean;
}

export interface RecordsQueryResult {
  records: CommissionRecord[];
  total: number;
  summaryMetrics: SummaryMetrics;
  reconciliation: {
    isReconciled: boolean;
    expectedCount: number;
    actualCount: number;
    expectedGross: number;
    actualGross: number;
    differenceGross: number;
    statusText: string;
  };
  periods: PeriodInfo[];
  selectedPeriod: string;
}

/**
 * Fetch all available statement periods sorted chronologically (newest first)
 */
export async function getAvailablePeriods(): Promise<PeriodInfo[]> {
  try {
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((p) => ({
        id: p.id,
        month_year: p.month_year,
        year: p.year,
        month: p.month,
        days_in_month: p.days_in_month,
        uploaded_at: p.uploaded_at,
        uploaded_by: p.uploaded_by,
        rows_count: p.rows_count || 0,
        gross_commission: p.gross_commission,
        bc_commission: p.bc_commission,
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch periods from DB, using defaults:', err);
  }

  // Fallback
  return [
    { month_year: 'AUGUST 2026', year: 2026, month: 8, days_in_month: 31, rows_count: 675 },
    { month_year: 'JULY 2026', year: 2026, month: 7, days_in_month: 31, rows_count: 675 },
  ];
}

/**
 * Fetch all records for a month or range from Supabase in batches of 1000
 */
export async function fetchAllMonthlyRecords(options: {
  months?: string[];
  user?: UserSession | null;
  state?: string;
  zone?: string;
  dist?: string;
  baseBranch?: string;
}): Promise<CommissionRecord[]> {
  const { months, user, state, zone, dist, baseBranch } = options;

  let allRows: any[] = [];
  let from = 0;
  const pageSize = 1000;

  try {
    while (true) {
      let query = supabase
        .from('monthly_records')
        .select('*')
        .order('agent_id')
        .range(from, from + pageSize - 1);

      // Month filter
      if (months && months.length === 1 && months[0] !== 'ALL') {
        query = query.eq('month_year', months[0]);
      } else if (months && months.length > 1) {
        query = query.in('month_year', months);
      }

      // User Access Control (Server-Enforced)
      if (user && user.role !== 'admin') {
        if (user.allowed_states && user.allowed_states.length > 0) {
          query = query.in('state_name', user.allowed_states);
        }
        if (user.allowed_zones && user.allowed_zones.length > 0) {
          query = query.in('zone_name', user.allowed_zones);
        }
      }

      // Explicit filters
      if (state) query = query.eq('state_name', state);
      if (zone) query = query.eq('zone_name', zone);
      if (dist) query = query.eq('dist', dist);
      if (baseBranch) query = query.eq('base_branch', baseBranch);

      const { data, error } = await query;
      if (error || !data || data.length === 0) break;

      allRows.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }
  } catch (e) {
    console.warn('DB fetch error, checking preloaded data:', e);
  }

  // If DB returned nothing or error, fallback to preloaded dataset
  if (allRows.length === 0) {
    let list = INITIAL_COMMISSION_RECORDS;
    if (months && months.length === 1 && months[0] !== 'ALL') {
      list = list.filter((r) => r.statementMonth === months[0]);
    } else if (months && months.length > 1) {
      list = list.filter((r) => months.includes(r.statementMonth));
    }
    return list;
  }

  return allRows.map(mapMonthlyRecordToCommission);
}

/**
 * Calculate Summary Metrics across any dataset of CommissionRecords
 */
export function calculateSummaryMetrics(records: CommissionRecord[]): SummaryMetrics {
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

  records.forEach((r) => {
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

  const totalTds = Number((totalBcComm * 0.02).toFixed(2));
  const totalNetPayable = Number((totalBcComm - totalTds).toFixed(2));
  const avgLoginPercentage = records.length > 0 ? Number((totalLoginPct / records.length).toFixed(2)) : 0;

  return {
    totalAgents: records.length,
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
    totalNetCommission: Number(totalNetComm.toFixed(2)),
    totalBcCommission: Number(totalBcComm.toFixed(2)),
    totalCorpCommission: Number(totalCorpComm.toFixed(2)),
    totalTdsDeduction: totalTds,
    totalNetPayable,
  };
}

/**
 * Filter records in-memory by search, attendance, state, district
 */
export function filterRecordsInMemory(
  records: CommissionRecord[],
  filters: {
    searchQuery?: string;
    state?: string;
    zone?: string;
    dist?: string;
    baseBranch?: string;
    activityFilter?: string;
  }
): CommissionRecord[] {
  return records.filter((r) => {
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

    if (filters.state && r.stateName !== filters.state) return false;
    if (filters.zone && r.zoneName !== filters.zone) return false;
    if (filters.dist && r.dist !== filters.dist) return false;
    if (filters.baseBranch && r.baseBranch !== filters.baseBranch) return false;

    if (filters.activityFilter === 'high' && r.loginPercentage < 90) return false;
    if (filters.activityFilter === 'medium' && (r.loginPercentage < 70 || r.loginPercentage >= 90)) return false;
    if (filters.activityFilter === 'low' && r.loginPercentage >= 70) return false;
    if (filters.activityFilter === 'attention' && r.loginDays >= 15) return false;

    return true;
  });
}
