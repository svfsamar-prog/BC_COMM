/**
 * BC_COMM — Brand Assets & Palette Constants for PDF rendering
 * Themed around the official Sanjivani Vikas Foundation Logo
 */
import jsPDF from 'jspdf';

export const PDF_COLORS = {
  navy: [10, 92, 54] as [number, number, number], // #0A5C36 Sanjivani Forest Green
  green: [21, 128, 61] as [number, number, number], // #15803D BCA Payout Green
  saffron: [229, 152, 25] as [number, number, number], // #E59819 Saffron Accent Rule
  darkGreen: [0, 77, 37] as [number, number, number], // #004D25
  textPrimary: [10, 10, 10] as [number, number, number],
  textSecondary: [107, 114, 128] as [number, number, number],
  border: [229, 231, 235] as [number, number, number],
  surface: [250, 250, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  successBg: [240, 253, 244] as [number, number, number],
};

// Draw Crisp Vector Sanjivani Foundation Emblem
export function drawSanjivaniLogo(doc: jsPDF, x: number, y: number, size: number = 10) {
  // Forest Green Badge Box
  doc.setFillColor(...PDF_COLORS.navy);
  doc.roundedRect(x, y, size, size, 1.5, 1.5, 'F');

  // Orange Flower / Saffron Accent Dot
  doc.setFillColor(...PDF_COLORS.saffron);
  doc.circle(x + size - 2.2, y + 2.2, 0.9, 'F');

  // White "SVF" Monogram
  doc.setTextColor(...PDF_COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size * 0.55);
  doc.text('SVF', x + size / 2, y + size * 0.68, { align: 'center' });

  // Organization Title
  doc.setTextColor(...PDF_COLORS.navy);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SANJIVANI VIKAS FOUNDATION', x + size + 3, y + 4.2);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textSecondary);
  doc.text('National Business Correspondent Network • Happiness & Care For All', x + size + 3, y + 8.2);
}
