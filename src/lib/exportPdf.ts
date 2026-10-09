/**
 * BC_COMM — Enterprise PDF Export Engines
 * 1. Summary Report (Landscape A4, 9-column register, grouped subtotals, TDS totals)
 * 2. Payout List (Portrait A4, disbursement register with signatures, 2% TDS and net payable)
 * 3. Commission Voucher (Single & Bulk Portrait A4, 3 explicit lines: BC comm, 2% TDS, Net payable, QR code)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommissionRecord } from '@/types/commission';
import { PDF_COLORS, getOfficialLogoDataUrl } from './pdf/assets';
import { applyStandardPageFrame } from './pdf/frame';
import {
  formatInrPdf,
  formatCompactInrPdf,
  numberToWordsInr,
  getStatementMonthCode,
  roundRupees,
} from './pdf/format';
import { generateVerificationQrDataUrl } from './pdf/qr';

export const TDS_RATE = 0.02; // Configurable TDS rate setting

// ==============================================================================
// 1. SUMMARY REPORT (Landscape A4)
// ==============================================================================
export async function generateSummaryReportPdf(
  records: CommissionRecord[],
  scopeTitle: string = 'All Districts'
) {
  const logoDataUrl = await getOfficialLogoDataUrl();

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~297 mm
  const margin = 12;
  const usableWidth = pageWidth - margin * 2;
  const statementMonth = records[0]?.statementMonth || 'AUGUST 2026';

  // Calculate Exact Totals First
  let grandGross = 0;
  let grandBc = 0;
  let grandCorp = 0;
  let grandTds = 0;
  let grandNetPayable = 0;
  let grandAccounts = 0;
  let grandTxns = 0;
  let grandTxnVol = 0;
  let grandSss = 0;

  // Group by State and District
  const stateMap = new Map<string, Map<string, CommissionRecord[]>>();

  records.forEach((r) => {
    const gross = Number(r.netCommission || 0);
    const bc = Number(r.bcComm || 0);
    const corp = Number(r.corpComm || 0);
    const tds = r.tdsDeduction ?? Number((bc * TDS_RATE).toFixed(2));
    const net = r.netPayable ?? Number((bc - tds).toFixed(2));

    grandGross += gross;
    grandBc += bc;
    grandCorp += corp;
    grandTds += tds;
    grandNetPayable += net;

    grandAccounts += r.totalNoOfAcctOpn || 0;
    grandTxns += r.financialTxn || 0;
    grandTxnVol += r.txnAmt || 0;
    const sss = (r.apyCount || 0) + (r.sbyCount || 0) + (r.jbyCount || 0);
    grandSss += sss;

    const st = r.stateName || 'OTHER';
    const dt = r.dist || 'OTHER';

    if (!stateMap.has(st)) stateMap.set(st, new Map());
    const dtMap = stateMap.get(st)!;
    if (!dtMap.has(dt)) dtMap.set(dt, []);
    dtMap.get(dt)!.push(r);
  });

  // ==================== PAGE 1: EXECUTIVE SUMMARY ====================
  let startY = 26;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text(`Scope: ${records.length} BCAs  |  ${scopeTitle}  |  Statement Month: ${statementMonth}`, margin, startY);

  startY += 5;

  // 4 Headline Metric Cards (with TDS & Net Payable)
  const cardWidth = (usableWidth - 9) / 4;
  const cardHeight = 22;

  // Card 1: Gross Commission
  doc.setFillColor(...PDF_COLORS.surface);
  doc.setDrawColor(...PDF_COLORS.border);
  doc.roundedRect(margin, startY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('GROSS COMMISSION', margin + 3, startY + 5.5);
  doc.setFontSize(12);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text(formatInrPdf(grandGross), margin + 3, startY + 13.5);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exact: Rs. ${grandGross.toFixed(2)}`, margin + 3, startY + 19);

  // Card 2: BCA Share (80%)
  const card2X = margin + cardWidth + 3;
  doc.setFillColor(...PDF_COLORS.surface);
  doc.setDrawColor(...PDF_COLORS.border);
  doc.roundedRect(card2X, startY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('BCA COMMISSION (80%)', card2X + 3, startY + 5.5);
  doc.setFontSize(12);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text(formatInrPdf(grandBc), card2X + 3, startY + 13.5);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${records.length} Active BCAs`, card2X + 3, startY + 19);

  // Card 3: TDS (2%)
  const card3X = margin + (cardWidth + 3) * 2;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(card3X, startY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(185, 28, 28);
  doc.text('TDS DEDUCTION (2%)', card3X + 3, startY + 5.5);
  doc.setFontSize(12);
  doc.text(formatInrPdf(grandTds), card3X + 3, startY + 13.5);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Calculated on BCA share', card3X + 3, startY + 19);

  // Card 4: Net Payable
  const card4X = margin + (cardWidth + 3) * 3;
  doc.setFillColor(...PDF_COLORS.successBg);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(card4X, startY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.green);
  doc.text('NET PAYABLE TO BCAs', card4X + 3, startY + 5.5);
  doc.setFontSize(12);
  doc.text(formatInrPdf(grandNetPayable), card4X + 3, startY + 13.5);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('After 2% statutory TDS', card4X + 3, startY + 19);

  startY += cardHeight + 7;

  // State Breakdown Mini-Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text('State-Wise Performance Aggregation', margin, startY);

  startY += 3;

  const stateRows: any[][] = [];
  Array.from(stateMap.keys()).sort().forEach((st) => {
    const dtMap = stateMap.get(st)!;
    let stBca = 0, stAcc = 0, stTxn = 0, stVol = 0, stGross = 0, stBc = 0, stTds = 0, stNet = 0;
    dtMap.forEach((bcaList) => {
      stBca += bcaList.length;
      bcaList.forEach((r) => {
        const bc = Number(r.bcComm || 0);
        const tds = r.tdsDeduction ?? Number((bc * TDS_RATE).toFixed(2));
        stAcc += r.totalNoOfAcctOpn || 0;
        stTxn += r.financialTxn || 0;
        stVol += r.txnAmt || 0;
        stGross += r.netCommission || 0;
        stBc += bc;
        stTds += tds;
        stNet += (bc - tds);
      });
    });

    stateRows.push([
      st,
      stBca.toLocaleString('en-IN'),
      stAcc.toLocaleString('en-IN'),
      stTxn.toLocaleString('en-IN'),
      formatCompactInrPdf(stVol),
      formatInrPdf(stGross),
      formatInrPdf(stBc),
      formatInrPdf(stTds),
      formatInrPdf(stNet),
    ]);
  });

  autoTable(doc, {
    startY,
    head: [['State Name', 'BCAs', 'Accounts', 'Txns', 'Volume', 'Gross Comm.', 'BCA Share (80%)', 'TDS (2%)', 'Net Payable']],
    body: stateRows,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_COLORS.navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: PDF_COLORS.border,
      lineWidth: 0.2,
      textColor: PDF_COLORS.textPrimary,
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right', textColor: [185, 28, 28] },
      8: { halign: 'right', fontStyle: 'bold', textColor: PDF_COLORS.green },
    },
    margin: { left: margin, right: margin },
  });

  // ==================== PAGES 2+: 10-COLUMN REGISTER TABLE ====================
  doc.addPage();

  const registerRows: any[][] = [];

  Array.from(stateMap.keys()).sort().forEach((st) => {
    const dtMap = stateMap.get(st)!;

    Array.from(dtMap.keys()).sort().forEach((dt) => {
      const bcaList = dtMap.get(dt)!;
      bcaList.sort((a, b) => (b.bcComm || 0) - (a.bcComm || 0));

      let dtAcc = 0, dtTxn = 0, dtGross = 0, dtBc = 0, dtTds = 0, dtNet = 0;

      bcaList.forEach((r) => {
        const bc = Number(r.bcComm || 0);
        const tds = r.tdsDeduction ?? Number((bc * TDS_RATE).toFixed(2));
        const net = r.netPayable ?? Number((bc - tds).toFixed(2));

        dtAcc += r.totalNoOfAcctOpn || 0;
        dtTxn += r.financialTxn || 0;
        dtGross += r.netCommission || 0;
        dtBc += bc;
        dtTds += tds;
        dtNet += net;

        registerRows.push([
          r.agentId,
          r.bcaName,
          r.baseBranch,
          r.dist,
          (r.totalNoOfAcctOpn || 0).toLocaleString('en-IN'),
          (r.financialTxn || 0).toLocaleString('en-IN'),
          formatInrPdf(r.netCommission || 0),
          formatInrPdf(bc),
          formatInrPdf(tds),
          formatInrPdf(net),
        ]);
      });

      // District Subtotal Row
      registerRows.push([
        {
          content: `Subtotal for ${dt}, ${st} (${bcaList.length} BCAs)`,
          colSpan: 4,
          styles: { fontStyle: 'bold', fillColor: PDF_COLORS.surface, textColor: PDF_COLORS.navy },
        },
        { content: dtAcc.toLocaleString('en-IN'), styles: { fontStyle: 'bold', halign: 'right', fillColor: PDF_COLORS.surface } },
        { content: dtTxn.toLocaleString('en-IN'), styles: { fontStyle: 'bold', halign: 'right', fillColor: PDF_COLORS.surface } },
        { content: formatInrPdf(dtGross), styles: { fontStyle: 'bold', halign: 'right', fillColor: PDF_COLORS.surface } },
        { content: formatInrPdf(dtBc), styles: { fontStyle: 'bold', halign: 'right', fillColor: PDF_COLORS.surface } },
        { content: formatInrPdf(dtTds), styles: { fontStyle: 'bold', halign: 'right', fillColor: PDF_COLORS.surface, textColor: [185, 28, 28] } },
        { content: formatInrPdf(dtNet), styles: { fontStyle: 'bold', halign: 'right', fillColor: PDF_COLORS.surface, textColor: PDF_COLORS.green } },
      ]);
    });
  });

  // Grand Total Row
  registerRows.push([
    {
      content: `GRAND TOTAL (${records.length} BCAs)`,
      colSpan: 4,
      styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: PDF_COLORS.navy, fontSize: 8 },
    },
    { content: grandAccounts.toLocaleString('en-IN'), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
    { content: grandTxns.toLocaleString('en-IN'), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
    { content: formatInrPdf(grandGross), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
    { content: formatInrPdf(grandBc), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
    { content: formatInrPdf(grandTds), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249], textColor: [185, 28, 28] } },
    { content: formatInrPdf(grandNetPayable), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249], textColor: PDF_COLORS.green, fontSize: 8 } },
  ]);

  autoTable(doc, {
    startY: 24,
    head: [['Agent ID', 'BCA Name', 'Branch', 'District', 'Accounts', 'Txns', 'Gross Comm.', 'BCA Share', 'TDS (2%)', 'Net Payable']],
    body: registerRows,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_COLORS.navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'left',
    },
    styles: {
      fontSize: 6.8,
      cellPadding: 1.4,
      lineColor: PDF_COLORS.border,
      lineWidth: 0.15,
      textColor: PDF_COLORS.textPrimary,
    },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 44 },
      2: { cellWidth: 38 },
      3: { cellWidth: 30 },
      4: { cellWidth: 16, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 28, halign: 'right' },
      7: { cellWidth: 28, halign: 'right' },
      8: { cellWidth: 22, halign: 'right', textColor: [185, 28, 28] },
      9: { cellWidth: 29, halign: 'right', fontStyle: 'bold', textColor: PDF_COLORS.green },
    },
    margin: { left: margin, right: margin, top: 24, bottom: 16 },
  });

  applyStandardPageFrame(doc, {
    title: 'COMMISSION SUMMARY & REGIONAL REPORT',
    statementMonth,
    logoDataUrl,
  });

  doc.save(`Sanjivani_Summary_Report_${scopeTitle.replace(/\s+/g, '_')}.pdf`);
}

// ==============================================================================
// 2. PAYOUT LIST (Portrait A4 with 2% TDS and Net Payable)
// ==============================================================================
export async function generatePayoutListPdf(
  records: CommissionRecord[],
  scopeTitle: string = 'All Districts'
) {
  const logoDataUrl = await getOfficialLogoDataUrl();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  const statementMonth = records[0]?.statementMonth || 'AUGUST 2026';

  const districtMap = new Map<string, CommissionRecord[]>();
  let totalGrossBc = 0;
  let totalTds = 0;
  let totalNetPayable = 0;

  records.forEach((r) => {
    const dt = r.dist || 'OTHER';
    if (!districtMap.has(dt)) districtMap.set(dt, []);
    districtMap.get(dt)!.push(r);

    const bc = Number(r.bcComm || 0);
    const tds = r.tdsDeduction ?? Number((bc * TDS_RATE).toFixed(2));
    const net = r.netPayable ?? Number((bc - tds).toFixed(2));

    totalGrossBc += bc;
    totalTds += tds;
    totalNetPayable += net;
  });

  const tableRows: any[][] = [];
  let serial = 1;

  Array.from(districtMap.keys()).sort().forEach((dt) => {
    const bcaList = districtMap.get(dt)!;
    bcaList.sort((a, b) => (b.bcComm || 0) - (a.bcComm || 0));

    let dtNet = 0;

    bcaList.forEach((r) => {
      const bc = Number(r.bcComm || 0);
      const tds = r.tdsDeduction ?? Number((bc * TDS_RATE).toFixed(2));
      const net = r.netPayable ?? Number((bc - tds).toFixed(2));
      dtNet += net;

      tableRows.push([
        serial++,
        r.bcaName,
        r.agentId,
        `${r.baseBranch}\n(${dt})`,
        formatInrPdf(bc),
        formatInrPdf(tds),
        formatInrPdf(net),
        '', // Signature blank column
      ]);
    });

    // District Subtotal
    tableRows.push([
      {
        content: `Subtotal District ${dt} (${bcaList.length} BCAs)`,
        colSpan: 4,
        styles: { fontStyle: 'bold', fillColor: PDF_COLORS.surface, textColor: PDF_COLORS.navy },
      },
      { content: '', styles: { fillColor: PDF_COLORS.surface } },
      { content: '', styles: { fillColor: PDF_COLORS.surface } },
      {
        content: formatInrPdf(dtNet),
        styles: { fontStyle: 'bold', halign: 'right', fillColor: PDF_COLORS.surface, textColor: PDF_COLORS.green },
      },
      { content: '', styles: { fillColor: PDF_COLORS.surface } },
    ]);
  });

  // Grand Total
  tableRows.push([
    {
      content: `TOTAL DISBURSEMENT (${records.length} BCAs)`,
      colSpan: 4,
      styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: PDF_COLORS.navy, fontSize: 8 },
    },
    { content: formatInrPdf(totalGrossBc), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
    { content: formatInrPdf(totalTds), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249], textColor: [185, 28, 28] } },
    {
      content: formatInrPdf(totalNetPayable),
      styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249], textColor: PDF_COLORS.green, fontSize: 8.5 },
    },
    { content: '', styles: { fillColor: [241, 245, 249] } },
  ]);

  autoTable(doc, {
    startY: 24,
    head: [['#', 'BCA Name', 'Agent ID', 'Branch / SOL', 'BCA Comm.', 'TDS (2%)', 'Net Payable', 'Signature / Ref']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_COLORS.navy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      lineColor: PDF_COLORS.border,
      lineWidth: 0.15,
      textColor: PDF_COLORS.textPrimary,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 42 },
      2: { cellWidth: 24 },
      3: { cellWidth: 32 },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 18, halign: 'right', textColor: [185, 28, 28] },
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: PDF_COLORS.green },
      7: { cellWidth: 18 },
    },
    margin: { left: margin, right: margin, top: 24, bottom: 38 },
  });

  // Approval Block
  const pageH = doc.internal.pageSize.getHeight();
  const wordsText = `Total Net Payable in Words: ${numberToWordsInr(Math.round(totalNetPayable))}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text(wordsText, margin, pageH - 30);

  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, pageH - 25, pageWidth - margin, pageH - 25);

  const colW = (pageWidth - margin * 2) / 3;
  const sigY = pageH - 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.textSecondary);

  doc.text('Prepared By: ____________________', margin, sigY);
  doc.text('Checked By: ____________________', margin + colW, sigY);
  doc.text('Approved By: ____________________', margin + colW * 2, sigY);

  applyStandardPageFrame(doc, {
    title: 'BCA DISBURSEMENT & SIGNATURE REGISTER',
    statementMonth,
    logoDataUrl,
  });

  doc.save(`Sanjivani_Payout_List_${scopeTitle.replace(/\s+/g, '_')}.pdf`);
}

// ==============================================================================
// 3. COMMISSION DISBURSEMENT VOUCHER (Single & Bulk Portrait A4 with 3 explicit lines)
// ==============================================================================
export async function generateAgentCommissionVoucherPdf(
  record: CommissionRecord,
  options?: { returnDoc?: boolean; existingDoc?: jsPDF; logoDataUrl?: string | null }
) {
  const logoDataUrl = options?.logoDataUrl || (await getOfficialLogoDataUrl());

  const doc = options?.existingDoc || new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const usableWidth = pageWidth - margin * 2;
  const statementMonth = record.statementMonth || 'AUGUST 2026';
  const monthCode = getStatementMonthCode(statementMonth);
  const voucherNo = `SVF/${monthCode}/${record.agentId}`;

  const bcComm = Number(record.bcComm || 0);
  const tdsDeduction = record.tdsDeduction ?? Number((bcComm * TDS_RATE).toFixed(2));
  const netPayable = record.netPayable ?? Number((bcComm - tdsDeduction).toFixed(2));

  let verifyUrl = `https://bc-comm.vercel.app/verify/${encodeURIComponent(voucherNo)}`;
  let shortCode = 'VERIFIED';

  try {
    const res = await fetch('/api/vouchers/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: record.agentId,
        bcaName: record.bcaName,
        villageName: record.villageName,
        statementMonth,
        grossCommission: record.netCommission,
        bcComm: record.bcComm,
        corpComm: record.corpComm,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.vouchers && data.vouchers[0]) {
        verifyUrl = data.vouchers[0].verifyUrl;
        shortCode = data.vouchers[0].shortCode;
      }
    }
  } catch (e) {
    // Offline fallback
  }

  const qrDataUrl = await generateVerificationQrDataUrl(verifyUrl);

  let y = 26;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text('COMMISSION DISBURSEMENT VOUCHER', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text(`Voucher No: ${voucherNo}`, pageWidth - margin, y, { align: 'right' });

  y += 5;

  // Profile Card Box
  doc.setFillColor(...PDF_COLORS.surface);
  doc.setDrawColor(...PDF_COLORS.border);
  doc.roundedRect(margin, y, usableWidth, 26, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text('BCA PROFILE & OUTLET INFORMATION', margin + 4, y + 4.5);

  const col1X = margin + 4;
  const col2X = margin + (usableWidth / 2);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textSecondary);

  // Left Column
  doc.text('BCA Name:', col1X, y + 9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.textPrimary);
  doc.text(record.bcaName || '-', col1X + 22, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('Agent ID:', col1X, y + 14.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.textPrimary);
  doc.text(`${record.agentId}${record.agentIdBank ? ' (Bank: ' + record.agentIdBank + ')' : ''}`, col1X + 22, y + 14.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('Base Branch:', col1X, y + 19.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.textPrimary);
  doc.text(`${record.baseBranch}${record.solId ? ' (SOL ' + record.solId + ')' : ''}`, col1X + 22, y + 19.5);

  // Right Column
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('State / Zone:', col2X, y + 9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.textPrimary);
  doc.text(`${record.stateName} / ${record.zoneName}`, col2X + 22, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('District / Mandal:', col2X, y + 14.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.textPrimary);
  doc.text(`${record.dist}${record.mandal ? ' / ' + record.mandal : ''}`, col2X + 22, y + 14.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('Village / Attendance:', col2X, y + 19.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.textPrimary);
  doc.text(`${record.villageName || '-'}  (${record.loginDays} Days / ${record.loginPercentage}%)`, col2X + 22, y + 19.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text(`Terminal Device ID: ${record.deviceId || 'POS-01'}  |  Location: ${record.locationType || 'RURAL'}  |  Company: ${record.companyName || 'SANJIVANI'}`, col1X, y + 24);

  y += 30;

  // 3 Explicit Lines: BC Commission, 2% TDS, Net Payable Hero Box
  doc.setFillColor(...PDF_COLORS.successBg);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, usableWidth, 23, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.green);
  doc.text('NET BCA DISBURSEMENT PAYABLE', margin + 4, y + 5.5);

  doc.setFontSize(14);
  doc.text(formatInrPdf(netPayable), margin + 4, y + 14);

  // 3 Statutory lines on right
  const linesX = margin + 70;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textPrimary);
  doc.text(`1. BCA Commission (80%): ${formatInrPdf(bcComm)}`, linesX, y + 6);
  doc.setTextColor(185, 28, 28);
  doc.text(`2. TDS Deduction at 2%: -${formatInrPdf(tdsDeduction)}`, linesX, y + 11.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.green);
  doc.text(`3. Net Payable Amount: ${formatInrPdf(netPayable)}`, linesX, y + 17);

  y += 27;

  // Earnings Breakdown Table
  autoTable(doc, {
    startY: y,
    head: [['Earnings & Activity Category', 'Volume / Count', 'Total Commission (INR)']],
    body: [
      ['Account Opening Operations (Funded + Non-Funded)', `${record.totalNoOfAcctOpn} Accounts (${record.fundedNoOfAcctOpn} Funded)`, formatInrPdf(record.commTotalAcctOpn || 0)],
      ['Financial Cash Transactions & Deposits', `${record.financialTxn} Txns (Vol: Rs. ${(record.txnAmt || 0).toLocaleString('en-IN')})`, formatInrPdf(record.txnComm || 0)],
      ['Remittance Services (Rs. 10 Fixed)', `${record.remittanceCount} Remittances`, formatInrPdf(record.remittanceRs10 || 0)],
      ['Fixed Base Commission (Attendance Mandated)', `${record.loginDays} Days Active`, formatInrPdf(record.fixedCommission || 0)],
      ['Re-KYC Services', `${record.reKycCount} Re-KYCs`, formatInrPdf(record.reKycComm || 0)],
    ],
    theme: 'grid',
    headStyles: { fillColor: PDF_COLORS.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    styles: { fontSize: 7, cellPadding: 1.5, lineColor: PDF_COLORS.border, lineWidth: 0.15 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 46 },
      2: { cellWidth: 36, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 3;

  // Social Security Schemes Table
  autoTable(doc, {
    startY: y,
    head: [['Social Security Scheme (SSS)', 'Enrollment Count', 'Commission / Incentive (INR)']],
    body: [
      ['Atal Pension Yojana (APY - PFRDA)', `${record.apyCount} Policies`, formatInrPdf(record.apyComm || 0)],
      ['Pradhan Mantri Suraksha Bima Yojana (PMSBY)', `${record.sbyCount} Policies`, formatInrPdf(record.sbyComm || 0)],
      ['Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)', `${record.jbyCount} Policies`, formatInrPdf(record.jbyComm || 0)],
      ['10% Special Scheme Performance Incentive', 'Special Target', formatInrPdf(record.incentive10Sss || 0)],
    ],
    theme: 'grid',
    headStyles: { fillColor: PDF_COLORS.navy, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
    styles: { fontSize: 7, cellPadding: 1.5, lineColor: PDF_COLORS.border, lineWidth: 0.15 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 46 },
      2: { cellWidth: 36, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 3.5;

  // Amount in Words
  doc.setFillColor(...PDF_COLORS.surface);
  doc.setDrawColor(...PDF_COLORS.border);
  doc.roundedRect(margin, y, usableWidth, 7.5, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text(`Net Payable Amount in Words: ${numberToWordsInr(Math.round(netPayable))}`, margin + 3, y + 4.8);

  y += 11.5;

  // Verification QR Block
  const blockW = 60;
  const qrX = pageWidth - margin - blockW;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text('Statutory & TDS Compliance Notice:', margin, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('1. TDS at 2.00% has been deducted on gross BCA commission payable.', margin, y + 8.5);
  doc.text('2. Form 16A quarterly TDS certificates will be issued as per IT Act 1961.', margin, y + 12.5);
  doc.text('3. Discrepancies must be reported in writing within 15 calendar days.', margin, y + 16.5);

  doc.setFillColor(...PDF_COLORS.surface);
  doc.setDrawColor(...PDF_COLORS.border);
  doc.roundedRect(qrX, y, blockW, 26, 1.5, 1.5, 'FD');

  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', qrX + 3, y + 3, 20, 20);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text('VERIFY VOUCHER', qrX + 25, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('Scan with phone to verify', qrX + 25, y + 10);
  doc.text(`Code: ${shortCode}`, qrX + 25, y + 14);
  doc.text('bc-comm.vercel.app', qrX + 25, y + 18);

  const pageH = doc.internal.pageSize.getHeight();
  const sigY = pageH - 18;

  doc.setDrawColor(...PDF_COLORS.border);
  doc.line(margin, sigY - 4, pageWidth - margin, sigY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('BCA Signature & Stamp: ______________________', margin, sigY);
  doc.text('Authorized Signatory: ______________________', pageWidth - margin, sigY, { align: 'right' });

  applyStandardPageFrame(doc, {
    title: 'COMMISSION DISBURSEMENT VOUCHER',
    statementMonth,
    logoDataUrl,
  });

  if (options?.returnDoc) {
    return doc;
  }

  doc.save(`Voucher_${record.agentId}_${monthCode}.pdf`);
  return doc;
}

// ==============================================================================
// 4. BULK VOUCHERS (One Page Per BCA with 3 explicit lines)
// ==============================================================================
export async function generateBulkVouchersPdf(
  records: CommissionRecord[],
  onProgress?: (current: number, total: number) => void
) {
  if (!records || records.length === 0) return;

  const logoDataUrl = await getOfficialLogoDataUrl();
  const total = records.length;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const statementMonth = records[0]?.statementMonth || 'AUGUST 2026';
  const monthCode = getStatementMonthCode(statementMonth);

  for (let i = 0; i < total; i++) {
    if (i > 0) doc.addPage();
    await generateAgentCommissionVoucherPdf(records[i], {
      existingDoc: doc,
      returnDoc: true,
      logoDataUrl,
    });
    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  doc.save(`Sanjivani_All_Vouchers_${monthCode}_(${total}_BCAs).pdf`);
}

export const generateAgentCommissionPdf = generateAgentCommissionVoucherPdf;
