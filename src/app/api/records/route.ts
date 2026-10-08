import { NextResponse } from 'next/server';
import { INITIAL_COMMISSION_RECORDS } from '@/lib/preloadedData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const q = searchParams.get('q')?.toLowerCase().trim();
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let list = INITIAL_COMMISSION_RECORDS;

    if (month && month !== 'ALL') {
      list = list.filter((r) => r.statementMonth === month);
    }
    if (state) {
      list = list.filter((r) => r.stateName === state);
    }
    if (district) {
      list = list.filter((r) => r.dist === district);
    }
    if (q) {
      list = list.filter(
        (r) =>
          r.bcaName.toLowerCase().includes(q) ||
          r.agentId.toLowerCase().includes(q) ||
          r.baseBranch.toLowerCase().includes(q) ||
          r.dist.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + limit);

    return NextResponse.json({
      total,
      records: paginated,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
