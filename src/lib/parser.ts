import * as XLSX from 'xlsx';
import { CommissionRecord } from '@/types/commission';
import { normalizeStateName, normalizeZoneName, normalizeDistName, getDaysInMonth, parseMonthYearString } from './normalization';

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
  selectedMonth: string = 'AUGUST',
  selectedYear: number = 2026,
  selectedDays?: number
): CommissionRecord[] {
  const workbook = XLSX.read(dataBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert worksheet to raw array of rows
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (!rawRows || rawRows.length < 2) return [];

  const targetMonthStr = `${selectedMonth.toUpperCase()} ${selectedYear}`;
  const parsedMeta = parseMonthYearString(targetMonthStr);
  const totalDays = selectedDays || getDaysInMonth(selectedYear, parsedMeta.month);

  const records: CommissionRecord[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0 || !row[0]) continue;

    const agentId = cleanStr(row[7]);
    if (!agentId) continue;

    const loginDays = cleanNum(row[26]);
    const loginPercentage = totalDays > 0 ? (loginDays / totalDays) * 100 : 0;
    const bcComm = cleanNum(row[38]);
    const tdsDeduction = Number((bcComm * 0.02).toFixed(2));
    const netPayable = Number((bcComm - tdsDeduction).toFixed(2));

    const record: CommissionRecord = {
      id: `${agentId}_${targetMonthStr}`,
      stateName: normalizeStateName(cleanStr(row[0])),
      zoneName: normalizeZoneName(cleanStr(row[1])),
      dist: normalizeDistName(cleanStr(row[2])),
      mandal: cleanStr(row[3]),
      baseBranch: cleanStr(row[4]),
      solId: cleanStr(row[5]),
      villageName: cleanStr(row[6]),
      agentId: agentId,
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
      bcComm: bcComm,
      corpComm: cleanNum(row[39]),
      tdsDeduction: tdsDeduction,
      netPayable: netPayable,

      statementMonth: targetMonthStr,
      totalDaysInMonth: totalDays,
    };

    records.push(record);
  }

  return records;
}
