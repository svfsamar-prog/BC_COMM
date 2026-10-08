/**
 * BC_COMM — Enterprise PDF Export Engines
 * 1. Summary Report (Landscape A4, 9-column register, grouped subtotals)
 * 2. Payout List (Portrait A4, disbursement register with signatures and words total)
 * 3. Commission Voucher (Single & Bulk Portrait A4, verifiable QR code, words amount)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommissionRecord } from '@/types/commission';
import { PDF_COLORS, drawSanjivaniLogo } from './pdf/assets';
import { applyStandardPageFrame } from './pdf/frame';
import {
  formatInrPdf,
  formatCompactInrPdf,
  formatFixedDate,
  numberToWordsInr,
  getStatementMonthCode,
  roundRupees,
} from './pdf/format';
import { generateVerificationQrDataUrl } from './pdf/qr';

// ==============================================================================
// 1. SUMMARY REPORT (Landscape A4)
// ==============================================================================
export function generateSummaryReportPdf(
  records: CommissionRecord[],
  scopeTitle: string = 'All Districts'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~297 mm
  const margin = 12;
  const usableWidth = pageWidth - margin * 2; // ~273 mm
  const statementMonth = records[0]?.statementMonth || 'AUGUST 2026';

  // Calculate Exact Totals First
  let grandGross = 0;
  let grandBc = 0;
  let grandCorp = 0;
  let grandAccounts = 0;
  let grandTxns = 0;
  let grandTxnVol = 0;
  let grandSss = 0;

  // Group by State and District
  const stateMap = new Map<string, Map<string, CommissionRecord[]>>();

  records.forEach((r) => {
    grandGross += r.netCommission || 0;
    grandBc += r.bcComm || 0;
    grandCorp += r.corpComm || 0;
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

  // Scope Sub-Header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text(`Scope: ${records.length} BCAs • ${scopeTitle} • Statement Month: ${statementMonth}`, margin, startY);

  startY += 5;

  // 3 Headline Metric Cards
  const cardWidth = (usableWidth - 8) / 3;
  const cardHeight = 22;

  // 1. Gross Commission
  doc.setFillColor(...PDF_COLORS.surface);
  doc.setDrawColor(...PDF_COLORS.border);
  doc.roundedRect(margin, startY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('GROSS RECONCILED COMMISSION', margin + 4, startY + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text(formatInrPdf(grandGross), margin + 4, startY + 13.5);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text(`Exact Gross: ₹${grandGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin + 4, startY + 19);

  // 2. BCA Payout (80%)
  const card2X = margin + cardWidth + 4;
  doc.setFillColor(...PDF_COLORS.successBg);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(card2X, startY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.green);
  doc.text('BCA DISBURSEMENT SHARE (80%)', card2X + 4, startY + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(...PDF_COLORS.green);
  doc.text(formatInrPdf(grandBc), card2X + 4, startY + 13.5);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${records.length} Active Business Correspondents`, card2X + 4, startY + 19);

  // 3. Corporate Share (20%)
  const card3X = margin + (cardWidth + 4) * 2;
  doc.setFillColor(...PDF_COLORS.surface);
  doc.setDrawColor(...PDF_COLORS.border);
  doc.roundedRect(card3X, startY, cardWidth, cardHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('CORPORATE RETENTION (20%)', card3X + 4, startY + 5.5);
  doc.setFontSize(13);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text(formatInrPdf(grandCorp), card3X + 4, startY + 13.5);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('Sanjivani Vikas Foundation Share', card3X + 4, startY + 19);

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
    let stBca = 0, stAcc = 0, stTxn = 0, stVol = 0, stSss = 0, stGross = 0, stBc = 0;
    dtMap.forEach((bcaList) => {
      stBca += bcaList.length;
      bcaList.forEach((r) => {
        stAcc += r.totalNoOfAcctOpn || 0;
        stTxn += r.financialTxn || 0;
        stVol += r.txnAmt || 0;
        stSss += (r.apyCount || 0) + (r.sbyCount || 0) + (r.jbyCount || 0);
        stGross += r.netCommission || 0;
        stBc += r.bcComm || 0;
      });
    });

    stateRows.push([
      st,
      stBca.toLocaleString('en-IN'),
      stAcc.toLocaleString('en-IN'),
      stTxn.toLocaleString('en-IN'),
      formatCompactInrPdf(stVol),
      stSss.toLocaleString('en-IN'),
      formatInrPdf(stGross),
      formatInrPdf(stBc),
    ]);
  });

  autoTable(doc, {
    startY,
    head: [['State Name', 'BCAs', 'Accounts', 'Txns', 'Txn Volume', 'SSS Policies', 'Gross Commission', 'BCA Payout (80%)']],
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
      7: { halign: 'right', fontStyle: 'bold', textColor: PDF_COLORS.green },
    },
    margin: { left: margin, right: margin },
  });

  // ==================== PAGES 2+: 9-COLUMN REGISTER TABLE ====================
  doc.addPage();

  const registerRows: any[][] = [];

  Array.from(stateMap.keys()).sort().forEach((st) => {
    const dtMap = stateMap.get(st)!;

    Array.from(dtMap.keys()).sort().forEach((dt) => {
      const bcaList = dtMap.get(dt)!;
      bcaList.sort((a, b) => (b.bcComm || 0) - (a.bcComm || 0));

      let dtAcc = 0, dtTxn = 0, dtSss = 0, dtGross = 0, dtBc = 0;

      bcaList.forEach((r) => {
        const sss = (r.apyCount || 0) + (r.sbyCount || 0) + (r.jbyCount || 0);
        dtAcc += r.totalNoOfAcctOpn || 0;
        dtTxn += r.financialTxn || 0;
        dtSss += sss;
        dtGross += r.netCommission || 0;
        dtBc += r.bcComm || 0;

        registerRows.push([
          r.agentId,
          r.bcaName,
          r.baseBranch,
          r.dist,
          (r.totalNoOfAcctOpn || 0).toLocaleString('en-IN'),
          (r.financialTxn || 0).toLocaleString('en-IN'),
          sss.toLocaleString('en-IN'),
          formatInrPdf(r.netCommission || 0),
          formatInrPdf(r.bcComm || 0),
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
        { content: dtSss.toLocaleString('en-IN'), styles: { fontStyle: 'bold', halign: 'right', fillColor: PDF_COLORS.surface } },
        { content: formatInrPdf(dtGross), styles: { fontStyle: 'bold', halign: 'right', fillColor: PDF_COLORS.surface } },
        { content: formatInrPdf(dtBc), styles: { fontStyle: 'bold', halign: 'right', fillColor: PDF_COLORS.surface, textColor: PDF_COLORS.green } },
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
    { content: grandSss.toLocaleString('en-IN'), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
    { content: formatInrPdf(grandGross), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249] } },
    { content: formatInrPdf(grandBc), styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249], textColor: PDF_COLORS.green, fontSize: 8 } },
  ]);

  autoTable(doc, {
    startY: 24,
    head: [['Agent ID', 'BCA Name', 'Branch', 'District', 'Accounts', 'Txns', 'SSS', 'Gross Comm.', 'BCA Payout (80%)']],
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
      1: { cellWidth: 46 },
      2: { cellWidth: 42 },
      3: { cellWidth: 32 },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 35, halign: 'right' },
      8: { cellWidth: 42, halign: 'right', fontStyle: 'bold', textColor: PDF_COLORS.green },
    },
    margin: { left: margin, right: margin, top: 24, bottom: 16 },
    didDrawPage: (data) => {
      // Footnote on last page
      if (data.pageNumber === (doc as any).internal.getNumberOfPages()) {
        const pageH = doc.internal.pageSize.getHeight();
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.5);
        doc.setTextColor(...PDF_COLORS.textSecondary);
        doc.text('* Amounts are rounded to the nearest rupee. Totals are computed on exact values.', margin, pageH - 14);
      }
    },
  });

  // Apply Standard Header & Footer Frame
  applyStandardPageFrame(doc, {
    title: 'COMMISSION SUMMARY & REGIONAL REPORT',
    statementMonth,
  });

  doc.save(`Sanjivani_Summary_Report_${scopeTitle.replace(/\s+/g, '_')}.pdf`);
}

// ==============================================================================
// 2. PAYOUT LIST (Portrait A4)
// ==============================================================================
export function generatePayoutListPdf(
  records: CommissionRecord[],
  scopeTitle: string = 'All Districts'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210 mm
  const margin = 12;
  const statementMonth = records[0]?.statementMonth || 'AUGUST 2026';

  // Group by District
  const districtMap = new Map<string, CommissionRecord[]>();
  let totalDisbursement = 0;

  records.forEach((r) => {
    const dt = r.dist || 'OTHER';
    if (!districtMap.has(dt)) districtMap.set(dt, []);
    districtMap.get(dt)!.push(r);
    totalDisbursement += roundRupees(r.bcComm || 0);
  });

  const tableRows: any[][] = [];
  let serial = 1;

  Array.from(districtMap.keys()).sort().forEach((dt) => {
    const bcaList = districtMap.get(dt)!;
    bcaList.sort((a, b) => (b.bcComm || 0) - (a.bcComm || 0));

    let dtTotal = 0;

    bcaList.forEach((r) => {
      const roundedPayout = roundRupees(r.bcComm || 0);
      dtTotal += roundedPayout;

      tableRows.push([
        serial++,
        r.bcaName,
        `${r.agentId}${r.agentIdBank ? '\nBank: ' + r.agentIdBank : ''}`,
        `${r.baseBranch}\n(${dt})`,
        formatInrPdf(roundedPayout),
        '', // Signature blank column
      ]);
    });

    // District Subtotal
    tableRows.push([
      {
        content: `Subtotal for District ${dt} (${bcaList.length} BCAs)`,
        colSpan: 4,
        styles: { fontStyle: 'bold', fillColor: PDF_COLORS.surface, textColor: PDF_COLORS.navy },
      },
      {
        content: formatInrPdf(dtTotal),
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
      styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: PDF_COLORS.navy, fontSize: 8.5 },
    },
    {
      content: formatInrPdf(totalDisbursement),
      styles: { fontStyle: 'bold', halign: 'right', fillColor: [241, 245, 249], textColor: PDF_COLORS.green, fontSize: 8.5 },
    },
    { content: '', styles: { fillColor: [241, 245, 249] } },
  ]);

  autoTable(doc, {
    startY: 24,
    head: [['#', 'BCA Name', 'Agent ID', 'Branch / SOL', 'Payable Amount (80%)', 'Signature / Ref']],
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
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 48 },
      2: { cellWidth: 32 },
      3: { cellWidth: 38 },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: PDF_COLORS.green },
      5: { cellWidth: 26 },
    },
    margin: { left: margin, right: margin, top: 24, bottom: 38 },
  });

  // Add Words & Approval Block on Last Page
  const pageH = doc.internal.pageSize.getHeight();
  const wordsText = `Total Amount in Words: ${numberToWordsInr(totalDisbursement)}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text(wordsText, margin, pageH - 30);

  // Approval Signature Block
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

  // Standard Header & Footer
  applyStandardPageFrame(doc, {
    title: 'BCA DISBURSEMENT & SIGNATURE REGISTER',
    statementMonth,
  });

  doc.save(`Sanjivani_Payout_List_${scopeTitle.replace(/\s+/g, '_')}.pdf`);
}

// ==============================================================================
// 3. COMMISSION DISBURSEMENT VOUCHER (Single & Bulk Portrait A4)
// ==============================================================================
export async function generateAgentCommissionVoucherPdf(
  record: CommissionRecord,
  options?: { returnDoc?: boolean; existingDoc?: jsPDF }
) {
  const doc = options?.existingDoc || new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210 mm
  const margin = 14;
  const usableWidth = pageWidth - margin * 2;
  const statementMonth = record.statementMonth || 'AUGUST 2026';
  const monthCode = getStatementMonthCode(statementMonth);
  const voucherNo = `SVF/${monthCode}/${record.agentId}`;
  const roundedPayout = roundRupees(record.bcComm || 0);

  // 1. Issue / Fetch Verification Token from API
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
    console.warn('Voucher verify signature offline fallback:', e);
  }

  // Generate QR Code data URL
  const qrDataUrl = await generateVerificationQrDataUrl(verifyUrl);

  let y = 26;

  // Header Sub-Title
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
  doc.text(record.bcaName || '—', col1X + 22, y + 9.5);

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
  doc.text(`${record.villageName || '—'}  (${record.loginDays} Days / ${record.loginPercentage}%)`, col2X + 22, y + 19.5);

  // Small bottom line inside profile
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text(`Terminal Device ID: ${record.deviceId || 'POS-01'}  •  Location: ${record.locationType || 'RURAL'}  •  Company: ${record.companyName || 'SANJIVANI'}`, col1X, y + 24);

  y += 30;

  // Payout Hero Box
  doc.setFillColor(...PDF_COLORS.successBg);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, usableWidth, 20, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.green);
  doc.text('NET BCA DISBURSEMENT PAYABLE (80%)', margin + 4, y + 6);

  doc.setFontSize(14);
  doc.text(formatInrPdf(roundedPayout), margin + 4, y + 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text(`Gross Reconciled: ${formatInrPdf(record.netCommission || 0)}   •   Corporate Retention (20%): ${formatInrPdf(record.corpComm || 0)}`, margin + 65, y + 13.5);

  y += 24;

  // Earnings Breakdown Table
  autoTable(doc, {
    startY: y,
    head: [['Earnings & Activity Category', 'Volume / Count', 'Total Commission (INR)']],
    body: [
      ['Account Opening Operations (Funded + Non-Funded)', `${record.totalNoOfAcctOpn} Accounts (${record.fundedNoOfAcctOpn} Funded)`, formatInrPdf(record.commTotalAcctOpn || 0)],
      ['Financial Cash Transactions & Deposits', `${record.financialTxn} Txns (Vol: ₹${(record.txnAmt || 0).toLocaleString('en-IN')})`, formatInrPdf(record.txnComm || 0)],
      ['Remittance Services (Rs 10 Fixed)', `${record.remittanceCount} Remittances`, formatInrPdf(record.remittanceRs10 || 0)],
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

  y = (doc as any).lastAutoTable.finalY + 4;

  // Amount in Words
  doc.setFillColor(...PDF_COLORS.surface);
  doc.setDrawColor(...PDF_COLORS.border);
  doc.roundedRect(margin, y, usableWidth, 8, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text(`Amount in Words: ${numberToWordsInr(roundedPayout)}`, margin + 3, y + 5.2);

  y += 12;

  // Verification QR Block (Bottom Right) & Notes (Bottom Left)
  const blockW = 60;
  const qrX = pageWidth - margin - blockW;

  // Left Disclaimer Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.navy);
  doc.text('Important Terms & Statutory Notice:', margin, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('1. Payment is subject to standard TDS deduction and inter-bank SLA compliance.', margin, y + 8.5);
  doc.text('2. Discrepancies must be reported in writing within 15 calendar days.', margin, y + 12.5);
  doc.text('3. This is a computer-verified statement issued for Banking Correspondent operations.', margin, y + 16.5);

  // Right QR Code Box
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

  // Signature Block
  const pageH = doc.internal.pageSize.getHeight();
  const sigY = pageH - 18;

  doc.setDrawColor(...PDF_COLORS.border);
  doc.line(margin, sigY - 4, pageWidth - margin, sigY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('BCA Signature & Stamp: ______________________', margin, sigY);
  doc.text('Authorized Signatory: ______________________', pageWidth - margin, sigY, { align: 'right' });

  // Standard Header & Footer
  applyStandardPageFrame(doc, {
    title: 'COMMISSION DISBURSEMENT VOUCHER',
    statementMonth,
  });

  if (options?.returnDoc) {
    return doc;
  }

  doc.save(`Voucher_${record.agentId}_${monthCode}.pdf`);
  return doc;
}

// ==============================================================================
// 4. BULK VOUCHERS (One Page Per BCA)
// ==============================================================================
export async function generateBulkVouchersPdf(
  records: CommissionRecord[],
  onProgress?: (current: number, total: number) => void
) {
  if (!records || records.length === 0) return;

  const total = records.length;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const statementMonth = records[0]?.statementMonth || 'AUGUST 2026';
  const monthCode = getStatementMonthCode(statementMonth);

  // Pre-fetch all batch vouchers from server in ONE single call
  const batchPayload = records.map((r) => ({
    agentId: r.agentId,
    bcaName: r.bcaName,
    villageName: r.villageName,
    statementMonth,
    grossCommission: r.netCommission,
    bcComm: r.bcComm,
    corpComm: r.corpComm,
  }));

  let voucherMap = new Map<string, { verifyUrl: string; shortCode: string }>();

  try {
    const res = await fetch('/api/vouchers/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: batchPayload }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.vouchers) {
        data.vouchers.forEach((v: any) => {
          voucherMap.set(v.voucherNo, { verifyUrl: v.verifyUrl, shortCode: v.shortCode });
        });
      }
    }
  } catch (err) {
    console.warn('Bulk voucher signature offline fallback:', err);
  }

  // Render each voucher page
  for (let i = 0; i < total; i++) {
    if (i > 0) doc.addPage();
    const record = records[i];

    const monthCode = getStatementMonthCode(record.statementMonth || statementMonth);
    const voucherNo = `SVF/${monthCode}/${record.agentId}`;
    const qrInfo = voucherMap.get(voucherNo);
    const verifyUrl = qrInfo?.verifyUrl || `https://bc-comm.vercel.app/verify/${encodeURIComponent(voucherNo)}`;
    const shortCode = qrInfo?.shortCode || 'VERIFIED';

    const qrDataUrl = await generateVerificationQrDataUrl(verifyUrl);
    const roundedPayout = roundRupees(record.bcComm || 0);

    const margin = 14;
    const usableWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = 26;

    // Header Sub-Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PDF_COLORS.navy);
    doc.text('COMMISSION DISBURSEMENT VOUCHER', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.textSecondary);
    doc.text(`Voucher No: ${voucherNo}`, doc.internal.pageSize.getWidth() - margin, y, { align: 'right' });

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
    doc.text(record.bcaName || '—', col1X + 22, y + 9.5);

    doc.text('Agent ID:', col1X, y + 14.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COLORS.textPrimary);
    doc.text(`${record.agentId}${record.agentIdBank ? ' (Bank: ' + record.agentIdBank + ')' : ''}`, col1X + 22, y + 14.5);

    doc.text('Base Branch:', col1X, y + 19.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COLORS.textPrimary);
    doc.text(`${record.baseBranch}${record.solId ? ' (SOL ' + record.solId + ')' : ''}`, col1X + 22, y + 19.5);

    // Right Column
    doc.text('State / Zone:', col2X, y + 9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COLORS.textPrimary);
    doc.text(`${record.stateName} / ${record.zoneName}`, col2X + 22, y + 9.5);

    doc.text('District / Mandal:', col2X, y + 14.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COLORS.textPrimary);
    doc.text(`${record.dist}${record.mandal ? ' / ' + record.mandal : ''}`, col2X + 22, y + 14.5);

    doc.text('Village / Attendance:', col2X, y + 19.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COLORS.textPrimary);
    doc.text(`${record.villageName || '—'}  (${record.loginDays} Days / ${record.loginPercentage}%)`, col2X + 22, y + 19.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...PDF_COLORS.textSecondary);
    doc.text(`Terminal Device ID: ${record.deviceId || 'POS-01'}  •  Location: ${record.locationType || 'RURAL'}  •  Company: ${record.companyName || 'SANJIVANI'}`, col1X, y + 24);

    y += 30;

    // Payout Hero Box
    doc.setFillColor(...PDF_COLORS.successBg);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, usableWidth, 20, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...PDF_COLORS.green);
    doc.text('NET BCA DISBURSEMENT PAYABLE (80%)', margin + 4, y + 6);

    doc.setFontSize(14);
    doc.text(formatInrPdf(roundedPayout), margin + 4, y + 14);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.textSecondary);
    doc.text(`Gross Reconciled: ${formatInrPdf(record.netCommission || 0)}   •   Corporate Retention (20%): ${formatInrPdf(record.corpComm || 0)}`, margin + 65, y + 13.5);

    y += 24;

    // Tables
    autoTable(doc, {
      startY: y,
      head: [['Earnings & Activity Category', 'Volume / Count', 'Total Commission (INR)']],
      body: [
        ['Account Opening Operations (Funded + Non-Funded)', `${record.totalNoOfAcctOpn} Accounts (${record.fundedNoOfAcctOpn} Funded)`, formatInrPdf(record.commTotalAcctOpn || 0)],
        ['Financial Cash Transactions & Deposits', `${record.financialTxn} Txns (Vol: ₹${(record.txnAmt || 0).toLocaleString('en-IN')})`, formatInrPdf(record.txnComm || 0)],
        ['Remittance Services (Rs 10 Fixed)', `${record.remittanceCount} Remittances`, formatInrPdf(record.remittanceRs10 || 0)],
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

    y = (doc as any).lastAutoTable.finalY + 4;

    doc.setFillColor(...PDF_COLORS.surface);
    doc.setDrawColor(...PDF_COLORS.border);
    doc.roundedRect(margin, y, usableWidth, 8, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.navy);
    doc.text(`Amount in Words: ${numberToWordsInr(roundedPayout)}`, margin + 3, y + 5.2);

    y += 12;

    const blockW = 60;
    const qrX = doc.internal.pageSize.getWidth() - margin - blockW;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.navy);
    doc.text('Important Terms & Statutory Notice:', margin, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...PDF_COLORS.textSecondary);
    doc.text('1. Payment is subject to standard TDS deduction and inter-bank SLA compliance.', margin, y + 8.5);
    doc.text('2. Discrepancies must be reported in writing within 15 calendar days.', margin, y + 12.5);
    doc.text('3. This is a computer-verified statement issued for Banking Correspondent operations.', margin, y + 16.5);

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
    doc.line(margin, sigY - 4, doc.internal.pageSize.getWidth() - margin, sigY - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.textSecondary);
    doc.text('BCA Signature & Stamp: ______________________', margin, sigY);
    doc.text('Authorized Signatory: ______________________', doc.internal.pageSize.getWidth() - margin, sigY, { align: 'right' });

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  // Apply Standard Frame across all pages
  applyStandardPageFrame(doc, {
    title: 'COMMISSION DISBURSEMENT VOUCHER',
    statementMonth,
  });

  doc.save(`Sanjivani_All_Vouchers_${monthCode}_(${total}_BCAs).pdf`);
}

// Backwards-compatible alias for existing imports
export const generateAgentCommissionPdf = generateAgentCommissionVoucherPdf;
