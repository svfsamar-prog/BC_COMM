/**
 * Canonical dictionary and normalization routines for State, Zone, and District names.
 * Ensures consistent groupings, filters, and aggregations across all months and uploads.
 */

const STATE_CANONICAL_MAP: Record<string, string> = {
  BIHAR: 'BIHAR',
  JHARKHAND: 'JHARKHAND',
  ODISHA: 'ODISHA',
  ORISSA: 'ODISHA',
  'WEST BENGAL': 'WEST BENGAL',
  WESTBENGAL: 'WEST BENGAL',
  TELANGANA: 'TELANGANA',
  TELENGANA: 'TELANGANA',
  'UTTAR PRADESH': 'UTTAR PRADESH',
  UP: 'UTTAR PRADESH',
  DELHI: 'DELHI',
  MAHARASHTRA: 'MAHARASHTRA',
  ASSAM: 'ASSAM',
  CHHATTISGARH: 'CHHATTISGARH',
  MADHYA_PRADESH: 'MADHYA PRADESH',
  'MADHYA PRADESH': 'MADHYA PRADESH',
  MP: 'MADHYA PRADESH',
};

export function normalizeStateName(raw: string | null | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, ' ');
  return STATE_CANONICAL_MAP[trimmed] || trimmed;
}

export function normalizeZoneName(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function normalizeDistName(raw: string | null | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, ' ');
  // Handle common district misspellings/variations
  if (trimmed === 'DHANBAD' || trimmed === 'DHANBAD DIST') return 'DHANBAD';
  if (trimmed === 'BEGUSARAI' || trimmed === 'BEGUSRAI') return 'BEGUSARAI';
  if (trimmed === 'SAMASTIPUR') return 'SAMASTIPUR';
  if (trimmed === 'PURNEA' || trimmed === 'PURNIA') return 'PURNEA';
  if (trimmed === 'KATIHAR') return 'KATIHAR';
  if (trimmed === 'ARARIA') return 'ARARIA';
  if (trimmed === 'BHAGALPUR') return 'BHAGALPUR';
  if (trimmed === 'KISHANGANJ' || trimmed === 'KISHANGUNJ') return 'KISHANGANJ';
  if (trimmed === 'SAHARSA') return 'SAHARSA';
  if (trimmed === 'MADHEPURA') return 'MADHEPURA';
  if (trimmed === 'BANKA') return 'BANKA';
  if (trimmed === 'BUXAR') return 'BUXAR';
  if (trimmed === 'SARAN' || trimmed === 'CHHAPRA') return 'SARAN';
  if (trimmed === 'RANCHI') return 'RANCHI';
  if (trimmed === 'GUMLA') return 'GUMLA';
  if (trimmed === 'JAMTARA') return 'JAMTARA';
  if (trimmed === 'BOKARO') return 'BOKARO';
  if (trimmed === 'DEOGHAR') return 'DEOGHAR';
  if (trimmed === 'PAKUR') return 'PAKUR';
  if (trimmed === 'SAHIBGANJ') return 'SAHIBGANJ';
  if (trimmed === 'GIRIDIH') return 'GIRIDIH';
  if (trimmed === 'LOHARDAGA') return 'LOHARDAGA';
  if (trimmed === 'LATEHAR') return 'LATEHAR';
  if (trimmed === 'PALAMAU' || trimmed === 'PALAMU') return 'PALAMAU';
  if (trimmed === 'GODDA') return 'GODDA';
  if (trimmed === 'ANGUL' || trimmed === 'ANUGUL') return 'ANGUL';
  if (trimmed === 'BARGARH') return 'BARGARH';
  if (trimmed === 'BOLANGIR' || trimmed === 'BALANGIR') return 'BOLANGIR';
  if (trimmed === 'BOUDH') return 'BOUDH';
  if (trimmed === 'CUTTACK') return 'CUTTACK';
  if (trimmed === 'DHENKANAL') return 'DHENKANAL';
  if (trimmed === 'KALAHANDI') return 'KALAHANDI';
  if (trimmed === 'SAMBALPUR') return 'SAMBALPUR';
  return trimmed;
}

export const MONTH_ORDER: Record<string, number> = {
  JANUARY: 1,
  FEBRUARY: 2,
  MARCH: 3,
  APRIL: 4,
  MAY: 5,
  JUNE: 6,
  JULY: 7,
  AUGUST: 8,
  SEPTEMBER: 9,
  OCTOBER: 10,
  NOVEMBER: 11,
  DECEMBER: 12,
};

export function parseMonthYearString(monthYear: string): { month: number; year: number; monthName: string } {
  if (!monthYear) return { month: 8, year: 2026, monthName: 'AUGUST' };
  const parts = monthYear.trim().toUpperCase().split(/\s+/);
  if (parts.length >= 2) {
    const monthName = parts[0];
    const year = parseInt(parts[1], 10) || 2026;
    const month = MONTH_ORDER[monthName] || 8;
    return { month, year, monthName };
  }
  return { month: 8, year: 2026, monthName: 'AUGUST' };
}

export function sortMonthYearArray(months: string[]): string[] {
  return [...months].sort((a, b) => {
    const parsedA = parseMonthYearString(a);
    const parsedB = parseMonthYearString(b);
    if (parsedA.year !== parsedB.year) return parsedA.year - parsedB.year;
    return parsedA.month - parsedB.month;
  });
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
