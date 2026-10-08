import { NextResponse } from 'next/server';
import { supabase, mapDbToRecord, mapRecordToDb } from '@/lib/supabaseClient';
import { INITIAL_COMMISSION_RECORDS } from '@/lib/preloadedData';
import { CommissionRecord } from '@/types/commission';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    // Query Supabase directly
    let query = supabase.from('commission_records').select('*').order('bc_comm', { ascending: false });

    if (month && month !== 'ALL') {
      query = query.eq('statement_month', month);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback to preloaded dataset if database is offline or empty
      let list = INITIAL_COMMISSION_RECORDS;
      if (month && month !== 'ALL') {
        list = list.filter((r) => r.statementMonth === month);
      }
      return NextResponse.json({
        total: list.length,
        records: list,
        source: 'preloaded',
      });
    }

    const records: CommissionRecord[] = data.map(mapDbToRecord);

    return NextResponse.json({
      total: records.length,
      records,
      source: 'supabase',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const records: CommissionRecord[] = body.records;

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'No records provided' }, { status: 400 });
    }

    const targetMonths = Array.from(new Set(records.map((r) => r.statementMonth).filter(Boolean)));
    const targetMonth = targetMonths[0] || 'CURRENT STATEMENT';

    // Delete existing records for this month
    for (const m of targetMonths) {
      await supabase.from('commission_records').delete().eq('statement_month', m);
    }

    // Upsert in batches of 100
    const dbRows = records.map(mapRecordToDb);
    for (let i = 0; i < dbRows.length; i += 100) {
      const chunk = dbRows.slice(i, i + 100);
      const { error } = await supabase.from('commission_records').upsert(chunk);
      if (error) {
        console.error('Supabase batch insert error:', error);
        throw new Error(error.message);
      }
    }

    return NextResponse.json({
      success: true,
      month: targetMonth,
      inserted: records.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save records' }, { status: 500 });
  }
}
