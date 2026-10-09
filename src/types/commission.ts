export interface CommissionRecord {
  id: string;
  // Location & Org
  stateName: string;
  zoneName: string;
  dist: string;
  mandal: string;
  baseBranch: string;
  solId: string;
  villageName: string;

  // Agent Details
  agentId: string;
  bcaName: string;
  agentIdBank: string;
  settAccNo?: string;
  dateOfJoining?: string;
  deviceId: string;
  companyName: string;
  locationType: string;

  // Account Opening
  nonFundedNoOfAcctOpn: number;
  commNonFundedAcctOpn: number;
  fundedNoOfAcctOpn: number;
  commFundedAcctOpn: number;
  totalNoOfAcctOpn: number;
  commTotalAcctOpn: number;

  // Financial Txns & Remittance
  financialTxn: number;
  txnAmt: number;
  txnComm: number;
  remittanceCount: number;
  remittanceRs10: number;

  // Attendance & Fixed
  loginDays: number;
  loginPercentage: number;
  fixedCommission: number;

  // Social Security Schemes (SSS)
  apyCount: number;
  apyComm: number;
  sbyCount: number;
  sbyComm: number;
  jbyCount: number;
  jbyComm: number;
  incentive10Sss: number;

  // Re-KYC
  reKycCount: number;
  reKycComm: number;

  // Final Net Commissions
  netCommission: number;
  bcComm: number;
  corpComm: number;
  tdsDeduction?: number;
  netPayable?: number;
  isZeroFilled?: boolean;

  // Month metadata
  statementMonth: string; // e.g. "AUGUST 2026"
  totalDaysInMonth: number;
}

export interface FilterState {
  searchQuery: string;
  state: string;
  zone: string;
  dist: string;
  baseBranch: string;
  monthFrom: string;
  monthTo: string;
  activityFilter: 'all' | 'high' | 'medium' | 'low' | 'attention'; // >=90%, 70-89%, <70%, <15 days
}

export interface SummaryMetrics {
  totalAgents: number;
  activeAgents: number;
  avgLoginPercentage: number;
  totalAccountsOpened: number;
  totalFundedAccounts: number;
  totalNonFundedAccounts: number;
  totalTxnCount: number;
  totalTxnVolume: number;
  totalTxnComm: number;
  totalApyCount: number;
  totalApyComm: number;
  totalSbyCount: number;
  totalSbyComm: number;
  totalJbyCount: number;
  totalJbyComm: number;
  totalSssIncentive: number;
  totalNetCommission: number;
  totalBcCommission: number;
  totalCorpCommission: number;
  totalTdsDeduction: number;
  totalNetPayable: number;
}

export interface HierarchyBreakdown {
  name: string;
  agentCount: number;
  totalAccounts: number;
  txnVolume: number;
  totalSssCount: number;
  avgLoginPercentage: number;
  totalBcCommission: number;
  totalNetCommission: number;
  totalTdsDeduction?: number;
  totalNetPayable?: number;
}

export interface UserSession {
  username: string;
  name: string;
  role: 'admin' | 'viewer';
  allowed_states: string[];
  allowed_zones: string[];
  lastLogin?: string;
}

export interface PeriodInfo {
  id?: number;
  month_year: string;
  year: number;
  month: number;
  days_in_month: number;
  uploaded_at?: string;
  uploaded_by?: string;
  rows_count?: number;
  gross_commission?: number;
  bc_commission?: number;
}

