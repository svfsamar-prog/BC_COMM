import { NextResponse } from 'next/server';
import { getCurrentUser, logAuditEvent } from '@/lib/serverAuth';
import { fetchAllMonthlyRecords, calculateSummaryMetrics, getAvailablePeriods } from '@/lib/dataService';
import { supabase, mapCommissionToMonthlyRecord } from '@/lib/supabaseClient';
import { CommissionRecord } from '@/types/commission';
import { normalizeStateName, normalizeZoneName, normalizeDistName, parseMonthYearString, getDaysInMonth } from '@/lib/normalization';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || 'AUGUST 2026';
    const monthFrom = searchParams.get('monthFrom');
    const monthTo = searchParams.get('monthTo');
    const state = searchParams.get('state') || undefined;
    const zone = searchParams.get('zone') || undefined;
    const dist = searchParams.get('dist') || undefined;
    const baseBranch = searchParams.get('baseBranch') || undefined;

    const availablePeriods = await getAvailablePeriods();
    let targetMonths: string[] = [];

    if (month && month !== 'ALL') {
      targetMonths = [month];
    } else if (monthFrom && monthTo) {
      const fromParsed = parseMonthYearString(monthFrom);
      const toParsed = parseMonthYearString(monthTo);
      targetMonths = availablePeriods
        .filter((p) => {
          const pVal = p.year * 100 + p.month;
          const fromVal = fromParsed.year * 100 + fromParsed.month;
          const toVal = toParsed.year * 100 + toParsed.month;
          return pVal >= Math.min(fromVal, toVal) && pVal <= Math.max(fromVal, toVal);
        })
        .map((p) => p.month_year);
      if (targetMonths.length === 0) targetMonths = [monthFrom];
    } else {
      // Default to latest available month
      targetMonths = availablePeriods.length > 0 ? [availablePeriods[0].month_year] : ['AUGUST 2026'];
    }

    const records = await fetchAllMonthlyRecords({
      months: targetMonths,
      user,
      state,
      zone,
      dist,
      baseBranch,
    });

    const summaryMetrics = calculateSummaryMetrics(records);

    // Compute Reconciliation against Period records
    let expectedCount = 0;
    let expectedGross = 0;
    let isReconciled = true;

    targetMonths.forEach((m) => {
      const matchedPeriod = availablePeriods.find((p) => p.month_year === m);
      if (matchedPeriod && matchedPeriod.rows_count) {
        expectedCount += matchedPeriod.rows_count;
        if (matchedPeriod.gross_commission) {
          expectedGross += matchedPeriod.gross_commission;
        }
      }
    });

    if (expectedCount > 0 && !state && !zone && !dist && !baseBranch) {
      if (records.length !== expectedCount) {
        isReconciled = false;
      }
      if (expectedGross > 0 && Math.abs(summaryMetrics.totalNetCommission - expectedGross) > 1.0) {
        isReconciled = false;
      }
    }

    return NextResponse.json({
      success: true,
      total: records.length,
      records,
      summaryMetrics,
      reconciliation: {
        isReconciled,
        expectedCount: expectedCount || records.length,
        actualCount: records.length,
        expectedGross: expectedGross || summaryMetrics.totalNetCommission,
        actualGross: summaryMetrics.totalNetCommission,
        differenceGross: Number((summaryMetrics.totalNetCommission - (expectedGross || summaryMetrics.totalNetCommission)).toFixed(2)),
        statusText: isReconciled ? '100% Reconciled with Bank File' : 'Discrepancy detected with File',
      },
      periods: availablePeriods,
      selectedPeriod: targetMonths[0] || 'AUGUST 2026',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (user && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required for statement import' }, { status: 403 });
    }

    const body = await request.json();
    const rawRecords: CommissionRecord[] = body.records;
    const specifiedMonth: string = body.month || '';
    const specifiedYear: number = body.year || 2026;
    const specifiedDays: number = body.daysInMonth || 30;

    if (!rawRecords || rawRecords.length === 0) {
      return NextResponse.json({ error: 'No records provided' }, { status: 400 });
    }

    const targetMonthYear = specifiedMonth ? `${specifiedMonth.toUpperCase()} ${specifiedYear}` : rawRecords[0]?.statementMonth || 'AUGUST 2026';
    const parsedMeta = parseMonthYearString(targetMonthYear);
    const calendarDays = specifiedDays || getDaysInMonth(parsedMeta.year, parsedMeta.month);

    // 1. Calculate file totals
    let totalGross = 0;
    let totalBc = 0;
    let totalCorp = 0;

    const normalizedRecords = rawRecords.map((r) => {
      const net = Number(r.netCommission || 0);
      const bc = Number(r.bcComm || 0);
      const corp = Number(r.corpComm || 0);
      totalGross += net;
      totalBc += bc;
      totalCorp += corp;

      return {
        ...r,
        statementMonth: targetMonthYear,
        totalDaysInMonth: calendarDays,
        stateName: normalizeStateName(r.stateName),
        zoneName: normalizeZoneName(r.zoneName),
        dist: normalizeDistName(r.dist),
      };
    });

    // 2. Upsert Period record with accurate metadata
    await supabase.from('periods').upsert({
      month_year: targetMonthYear,
      year: parsedMeta.year,
      month: parsedMeta.month,
      days_in_month: calendarDays,
      uploaded_by: user?.username || 'admin',
      rows_count: normalizedRecords.length,
      gross_commission: totalGross,
      bc_commission: totalBc,
      uploaded_at: new Date().toISOString(),
    });

    // 3. Upsert Master Agents
    const agentRows = normalizedRecords.map((r) => ({
      agent_id: r.agentId,
      bca_name: r.bcaName,
      bank_agent_id: r.agentIdBank,
      date_of_joining: r.dateOfJoining,
      state_name: r.stateName,
      zone_name: r.zoneName,
      dist: r.dist,
      mandal: r.mandal,
      base_branch: r.baseBranch,
      sol_id: r.solId,
      village_name: r.villageName,
      location_type: r.locationType || 'RURAL',
      company_name: r.companyName || 'SANJIVANI',
      device_id: r.deviceId,
    }));

    for (let i = 0; i < agentRows.length; i += 100) {
      const chunk = agentRows.slice(i, i + 100);
      await supabase.from('agents').upsert(chunk);
    }

    // 4. Delete existing records for this statement month (Atomic replacement)
    await supabase.from('monthly_records').delete().eq('month_year', targetMonthYear);

    // 5. Insert monthly records in batches
    const dbRows = normalizedRecords.map(mapCommissionToMonthlyRecord);
    for (let i = 0; i < dbRows.length; i += 100) {
      const chunk = dbRows.slice(i, i + 100);
      const { error } = await supabase.from('monthly_records').insert(chunk);
      if (error) {
        throw new Error(`Database save failure: ${error.message}`);
      }
    }

    // 6. Record Audit Log
    await logAuditEvent(
      user?.username || 'admin',
      'IMPORT_STATEMENT',
      `Imported ${normalizedRecords.length} BCAs for ${targetMonthYear} (Gross: Rs. ${totalGross.toFixed(2)})`
    );

    return NextResponse.json({
      success: true,
      month: targetMonthYear,
      inserted: normalizedRecords.length,
      grossCommission: totalGross,
      bcCommission: totalBc,
      reconciled: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save statement' }, { status: 500 });
  }
}
