import { NextResponse } from 'next/server';
import { INITIAL_COMMISSION_RECORDS } from '@/lib/preloadedData';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const state = searchParams.get('state');
    const district = searchParams.get('district');

    // Default to preloaded dataset with optional Supabase live sync
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

    let totalAccounts = 0;
    let totalTxn = 0;
    let totalTxnVol = 0;
    let totalApy = 0;
    let totalSby = 0;
    let totalJby = 0;
    let totalNetComm = 0;
    let totalBcComm = 0;
    let totalCorpComm = 0;
    let totalLoginPct = 0;

    list.forEach((r) => {
      totalAccounts += r.totalNoOfAcctOpn || 0;
      totalTxn += r.financialTxn || 0;
      totalTxnVol += r.txnAmt || 0;
      totalApy += r.apyCount || 0;
      totalSby += r.sbyCount || 0;
      totalJby += r.jbyCount || 0;
      totalNetComm += r.netCommission || 0;
      totalBcComm += r.bcComm || 0;
      totalCorpComm += r.corpComm || 0;
      totalLoginPct += r.loginPercentage || 0;
    });

    const avgLoginPercentage = list.length > 0 ? totalLoginPct / list.length : 0;

    return NextResponse.json({
      totalAgents: list.length,
      avgLoginPercentage: Number(avgLoginPercentage.toFixed(2)),
      totalAccountsOpened: totalAccounts,
      totalTxnCount: totalTxn,
      totalTxnVolume: totalTxnVol,
      totalApyCount: totalApy,
      totalSbyCount: totalSby,
      totalJbyCount: totalJby,
      totalNetCommission: Number(totalNetComm.toFixed(2)),
      totalBcCommission: Number(totalBcComm.toFixed(2)),
      totalCorpCommission: Number(totalCorpComm.toFixed(2)),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
