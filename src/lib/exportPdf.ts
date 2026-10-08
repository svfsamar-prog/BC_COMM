import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommissionRecord } from '@/types/commission';

export function generateAgentCommissionPdf(record: CommissionRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // Navy #0F172A
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SANJIVANI VIKAS FOUNDATION', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('BUSINESS CORRESPONDENT COMMISSION VOUCHER / SLIP', 14, 18);
  doc.text(`STATEMENT MONTH: ${record.statementMonth || 'AUGUST 2026'}`, pageWidth - 14, 18, { align: 'right' });

  // Agent Identification Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 32, pageWidth - 28, 38, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BCA PROFILE & OUTLET INFORMATION', 18, 39);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const leftCol = 18;
  const midCol = 80;
  const rightCol = 145;

  doc.text(`BCA Name:`, leftCol, 46);
  doc.text(`Agent ID:`, leftCol, 52);
  doc.text(`Bank Agent ID:`, leftCol, 58);
  doc.text(`Base Branch:`, leftCol, 64);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${record.bcaName}`, leftCol + 22, 46);
  doc.text(`${record.agentId}`, leftCol + 22, 52);
  doc.text(`${record.agentIdBank || 'N/A'}`, leftCol + 22, 58);
  doc.text(`${record.baseBranch} (SOL: ${record.solId || 'N/A'})`, leftCol + 22, 64);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`State:`, midCol, 46);
  doc.text(`Zone:`, midCol, 52);
  doc.text(`District:`, midCol, 58);
  doc.text(`Village:`, midCol, 64);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${record.stateName}`, midCol + 14, 46);
  doc.text(`${record.zoneName}`, midCol + 14, 52);
  doc.text(`${record.dist}`, midCol + 14, 58);
  doc.text(`${record.villageName || 'N/A'}`, midCol + 14, 64);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Device ID:`, rightCol, 46);
  doc.text(`Location:`, rightCol, 52);
  doc.text(`Login Days:`, rightCol, 58);
  doc.text(`Login %:`, rightCol, 64);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${record.deviceId || 'N/A'}`, rightCol + 18, 46);
  doc.text(`${record.locationType || 'RURAL'}`, rightCol + 18, 52);
  doc.text(`${record.loginDays} / ${record.totalDaysInMonth} Days`, rightCol + 18, 58);
  doc.text(`${record.loginPercentage.toFixed(1)}%`, rightCol + 18, 64);

  // Performance & Operations Table
  autoTable(doc, {
    startY: 76,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate Navy
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    head: [['Operational Category', 'Count / Volume', 'Commission Rate / Note', 'Earned Amount (INR)']],
    body: [
      ['Non-Funded Account Opening', `${record.nonFundedNoOfAcctOpn} A/Cs`, 'Standard Non-Funded', `₹${record.commNonFundedAcctOpn.toFixed(2)}`],
      ['Funded Account Opening', `${record.fundedNoOfAcctOpn} A/Cs`, 'Funded Initial Balance', `₹${record.commFundedAcctOpn.toFixed(2)}`],
      ['Total Account Opening Comm', `${record.totalNoOfAcctOpn} Total`, 'Combined Accts Opened', `₹${record.commTotalAcctOpn.toFixed(2)}`],
      ['Financial Transactions (Cash Out/In)', `${record.financialTxn} Txns (Vol: ₹${record.txnAmt.toLocaleString('en-IN')})`, 'Txn Slab Calculation', `₹${record.txnComm.toFixed(2)}`],
      ['Domestic Money Remittance', `${record.remittanceCount} Txns`, '₹10 Slab Rate', `₹${record.remittanceRs10.toFixed(2)}`],
      ['Monthly Fixed Base Commission', `${record.loginDays} Login Days Active`, 'Fixed Base Payout', `₹${record.fixedCommission.toFixed(2)}`],
      ['Re-KYC Verification', `${record.reKycCount} Re-KYCs`, 'KYC Compliance Fee', `₹${record.reKycComm.toFixed(2)}`],
    ],
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 45, halign: 'right' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 27, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  // Social Security Schemes (SSS) Table
  const lastY1 = (doc as any).lastAutoTable.finalY || 135;

  autoTable(doc, {
    startY: lastY1 + 6,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110], // Teal/Emerald
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
    },
    head: [['Social Security Scheme (SSS)', 'Enrollment Count', 'Incentive Slab', 'Commission (INR)']],
    body: [
      ['Atal Pension Yojana (APY)', `${record.apyCount}`, 'PFRDA Slab', `₹${record.apyComm.toFixed(2)}`],
      ['Pradhan Mantri Suraksha Bima Yojana (PMSBY)', `${record.sbyCount}`, 'Govt. Insurance Slab', `₹${record.sbyComm.toFixed(2)}`],
      ['Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)', `${record.jbyCount}`, 'Govt. Life Insurance', `₹${record.jbyComm.toFixed(2)}`],
      ['10% SSS Special Target Incentive', 'Eligible Target', 'Special 10% SSS Bonus', `₹${record.incentive10Sss.toFixed(2)}`],
    ],
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 45, halign: 'right' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 27, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  // Net Commission & Split Summary Box
  const lastY2 = (doc as any).lastAutoTable.finalY || 190;

  doc.setFillColor(15, 23, 42); // Deep Navy
  doc.roundedRect(14, lastY2 + 6, pageWidth - 28, 30, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL GROSS / NET COMMISSION:', 20, lastY2 + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`INR ₹${record.netCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 20, lastY2 + 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('BCA PAYABLE SHARE (80%):', 95, lastY2 + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(52, 211, 153); // Emerald
  doc.text(`INR ₹${record.bcComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 95, lastY2 + 22);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CORPORATE SHARE (20%):', 150, lastY2 + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184); // Slate
  doc.text(`INR ₹${record.corpComm.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 150, lastY2 + 22);

  // Footer Signatures & Legal Note
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Note: This is a computer-generated monthly settlement voucher issued by Sanjivani Vikas Foundation. Subject to bank TDS & reconciliation adjustments.',
    14,
    265
  );

  doc.setDrawColor(203, 213, 225);
  doc.line(14, 278, 60, 278);
  doc.line(pageWidth - 60, 278, pageWidth - 14, 278);

  doc.text('BCA Signature & Stamp', 14, 282);
  doc.text('Authorized Signatory (Sanjivani)', pageWidth - 14, 282, { align: 'right' });

  // Trigger download
  doc.save(`Commission_Voucher_${record.agentId}_${record.bcaName.replace(/\s+/g, '_')}.pdf`);
}

export function generateSummaryReportPdf(records: CommissionRecord[], filterTitle: string = 'All Districts') {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SANJIVANI VIKAS FOUNDATION — BCA COMMISSION SUMMARY REPORT', 14, 9);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Scope: ${filterTitle} | Total BCAs: ${records.length} | Generated on: ${new Date().toLocaleDateString()}`, 14, 15);

  const tableData = records.map((r) => [
    r.stateName,
    r.zoneName,
    r.dist,
    r.baseBranch,
    r.agentId,
    r.bcaName,
    r.loginDays,
    `${r.loginPercentage.toFixed(1)}%`,
    r.totalNoOfAcctOpn,
    r.financialTxn,
    `₹${r.txnAmt.toLocaleString('en-IN')}`,
    r.apyCount,
    r.sbyCount,
    r.jbyCount,
    `₹${r.netCommission.toFixed(2)}`,
    `₹${r.bcComm.toFixed(2)}`,
    `₹${r.corpComm.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 24,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [15, 23, 42],
    },
    head: [
      [
        'State',
        'Zone',
        'District',
        'Branch',
        'Agent ID',
        'BCA Name',
        'Days',
        'Login %',
        'Accts',
        'Txns',
        'Txn Vol',
        'APY',
        'SBY',
        'JBY',
        'Net Comm',
        'BC Comm (80%)',
        'Corp Comm',
      ],
    ],
    body: tableData,
    margin: { left: 10, right: 10 },
  });

  doc.save(`Sanjivani_Commission_Summary_${filterTitle.replace(/\s+/g, '_')}.pdf`);
}
