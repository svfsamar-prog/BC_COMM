import ExcelJS from 'exceljs';
import { CommissionRecord } from '@/types/commission';
import { getOfficialLogoDataUrl } from './pdf/assets';

export async function exportMultiPeriodCommissionExcel(
  records: CommissionRecord[],
  fileName: string = 'Sanjivani_Commission_Export.xlsx',
  layout: 'month_wise' | 'cumulative' = 'month_wise'
) {
  const logoBase64 = await getOfficialLogoDataUrl();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sanjivani Vikas Foundation';
  workbook.lastModifiedBy = 'BC Commission Portal';
  workbook.created = new Date();

  // =========================================================================
  // TAB 1: COMMISSIONS & FINANCIAL MASTER (All commissions, TDS & Net Payable)
  // =========================================================================
  const commSheet = workbook.addWorksheet('Commissions Matrix', {
    views: [{ state: 'frozen', ySplit: 2 }],
  });

  // Prepare Rows depending on Layout
  let commRows: any[] = [];
  let sssRows: any[] = [];

  if (layout === 'cumulative') {
    // Group records by Agent ID across the selected period range
    const agentMap = new Map<string, {
      profile: CommissionRecord;
      monthsPresent: Set<string>;
      totalDays: number;
      loginDays: number;
      nonFundedNoOfAcctOpn: number;
      commNonFundedAcctOpn: number;
      fundedNoOfAcctOpn: number;
      commFundedAcctOpn: number;
      totalNoOfAcctOpn: number;
      commTotalAcctOpn: number;
      financialTxn: number;
      txnAmt: number;
      txnComm: number;
      remittanceCount: number;
      remittanceRs10: number;
      fixedCommission: number;
      apyCount: number;
      apyComm: number;
      sbyCount: number;
      sbyComm: number;
      jbyCount: number;
      jbyComm: number;
      incentive10Sss: number;
      reKycCount: number;
      reKycComm: number;
      netCommission: number;
      bcComm: number;
      corpComm: number;
    }>();

    records.forEach((r) => {
      const id = r.agentId;
      if (!agentMap.has(id)) {
        agentMap.set(id, {
          profile: r,
          monthsPresent: new Set([r.statementMonth]),
          totalDays: r.totalDaysInMonth || 30,
          loginDays: r.loginDays || 0,
          nonFundedNoOfAcctOpn: r.nonFundedNoOfAcctOpn || 0,
          commNonFundedAcctOpn: r.commNonFundedAcctOpn || 0,
          fundedNoOfAcctOpn: r.fundedNoOfAcctOpn || 0,
          commFundedAcctOpn: r.commFundedAcctOpn || 0,
          totalNoOfAcctOpn: r.totalNoOfAcctOpn || 0,
          commTotalAcctOpn: r.commTotalAcctOpn || 0,
          financialTxn: r.financialTxn || 0,
          txnAmt: r.txnAmt || 0,
          txnComm: r.txnComm || 0,
          remittanceCount: r.remittanceCount || 0,
          remittanceRs10: r.remittanceRs10 || 0,
          fixedCommission: r.fixedCommission || 0,
          apyCount: r.apyCount || 0,
          apyComm: r.apyComm || 0,
          sbyCount: r.sbyCount || 0,
          sbyComm: r.sbyComm || 0,
          jbyCount: r.jbyCount || 0,
          jbyComm: r.jbyComm || 0,
          incentive10Sss: r.incentive10Sss || 0,
          reKycCount: r.reKycCount || 0,
          reKycComm: r.reKycComm || 0,
          netCommission: r.netCommission || 0,
          bcComm: r.bcComm || 0,
          corpComm: r.corpComm || 0,
        });
      } else {
        const curr = agentMap.get(id)!;
        curr.monthsPresent.add(r.statementMonth);
        curr.totalDays += (r.totalDaysInMonth || 30);
        curr.loginDays += (r.loginDays || 0);
        curr.nonFundedNoOfAcctOpn += (r.nonFundedNoOfAcctOpn || 0);
        curr.commNonFundedAcctOpn += (r.commNonFundedAcctOpn || 0);
        curr.fundedNoOfAcctOpn += (r.fundedNoOfAcctOpn || 0);
        curr.commFundedAcctOpn += (r.commFundedAcctOpn || 0);
        curr.totalNoOfAcctOpn += (r.totalNoOfAcctOpn || 0);
        curr.commTotalAcctOpn += (r.commTotalAcctOpn || 0);
        curr.financialTxn += (r.financialTxn || 0);
        curr.txnAmt += (r.txnAmt || 0);
        curr.txnComm += (r.txnComm || 0);
        curr.remittanceCount += (r.remittanceCount || 0);
        curr.remittanceRs10 += (r.remittanceRs10 || 0);
        curr.fixedCommission += (r.fixedCommission || 0);
        curr.apyCount += (r.apyCount || 0);
        curr.apyComm += (r.apyComm || 0);
        curr.sbyCount += (r.sbyCount || 0);
        curr.sbyComm += (r.sbyComm || 0);
        curr.jbyCount += (r.jbyCount || 0);
        curr.jbyComm += (r.jbyComm || 0);
        curr.incentive10Sss += (r.incentive10Sss || 0);
        curr.reKycCount += (r.reKycCount || 0);
        curr.reKycComm += (r.reKycComm || 0);
        curr.netCommission += (r.netCommission || 0);
        curr.bcComm += (r.bcComm || 0);
        curr.corpComm += (r.corpComm || 0);
      }
    });

    agentMap.forEach((ag) => {
      const p = ag.profile;
      const loginPct = ag.totalDays > 0 ? (ag.loginDays / ag.totalDays) : 0;
      const tds = Number((ag.bcComm * 0.02).toFixed(2));
      const netPayable = Number((ag.bcComm - tds).toFixed(2));

      commRows.push([
        p.stateName,
        p.zoneName,
        p.dist,
        p.baseBranch,
        p.villageName,
        p.agentId,
        p.bcaName,
        p.deviceId,
        ag.monthsPresent.size, // Months with data
        ag.nonFundedNoOfAcctOpn,
        ag.commNonFundedAcctOpn,
        ag.fundedNoOfAcctOpn,
        ag.commFundedAcctOpn,
        ag.totalNoOfAcctOpn,
        ag.commTotalAcctOpn,
        ag.financialTxn,
        ag.txnAmt,
        ag.txnComm,
        ag.remittanceCount,
        ag.remittanceRs10,
        ag.loginDays,
        loginPct,
        ag.fixedCommission,
        ag.apyCount,
        ag.apyComm,
        ag.sbyCount,
        ag.sbyComm,
        ag.jbyCount,
        ag.jbyComm,
        ag.incentive10Sss,
        ag.reKycCount,
        ag.reKycComm,
        ag.netCommission,
        ag.bcComm,
        tds,
        netPayable,
        ag.corpComm,
      ]);

      sssRows.push([
        p.stateName,
        p.dist,
        p.baseBranch,
        p.agentId,
        p.bcaName,
        ag.monthsPresent.size,
        ag.apyCount,
        ag.apyComm,
        ag.sbyCount,
        ag.sbyComm,
        ag.jbyCount,
        ag.jbyComm,
        ag.incentive10Sss,
        ag.loginDays,
        loginPct,
      ]);
    });
  } else {
    // Month-wise layout (one row per agent per statement month)
    records.forEach((rec) => {
      const tds = rec.tdsDeduction ?? Number((rec.bcComm * 0.02).toFixed(2));
      const netPayable = rec.netPayable ?? Number((rec.bcComm - tds).toFixed(2));

      commRows.push([
        rec.statementMonth,
        rec.stateName,
        rec.zoneName,
        rec.dist,
        rec.baseBranch,
        rec.villageName,
        rec.agentId,
        rec.bcaName,
        rec.deviceId,
        rec.nonFundedNoOfAcctOpn,
        rec.commNonFundedAcctOpn,
        rec.fundedNoOfAcctOpn,
        rec.commFundedAcctOpn,
        rec.totalNoOfAcctOpn,
        rec.commTotalAcctOpn,
        rec.financialTxn,
        rec.txnAmt,
        rec.txnComm,
        rec.remittanceCount,
        rec.remittanceRs10,
        rec.loginDays,
        rec.loginPercentage / 100,
        rec.fixedCommission,
        rec.apyCount,
        rec.apyComm,
        rec.sbyCount,
        rec.sbyComm,
        rec.jbyCount,
        rec.jbyComm,
        rec.incentive10Sss,
        rec.reKycCount,
        rec.reKycComm,
        rec.netCommission,
        rec.bcComm,
        tds,
        netPayable,
        rec.corpComm,
      ]);

      sssRows.push([
        rec.statementMonth,
        rec.stateName,
        rec.dist,
        rec.baseBranch,
        rec.agentId,
        rec.bcaName,
        rec.apyCount,
        rec.apyComm,
        rec.sbyCount,
        rec.sbyComm,
        rec.jbyCount,
        rec.jbyComm,
        rec.incentive10Sss,
        rec.loginDays,
        rec.loginPercentage / 100,
      ]);
    });
  }

  // --- Render Tab 1 (Commissions Sheet) ---
  const commHeaders = layout === 'cumulative'
    ? [
        'STATE_NAME', 'ZONE_NAME', 'DIST', 'BASE_BRANCH', 'VILLAGE_NAME', 'AGENT ID', 'BCA_NAME', 'Device ID',
        'MONTHS_COUNT', 'NON_FUNDED_ACCTS', 'COMM_NON_FUNDED', 'FUNDED_ACCTS', 'COMM_FUNDED', 'TOTAL_ACCTS', 'COMM_TOTAL_ACCTS',
        'FINANCIAL_TXN', 'TXN_AMT', 'TXN_COMM', 'REMITTANCE_COUNT', 'REMITTANCE_COMM', 'LOGIN_DAYS', 'LOGIN_%',
        'FIXED_COMMISSION', 'APY_COUNT', 'APY_COMM', 'SBY_COUNT', 'SBY_COMM', 'JBY_COUNT', 'JBY_COMM', 'SSS_10%_INCENTIVE',
        'RE_KYC_COUNT', 'RE_KYC_COMM', 'GROSS_COMMISSION', 'BC_COMMISSION (80%)', 'TDS (2%)', 'NET_PAYABLE', 'CORP_COMM (20%)'
      ]
    : [
        'MONTH', 'STATE_NAME', 'ZONE_NAME', 'DIST', 'BASE_BRANCH', 'VILLAGE_NAME', 'AGENT ID', 'BCA_NAME', 'Device ID',
        'NON_FUNDED_ACCTS', 'COMM_NON_FUNDED', 'FUNDED_ACCTS', 'COMM_FUNDED', 'TOTAL_ACCTS', 'COMM_TOTAL_ACCTS',
        'FINANCIAL_TXN', 'TXN_AMT', 'TXN_COMM', 'REMITTANCE_COUNT', 'REMITTANCE_COMM', 'LOGIN_DAYS', 'LOGIN_%',
        'FIXED_COMMISSION', 'APY_COUNT', 'APY_COMM', 'SBY_COUNT', 'SBY_COMM', 'JBY_COUNT', 'JBY_COMM', 'SSS_10%_INCENTIVE',
        'RE_KYC_COUNT', 'RE_KYC_COMM', 'GROSS_COMMISSION', 'BC_COMMISSION (80%)', 'TDS (2%)', 'NET_PAYABLE', 'CORP_COMM (20%)'
      ];

  // Title Banner
  commSheet.mergeCells('A1:AK1');
  const titleCell = commSheet.getCell('A1');
  titleCell.value = `SANJIVANI VIKAS FOUNDATION - COMMISSION MASTER REGISTER (${layout === 'cumulative' ? 'CUMULATIVE RANGE' : 'MONTH-WISE'})`;
  titleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF004D25' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  commSheet.getRow(1).height = 36;

  // Header Row
  const headerRow = commSheet.getRow(2);
  headerRow.height = 26;
  commHeaders.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A5C36' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    commSheet.getColumn(idx + 1).width = 18;
  });

  // Data Rows
  commRows.forEach((rData, rIdx) => {
    const row = commSheet.addRow(rData);
    row.height = 20;
    const isEven = rIdx % 2 === 0;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      const val = cell.value;
      if (typeof val === 'number') {
        if (colNumber === (layout === 'cumulative' ? 22 : 22)) {
          cell.numFmt = '0.0%';
        } else if (colNumber >= (layout === 'cumulative' ? 10 : 10)) {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
      }
    });
  });

  // =========================================================================
  // TAB 2: SOCIAL SECURITY SCHEMES (APY, SBY, JBY, Login Days & Attendance %)
  // =========================================================================
  const sssSheet = workbook.addWorksheet('Social Schemes (SSS)', {
    views: [{ state: 'frozen', ySplit: 2 }],
  });

  const sssHeaders = layout === 'cumulative'
    ? ['STATE_NAME', 'DIST', 'BASE_BRANCH', 'AGENT ID', 'BCA_NAME', 'MONTHS_ACTIVE', 'APY_COUNT', 'APY_COMM', 'SBY_COUNT', 'SBY_COMM', 'JBY_COUNT', 'JBY_COMM', 'SSS_10%_INCENTIVE', 'TOTAL_LOGIN_DAYS', 'AVG_LOGIN_%']
    : ['MONTH', 'STATE_NAME', 'DIST', 'BASE_BRANCH', 'AGENT ID', 'BCA_NAME', 'APY_COUNT', 'APY_COMM', 'SBY_COUNT', 'SBY_COMM', 'JBY_COUNT', 'JBY_COMM', 'SSS_10%_INCENTIVE', 'LOGIN_DAYS', 'LOGIN_%'];

  sssSheet.mergeCells('A1:O1');
  const sssTitleCell = sssSheet.getCell('A1');
  sssTitleCell.value = `SANJIVANI VIKAS FOUNDATION - SOCIAL SECURITY SCHEMES (APY / PMSBY / PMJJBY)`;
  sssTitleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  sssTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
  sssTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sssSheet.getRow(1).height = 36;

  const sssHeaderRow = sssSheet.getRow(2);
  sssHeaderRow.height = 26;
  sssHeaders.forEach((h, idx) => {
    const cell = sssHeaderRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    sssSheet.getColumn(idx + 1).width = 18;
  });

  sssRows.forEach((rData, rIdx) => {
    const row = sssSheet.addRow(rData);
    row.height = 20;
    const isEven = rIdx % 2 === 0;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF0F172A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      if (colNumber === sssHeaders.length) {
        cell.numFmt = '0.0%';
      } else if (typeof cell.value === 'number') {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });
  });

  // Download directly in browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export const exportFilteredCommissionExcel = (records: CommissionRecord[], fileName?: string) => {
  return exportMultiPeriodCommissionExcel(records, fileName, 'month_wise');
};
