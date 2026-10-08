import ExcelJS from 'exceljs';
import { CommissionRecord } from '@/types/commission';

export async function exportFilteredCommissionExcel(
  records: CommissionRecord[],
  fileName: string = 'Sanjivani_Commission_Export.xlsx'
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sanjivani Vikas Foundation';
  workbook.lastModifiedBy = 'BC Commission Portal';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Commission Summary', {
    views: [{ state: 'frozen', ySplit: 2 }],
  });

  // Define exact 33 required columns
  const columns = [
    { header: 'STATE_NAME', key: 'stateName', width: 16 },
    { header: 'ZONE_NAME', key: 'zoneName', width: 16 },
    { header: 'DIST', key: 'dist', width: 16 },
    { header: 'BASE_BRANCH', key: 'baseBranch', width: 20 },
    { header: 'VILLAGE_NAME', key: 'villageName', width: 22 },
    { header: 'AGENT ID', key: 'agentId', width: 14 },
    { header: 'BCA_NAME', key: 'bcaName', width: 24 },
    { header: 'Device ID', key: 'deviceId', width: 16 },
    { header: 'NON FUNDED_NO_OF_ACCT_OPN', key: 'nonFundedNoOfAcctOpn', width: 18 },
    { header: 'COMM_ACCT_OPN (Non Funded)', key: 'commNonFundedAcctOpn', width: 18 },
    { header: 'FUNDED_NO_OF_ACCT_OPN', key: 'fundedNoOfAcctOpn', width: 18 },
    { header: 'COMM_ACCT_OPN (Funded)', key: 'commFundedAcctOpn', width: 18 },
    { header: 'TOTAL_NO_OF_ACCT_OPN', key: 'totalNoOfAcctOpn', width: 18 },
    { header: 'COMM_ACCT_OPN (Total)', key: 'commTotalAcctOpn', width: 18 },
    { header: 'FINANCIAL_TXN', key: 'financialTxn', width: 16 },
    { header: 'TXN_AMT', key: 'txnAmt', width: 18 },
    { header: 'TXN_COMM', key: 'txnComm', width: 16 },
    { header: 'Remmittance count', key: 'remittanceCount', width: 18 },
    { header: 'remmittance/Rs10', key: 'remittanceRs10', width: 16 },
    { header: 'Login days', key: 'loginDays', width: 14 },
    { header: 'Login %', key: 'loginPercentage', width: 14 },
    { header: 'fixd commission', key: 'fixedCommission', width: 16 },
    { header: 'APY COUNT', key: 'apyCount', width: 14 },
    { header: 'APY COMM', key: 'apyComm', width: 16 },
    { header: 'SBY COUNT', key: 'sbyCount', width: 14 },
    { header: 'SBY COMM', key: 'sbyComm', width: 16 },
    { header: 'JBY COUNT', key: 'jbyCount', width: 14 },
    { header: 'JBY COMM', key: 'jbyComm', width: 16 },
    { header: '10 % INCENTIVE for SSS', key: 'incentive10Sss', width: 18 },
    { header: 'Re-KYC Count', key: 'reKycCount', width: 14 },
    { header: 'Re-KYC Comm', key: 'reKycComm', width: 16 },
    { header: 'NET COMMISSION', key: 'netCommission', width: 18 },
    { header: 'BC_COMM', key: 'bcComm', width: 18 },
    { header: 'CORP_COMM', key: 'corpComm', width: 18 },
  ];

  // Title Banner
  worksheet.mergeCells('A1:AH1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `SANJIVANI VIKAS FOUNDATION — BUSINESS CORRESPONDENT COMMISSION REPORT (${records.length} BCAs)`;
  titleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' }, // Deep Navy
  };
  titleCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  worksheet.getRow(1).height = 28;

  // Header Row (Row 2)
  const headerRow = worksheet.getRow(2);
  headerRow.height = 26;
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate Navy
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      right: { style: 'thin', color: { argb: 'FF334155' } },
    };
    worksheet.getColumn(idx + 1).width = col.width;
  });

  // Populate Data Rows
  records.forEach((rec, rIdx) => {
    const row = worksheet.addRow([
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
      rec.corpComm,
    ]);

    row.height = 20;
    const isEven = rIdx % 2 === 0;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF0F172A' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      // Alignment & number formatting
      if (colNumber <= 8) {
        cell.alignment = { horizontal: colNumber === 6 ? 'center' : 'left', vertical: 'middle' };
      } else if (colNumber === 21) {
        // Login %
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '0.0%';
      } else if ([16, 17, 19, 22, 24, 26, 28, 29, 31, 32, 33, 34].includes(colNumber)) {
        // Currency amounts
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '₹#,##0.00';
      } else {
        // Counts / numeric
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
      }
    });
  });

  // Add Summary Total Row at the end
  const totalRowNumber = records.length + 3;
  const totalRow = worksheet.addRow([
    'TOTAL',
    '',
    '',
    '',
    '',
    '',
    `${records.length} Agents`,
    '',
    { formula: `SUM(I3:I${totalRowNumber - 1})` },
    { formula: `SUM(J3:J${totalRowNumber - 1})` },
    { formula: `SUM(K3:K${totalRowNumber - 1})` },
    { formula: `SUM(L3:L${totalRowNumber - 1})` },
    { formula: `SUM(M3:M${totalRowNumber - 1})` },
    { formula: `SUM(N3:N${totalRowNumber - 1})` },
    { formula: `SUM(O3:O${totalRowNumber - 1})` },
    { formula: `SUM(P3:P${totalRowNumber - 1})` },
    { formula: `SUM(Q3:Q${totalRowNumber - 1})` },
    { formula: `SUM(R3:R${totalRowNumber - 1})` },
    { formula: `SUM(S3:S${totalRowNumber - 1})` },
    { formula: `AVERAGE(T3:T${totalRowNumber - 1})` },
    { formula: `AVERAGE(U3:U${totalRowNumber - 1})` },
    { formula: `SUM(V3:V${totalRowNumber - 1})` },
    { formula: `SUM(W3:W${totalRowNumber - 1})` },
    { formula: `SUM(X3:X${totalRowNumber - 1})` },
    { formula: `SUM(Y3:Y${totalRowNumber - 1})` },
    { formula: `SUM(Z3:Z${totalRowNumber - 1})` },
    { formula: `SUM(AA3:AA${totalRowNumber - 1})` },
    { formula: `SUM(AB3:AB${totalRowNumber - 1})` },
    { formula: `SUM(AC3:AC${totalRowNumber - 1})` },
    { formula: `SUM(AD3:AD${totalRowNumber - 1})` },
    { formula: `SUM(AE3:AE${totalRowNumber - 1})` },
    { formula: `SUM(AF3:AF${totalRowNumber - 1})` },
    { formula: `SUM(AG3:AG${totalRowNumber - 1})` },
    { formula: `SUM(AH3:AH${totalRowNumber - 1})` },
  ]);

  totalRow.height = 24;
  totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' }, // Navy Footer
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF334155' } },
      bottom: { style: 'double', color: { argb: 'FFFFFFFF' } },
    };
    if (colNumber === 21) {
      cell.numFmt = '0.0%';
    } else if ([16, 17, 19, 22, 24, 26, 28, 29, 31, 32, 33, 34].includes(colNumber)) {
      cell.numFmt = '₹#,##0.00';
    } else if (colNumber > 8) {
      cell.numFmt = '#,##0';
    }
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

export async function exportSingleAgentExcel(record: CommissionRecord) {
  return exportFilteredCommissionExcel([record], `BCA_Commission_${record.agentId}_${record.bcaName.replace(/\s+/g, '_')}.xlsx`);
}
