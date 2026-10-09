if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = class DummyWebSocket {};
}

import { createClient } from '@supabase/supabase-js';
import { CommissionRecord } from '@/types/commission';
import { normalizeStateName, normalizeZoneName, normalizeDistName } from './normalization';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sesshjrjyscnnjufypdf.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc3NoanJqeXNjbm5qdWZ5cGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjI3NjMsImV4cCI6MjEwNTg5ODc2M30.KDI0q4mSTTBjQZZ6JsoIRZOGVzXoN827bPUk35TKklQ';

// Exclusively target the 'sanjivani' schema
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'sanjivani' },
  auth: { persistSession: false },
});

export function mapMonthlyRecordToCommission(r: any): CommissionRecord {
  const bcComm = Number(r.bc_comm ?? 0);
  const tdsDeduction = Number((bcComm * 0.02).toFixed(2));
  const netPayable = Number((bcComm - tdsDeduction).toFixed(2));

  return {
    id: `${r.agent_id}_${r.month_year || 'CURRENT'}`,
    statementMonth: r.month_year || 'AUGUST 2026',
    stateName: normalizeStateName(r.state_name),
    zoneName: normalizeZoneName(r.zone_name),
    dist: normalizeDistName(r.dist),
    mandal: r.mandal || '',
    baseBranch: r.base_branch || '',
    solId: r.sol_id || '',
    villageName: r.village_name || '',
    agentId: r.agent_id || '',
    bcaName: r.bca_name || '',
    agentIdBank: r.agent_id_cbs || r.agent_id_bank || '',
    settAccNo: r.sett_acc_no || '',
    dateOfJoining: r.date_of_joining || '',
    deviceId: r.device_id || '',
    companyName: r.company_name || 'SANJIVANI',
    locationType: r.location_type || 'RURAL',
    nonFundedNoOfAcctOpn: Number(r.non_funded_acct_opn ?? r.non_funded_no_of_acct_opn ?? 0),
    commNonFundedAcctOpn: Number(r.comm_non_funded_acct_opn ?? 0),
    fundedNoOfAcctOpn: Number(r.funded_acct_opn ?? r.funded_no_of_acct_opn ?? 0),
    commFundedAcctOpn: Number(r.comm_funded_acct_opn ?? 0),
    totalNoOfAcctOpn: Number(r.total_no_of_acct_opn ?? 0),
    commTotalAcctOpn: Number(r.comm_acct_opn ?? r.comm_total_acct_opn ?? 0),
    financialTxn: Number(r.financial_txn ?? 0),
    txnAmt: Number(r.txn_amt ?? 0),
    txnComm: Number(r.comm_txn ?? r.txn_comm ?? 0),
    remittanceCount: Number(r.remittance_count ?? 0),
    remittanceRs10: Number(r.remittance_amt ?? r.remittance_rs10 ?? 0),
    loginDays: Number(r.login_days ?? 0),
    loginPercentage: Number(r.login_percentage ?? 0),
    fixedCommission: Number(r.total_commission ?? r.fixed_commission ?? 0),
    apyCount: Number(r.apy_count ?? 0),
    apyComm: Number(r.apy_comm ?? 0),
    sbyCount: Number(r.sby_count ?? 0),
    sbyComm: Number(r.sby_comm ?? 0),
    jbyCount: Number(r.jby_count ?? 0),
    jbyComm: Number(r.jby_comm ?? 0),
    incentive10Sss: Number(r.total_incentive_sss ?? r.incentive_10_sss ?? 0),
    reKycCount: Number(r.re_kyc_count ?? 0),
    reKycComm: Number(r.re_kyc_comm ?? 0),
    netCommission: Number(r.net_commission ?? 0),
    bcComm: bcComm,
    corpComm: Number(r.corp_comm ?? 0),
    tdsDeduction: tdsDeduction,
    netPayable: netPayable,
    totalDaysInMonth: Number(r.days_in_month ?? 31),
  };
}

export function mapCommissionToMonthlyRecord(r: CommissionRecord): any {
  return {
    agent_id: r.agentId,
    month_year: r.statementMonth || 'AUGUST 2026',
    state_name: r.stateName,
    zone_name: r.zoneName,
    dist: r.dist,
    mandal: r.mandal,
    base_branch: r.baseBranch,
    sol_id: r.solId,
    village_name: r.villageName,
    bca_name: r.bcaName,
    agent_id_cbs: r.agentIdBank,
    date_of_joining: r.dateOfJoining,
    company_name: r.companyName || 'SANJIVANI',
    location_type: r.locationType || 'RURAL',
    device_id: r.deviceId,
    non_funded_acct_opn: r.nonFundedNoOfAcctOpn || 0,
    comm_non_funded_acct_opn: r.commNonFundedAcctOpn || 0,
    funded_acct_opn: r.fundedNoOfAcctOpn || 0,
    comm_funded_acct_opn: r.commFundedAcctOpn || 0,
    total_no_of_acct_opn: r.totalNoOfAcctOpn || 0,
    comm_acct_opn: r.commTotalAcctOpn || 0,
    financial_txn: r.financialTxn || 0,
    txn_amt: r.txnAmt || 0,
    comm_txn: r.txnComm || 0,
    remittance_count: r.remittanceCount || 0,
    remittance_amt: r.remittanceRs10 || 0,
    login_days: r.loginDays || 0,
    login_percentage: r.loginPercentage || 0,
    total_commission: r.fixedCommission || 0,
    apy_count: r.apyCount || 0,
    apy_comm: r.apyComm || 0,
    sby_count: r.sbyCount || 0,
    sby_comm: r.sbyComm || 0,
    jby_count: r.jbyCount || 0,
    jby_comm: r.jbyComm || 0,
    total_incentive_sss: r.incentive10Sss || 0,
    net_commission: r.netCommission || 0,
    bc_comm: r.bcComm || 0,
    corp_comm: r.corpComm || 0,
  };
}
