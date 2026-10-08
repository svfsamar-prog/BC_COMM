/**
 * BC_COMM — PDF Formatting Utilities
 * Standardized whole-rupee Indian numbering, words converter, and date formatters.
 */

// Round to whole rupees (0.50 rounds up)
export function roundRupees(val: number): number {
  if (isNaN(val) || val === null || val === undefined) return 0;
  return Math.round(val);
}

// Format whole rupees with Indian number grouping: ₹8,420
export function formatInrPdf(val: number): string {
  const rounded = roundRupees(val);
  return `₹${rounded.toLocaleString('en-IN')}`;
}

// Format compact currency for headlines: ₹48.2 L / ₹3.2 Cr
export function formatCompactInrPdf(val: number): string {
  const rounded = roundRupees(val);
  if (rounded >= 10000000) {
    return `₹${(rounded / 10000000).toFixed(2)} Cr`;
  }
  if (rounded >= 100000) {
    return `₹${(rounded / 100000).toFixed(2)} L`;
  }
  return `₹${rounded.toLocaleString('en-IN')}`;
}

// Format standard fixed date: 08 Oct 2026
export function formatFixedDate(dateInput?: Date | string): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Extract Month Code for Voucher No: "AUGUST 2026" -> "AUG26"
export function getStatementMonthCode(monthStr: string): string {
  if (!monthStr) return 'AUG26';
  const clean = monthStr.toUpperCase().trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    const m = parts[0].substring(0, 3);
    const y = parts[1].substring(parts[1].length - 2);
    return `${m}${y}`;
  }
  return clean.replace(/[^A-Z0-9]/g, '').substring(0, 6) || 'AUG26';
}

// Convert whole number to Indian English words ("Rupees Eight Thousand Four Hundred Twenty Only")
export function numberToWordsInr(amount: number): string {
  const num = roundRupees(amount);
  if (num === 0) return 'Rupees Zero Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return a[n];
    const tens = b[Math.floor(n / 10)];
    const ones = a[n % 10];
    return `${tens}${ones ? ' ' + ones : ''}`;
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) {
      res += `${a[hundred]} Hundred`;
      if (rest > 0) res += ' ';
    }
    if (rest > 0) {
      res += convertTwoDigits(rest);
    }
    return res;
  }

  let crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;

  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  let hundredPart = remainder;

  const parts: string[] = [];

  if (crore > 0) {
    parts.push(`${convertThreeDigits(crore)} Crore`);
  }
  if (lakh > 0) {
    parts.push(`${convertTwoDigits(lakh)} Lakh`);
  }
  if (thousand > 0) {
    parts.push(`${convertTwoDigits(thousand)} Thousand`);
  }
  if (hundredPart > 0) {
    parts.push(convertThreeDigits(hundredPart));
  }

  return `Rupees ${parts.join(' ')} Only`;
}
