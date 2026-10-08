import { NextResponse } from 'next/server';
import { supabase, mapMonthlyRecordToCommission, mapCommissionToMonthlyRecord } from '@/lib/supabaseClient';
import { INITIAL_COMMISSION_RECORDS } from '@/lib/preloadedData';
import { CommissionRecord } from '@/types/commission';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    // Query sanjivani.monthly_records directly
    let query = supabase.from('monthly_records').select('*').limit(10000).order('bc_comm', { ascending: false });

    if (month && month !== 'ALL') {
      query = query.eq('month_year', month);
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

    const records: CommissionRecord[] = data.map(mapMonthlyRecordToCommission);

    return NextResponse.json({
      total: records.length,
      records,
      source: 'sanjivani.monthly_records',
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

    // 1. Upsert into sanjivani.periods
    for (const m of targetMonths) {
      await supabase.from('periods').upsert({
        month_year: m,
        year: 2026,
        month: 9,
        days_in_month: 30,
        uploaded_by: 'admin',
      });
    }

    // 2. Upsert into sanjivani.agents
    const agentRows = records.map((r) => ({
      agent_id: r.agentId,
      bca_name: r.bcaName,
      state_name: r.stateName,
      zone_name: r.zoneName,
      dist: r.dist,
      mandal: r.mandal,
      base_branch: r.baseBranch,
      sol_id: r.solId,
      village_name: r.villageName,
      date_of_joining: r.dateOfJoining,
      location_type: r.locationType || 'RURAL',
      company_name: r.companyName || 'SANJIVANI',
    }));

    for (let i = 0; i < agentRows.length; i += 100) {
      const chunk = agentRows.slice(i, i + 100);
      await supabase.from('agents').upsert(chunk);
    }

    // 3. Delete existing matching months in sanjivani.monthly_records
    for (const m of targetMonths) {
      await supabase.from('monthly_records').delete().eq('month_year', m);
    }

    // 4. Upsert into sanjivani.monthly_records in batches
    const dbRows = records.map(mapCommissionToMonthlyRecord);
    for (let i = 0; i < dbRows.length; i += 100) {
      const chunk = dbRows.slice(i, i + 100);
      const { error } = await supabase.from('monthly_records').insert(chunk);
      if (error) {
        console.error('sanjivani.monthly_records insert error:', error);
        throw new Error(error.message);
      }
    }

    return NextResponse.json({
      success: true,
      schema: 'sanjivani',
      table: 'monthly_records',
      month: targetMonth,
      inserted: records.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save to sanjivani schema' }, { status: 500 });
  }
}
