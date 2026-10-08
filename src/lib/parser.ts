import * as XLSX from 'xlsx';
import { CommissionRecord } from '@/types/commission';

function cleanNum(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function cleanStr(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

export function parseCommissionWorkbook(
  dataBuffer: ArrayBuffer,
  fileName: string = 'SANJIVANI COMMISSION',
  selectedMonth?: string,
  selectedYear?: number
): CommissionRecord[] {
  const workbook = XLSX.read(dataBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert worksheet to raw array of rows
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (!rawRows || rawRows.length < 2) return [];

  // Determine days in month from selection or filename
  let statementMonth = 'AUGUST 2026';
  let totalDays = 31;

  if (selectedMonth && selectedYear) {
    statementMonth = `${selectedMonth.toUpperCase()} ${selectedYear}`;
    const monthIndex = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ].indexOf(selectedMonth.toUpperCase());
    if (monthIndex !== -1) {
      totalDays = new Date(selectedYear, monthIndex + 1, 0).getDate();
    }
  } else {
    const isAug = /aug/i.test(fileName);
    totalDays = isAug ? 31 : 30;
    statementMonth = isAug ? 'AUGUST 2026' : 'CURRENT MONTH';
  }

  const records: CommissionRecord[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0 || !row[0]) continue;

    // Direct positional mapping from standard Sanjivani Sheet format
    // 0: STATE_NAME, 1: ZONE_NAME, 2: DIST, 3: Mandal, 4: BASE_BRANCH, 5: SOL_ID, 6: VILLAGE_NAME,
    // 7: AGENT ID, 8: BCA_NAME, 9: AGENT ID BANK, 10: SETT_ACCNO, 11: DATE OF JOINING, 12: Device ID,
    // 13: Company Name, 14: Location Type, 15: NON FUNDED_NO_OF_ACCT_OPN, 16: COMM_ACCT_OPN,
    // 17: FUNDED_NO_OF_ACCT_OPN, 18: COMM_ACCT_OPN, 19: TOTAL_NO_OF_ACCT_OPN, 20: COMM_ACCT_OPN,
    // 21: FINANCIAL_TXN, 22: TXN_AMT, 23: TXN_COMM, 24: Remmittance count, 25: remmittance/Rs10,
    // 26: Login days, 27: fixd commission, 28: APY COUNT, 29: APY COMM, 30: SBY COUNT, 31: SBY COMM,
    // 32: JBY COUNT, 33: JBY COMM, 34: 10 % INCENTIVE for SSS, 35: Re-KYC Count, 36: Re-KYC Comm,
    // 37: NET COMMISSION, 38: BC_COMM, 39: CORP_COMM

    const loginDays = cleanNum(row[26]);
    const loginPercentage = totalDays > 0 ? (loginDays / totalDays) * 100 : 0;

    const record: CommissionRecord = {
      id: `${cleanStr(row[7]) || r}_${statementMonth}`,
      stateName: cleanStr(row[0]),
      zoneName: cleanStr(row[1]),
      dist: cleanStr(row[2]),
      mandal: cleanStr(row[3]),
      baseBranch: cleanStr(row[4]),
      solId: cleanStr(row[5]),
      villageName: cleanStr(row[6]),
      agentId: cleanStr(row[7]),
      bcaName: cleanStr(row[8]),
      agentIdBank: cleanStr(row[9]),
      settAccNo: cleanStr(row[10]),
      dateOfJoining: cleanStr(row[11]),
      deviceId: cleanStr(row[12]),
      companyName: cleanStr(row[13]) || 'SANJIVANI',
      locationType: cleanStr(row[14]) || 'RURAL',

      nonFundedNoOfAcctOpn: cleanNum(row[15]),
      commNonFundedAcctOpn: cleanNum(row[16]),
      fundedNoOfAcctOpn: cleanNum(row[17]),
      commFundedAcctOpn: cleanNum(row[18]),
      totalNoOfAcctOpn: cleanNum(row[19]),
      commTotalAcctOpn: cleanNum(row[20]),

      financialTxn: cleanNum(row[21]),
      txnAmt: cleanNum(row[22]),
      txnComm: cleanNum(row[23]),
      remittanceCount: cleanNum(row[24]),
      remittanceRs10: cleanNum(row[25]),

      loginDays: loginDays,
      loginPercentage: Number(loginPercentage.toFixed(2)),
      fixedCommission: cleanNum(row[27]),

      apyCount: cleanNum(row[28]),
      apyComm: cleanNum(row[29]),
      sbyCount: cleanNum(row[30]),
      sbyComm: cleanNum(row[31]),
      jbyCount: cleanNum(row[32]),
      jbyComm: cleanNum(row[33]),
      incentive10Sss: cleanNum(row[34]),

      reKycCount: cleanNum(row[35]),
      reKycComm: cleanNum(row[36]),

      netCommission: cleanNum(row[37]),
      bcComm: cleanNum(row[38]),
      corpComm: cleanNum(row[39]),

      statementMonth: statementMonth,
      totalDaysInMonth: totalDays,
    };

    records.push(record);
  }

  return records;
}
