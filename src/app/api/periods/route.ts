import { NextResponse } from 'next/server';
import { getAvailablePeriods } from '@/lib/dataService';

export async function GET() {
  try {
    const periods = await getAvailablePeriods();
    return NextResponse.json({
      success: true,
      periods,
      latestPeriod: periods[0]?.month_year || 'AUGUST 2026',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch statement periods' }, { status: 500 });
  }
}
