/**
 * BC_COMM — PDF Standard Page Frame Decorator
 * Draws standard header, official logo image, title banner, saffron accent line, and "Page X of Y" footers.
 * Uses ASCII dividers to prevent symbol corruption.
 */
import jsPDF from 'jspdf';
import { PDF_COLORS, drawSanjivaniLogo } from './assets';
import { formatFixedDate } from './format';

interface PageFrameOptions {
  title: string;
  statementMonth?: string;
  showDate?: boolean;
  logoDataUrl?: string | null;
}

export function applyStandardPageFrame(doc: jsPDF, options: PageFrameOptions) {
  const totalPages = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const isLandscape = pageWidth > pageHeight;
  const margin = isLandscape ? 12 : 14;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // ==================== HEADER ====================
    // 1. Logo & Org Info (Left)
    drawSanjivaniLogo(doc, margin, 7, 9, options.logoDataUrl);

    // 2. Document Title & Period (Right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...PDF_COLORS.navy);
    doc.text(options.title, pageWidth - margin, 11, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF_COLORS.textSecondary);
    const dateStr = formatFixedDate();
    const periodStr = options.statementMonth ? `Period: ${options.statementMonth}  |  ` : '';
    doc.text(`${periodStr}Generated: ${dateStr}`, pageWidth - margin, 16, { align: 'right' });

    // 3. Thin Saffron Accent Rule
    doc.setDrawColor(...PDF_COLORS.saffron);
    doc.setLineWidth(0.6);
    doc.line(margin, 20, pageWidth - margin, 20);

    // ==================== FOOTER ====================
    doc.setDrawColor(...PDF_COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.textSecondary);
    doc.text('Sanjivani Vikas Foundation - Computer-generated statutory document', margin, pageHeight - 7.5);

    // Page Numbers: "Page X of Y"
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7.5, { align: 'right' });
  }
}
