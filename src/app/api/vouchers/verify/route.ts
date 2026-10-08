import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const SECRET_KEY = process.env.SECRET_KEY || 'sanjivani_super_secret_jwt_key_2026_finance_portal';

function computeSignature(payload: { voucherNo: string; agentId: string; month: string; payout: number; version: number }): string {
  const data = `${payload.voucherNo}|${payload.agentId}|${payload.month}|${payload.payout}|${payload.version}`;
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex').substring(0, 32);
}

// Mask Agent ID for privacy (e.g. 15385 -> ***85)
function maskAgentId(id: string): string {
  if (!id) return '***';
  if (id.length <= 3) return '***';
  return `***${id.substring(id.length - 2)}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const voucherNo = searchParams.get('v') || searchParams.get('voucherNo');
    const token = searchParams.get('t') || searchParams.get('token');
    const shortCode = searchParams.get('c') || searchParams.get('code');

    if (!voucherNo && !shortCode) {
      return NextResponse.json({ status: 'invalid', message: 'Voucher number or short code is required.' }, { status: 400 });
    }

    let query = supabase.from('voucher_registry').select('*');

    if (voucherNo) {
      query = query.eq('voucher_no', voucherNo);
    } else if (shortCode) {
      query = query.eq('short_code', shortCode.toUpperCase().trim());
    }

    const { data: record, error } = await query.order('version', { ascending: false }).limit(1).maybeSingle();

    if (error || !record) {
      return NextResponse.json({
        status: 'not_found',
        message: 'This voucher was not found in the Sanjivani Vikas Foundation registry.',
      });
    }

    // Verify cryptographic signature if token provided
    if (token) {
      const expectedToken = computeSignature({
        voucherNo: record.voucher_no,
        agentId: record.agent_id,
        month: record.statement_month,
        payout: Number(record.bc_payout),
        version: record.version,
      });

      if (token !== expectedToken && token !== record.token) {
        return NextResponse.json({
          status: 'invalid',
          message: 'Voucher cryptographic signature mismatch. The voucher data may have been altered.',
          voucherNo: record.voucher_no,
        });
      }
    }

    // Return safe, privacy-protected verification payload
    return NextResponse.json({
      status: record.status || 'valid',
      voucherNo: record.voucher_no,
      statementMonth: record.statement_month,
      issueDate: record.issued_at,
      bcaName: record.bca_name,
      maskedAgentId: maskAgentId(record.agent_id),
      villageName: record.village_name || '—',
      payableAmount: Number(record.bc_payout),
      version: record.version,
      shortCode: record.short_code,
    });
  } catch (error: any) {
    console.error('Voucher verification error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error while verifying voucher' }, { status: 500 });
  }
}
