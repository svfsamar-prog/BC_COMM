import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/serverAuth';
import { CommissionRecord } from '@/types/commission';
import { normalizeStateName, normalizeDistName, normalizeZoneName, parseMonthYearString } from '@/lib/normalization';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (user && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const records: CommissionRecord[] = body.records || [];
    const targetMonthYear: string = body.monthYear || 'AUGUST 2026';

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'No records provided for preview' }, { status: 400 });
    }

    // 1. Calculate File Totals
    let fileGross = 0;
    let fileBc = 0;
    let fileCorp = 0;
    const fileAgentIds = new Set<string>();

    records.forEach((r) => {
      fileGross += Number(r.netCommission || 0);
      fileBc += Number(r.bcComm || 0);
      fileCorp += Number(r.corpComm || 0);
      if (r.agentId) fileAgentIds.add(r.agentId.trim());
    });

    const fileTds = Number((fileBc * 0.02).toFixed(2));
    const fileNetPayable = Number((fileBc - fileTds).toFixed(2));

    // 2. Query known Master Agents
    const { data: knownAgents } = await supabase.from('agents').select('agent_id');
    const knownAgentIds = new Set((knownAgents || []).map((a) => a.agent_id));

    let newAgentsCount = 0;
    fileAgentIds.forEach((id) => {
      if (!knownAgentIds.has(id)) newAgentsCount++;
    });

    // 3. Find previous month to check missing agents
    const parsedTarget = parseMonthYearString(targetMonthYear);
    const { data: periods } = await supabase
      .from('periods')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    let previousMonthName: string | null = null;
    let missingFromPrevCount = 0;

    if (periods && periods.length > 0) {
      const prevPeriod = periods.find((p) => {
        const val = p.year * 100 + p.month;
        const targetVal = parsedTarget.year * 100 + parsedTarget.month;
        return val < targetVal;
      });

      if (prevPeriod) {
        previousMonthName = prevPeriod.month_year;
        const { data: prevMonthRecords } = await supabase
          .from('monthly_records')
          .select('agent_id')
          .eq('month_year', prevPeriod.month_year);

        if (prevMonthRecords) {
          prevMonthRecords.forEach((r) => {
            if (!fileAgentIds.has(r.agent_id)) missingFromPrevCount++;
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        targetMonthYear,
        totalAgentsFound: records.length,
        newAgentsCount,
        missingFromPreviousMonthCount: missingFromPrevCount,
        previousMonthName: previousMonthName || 'None',
        fileTotals: {
          grossCommission: Number(fileGross.toFixed(2)),
          bcCommission: Number(fileBc.toFixed(2)),
          corpCommission: Number(fileCorp.toFixed(2)),
          tdsDeduction: fileTds,
          netPayable: fileNetPayable,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Preview generation failed' }, { status: 500 });
  }
}
