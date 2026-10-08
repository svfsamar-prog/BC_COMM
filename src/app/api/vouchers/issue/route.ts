import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';
import { roundRupees, getStatementMonthCode } from '@/lib/pdf/format';

export const dynamic = 'force-dynamic';

const SECRET_KEY = process.env.SECRET_KEY || 'sanjivani_super_secret_jwt_key_2026_finance_portal';
const VERIFY_BASE_URL = process.env.NEXT_PUBLIC_VERIFY_BASE_URL || 'https://bc-comm.vercel.app';

function generateShortCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

function computeSignature(payload: { voucherNo: string; agentId: string; month: string; payout: number; version: number }): string {
  const data = `${payload.voucherNo}|${payload.agentId}|${payload.month}|${payload.payout}|${payload.version}`;
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex').substring(0, 32);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: Array<{
      agentId: string;
      bcaName: string;
      villageName?: string;
      statementMonth: string;
      grossCommission: number;
      bcComm: number;
      corpComm: number;
    }> = body.items || [body];

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const results = [];

    for (const item of items) {
      const monthCode = getStatementMonthCode(item.statementMonth);
      const voucherNo = `SVF/${monthCode}/${item.agentId}`;
      const roundedPayout = roundRupees(item.bcComm);
      const roundedGross = roundRupees(item.grossCommission);
      const roundedCorp = roundRupees(item.corpComm);

      const dataHash = crypto
        .createHash('sha256')
        .update(`${item.agentId}|${item.statementMonth}|${roundedPayout}|${roundedGross}`)
        .digest('hex');

      // Check existing in Supabase
      const { data: existing } = await supabase
        .from('voucher_registry')
        .select('*')
        .eq('voucher_no', voucherNo)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      let version = 1;
      let shortCode = generateShortCode();
      let status = 'valid';

      if (existing) {
        if (existing.data_hash === dataHash && existing.status !== 'revoked') {
          // Exactly same data, return existing token
          results.push({
            voucherNo: existing.voucher_no,
            token: existing.token,
            shortCode: existing.short_code,
            verifyUrl: `${VERIFY_BASE_URL}/verify/${encodeURIComponent(existing.voucher_no)}?t=${existing.token}`,
            version: existing.version,
            status: existing.status,
            payableAmount: roundedPayout,
          });
          continue;
        } else if (existing.status !== 'revoked') {
          // Data changed, bump version and supersede previous
          version = (existing.version || 1) + 1;
          await supabase.from('voucher_registry').update({ status: 'superseded' }).eq('voucher_no', voucherNo);
        }
      }

      const token = computeSignature({
        voucherNo,
        agentId: item.agentId,
        month: item.statementMonth,
        payout: roundedPayout,
        version,
      });

      const registryRecord = {
        voucher_no: voucherNo,
        agent_id: item.agentId,
        bca_name: item.bcaName,
        village_name: item.villageName || '',
        statement_month: item.statementMonth,
        gross_commission: roundedGross,
        bc_payout: roundedPayout,
        corporate_share: roundedCorp,
        data_hash: dataHash,
        version,
        token,
        short_code: shortCode,
        status,
        issued_at: new Date().toISOString(),
        issued_by: 'admin',
      };

      await supabase.from('voucher_registry').upsert(registryRecord);

      results.push({
        voucherNo,
        token,
        shortCode,
        verifyUrl: `${VERIFY_BASE_URL}/verify/${encodeURIComponent(voucherNo)}?t=${token}`,
        version,
        status,
        payableAmount: roundedPayout,
      });
    }

    return NextResponse.json({
      success: true,
      vouchers: results,
    });
  } catch (error: any) {
    console.error('Voucher issue error:', error);
    return NextResponse.json({ error: error.message || 'Failed to issue vouchers' }, { status: 500 });
  }
}
