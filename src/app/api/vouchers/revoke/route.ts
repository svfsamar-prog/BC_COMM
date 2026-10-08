import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { voucherNo, reason } = body;

    if (!voucherNo) {
      return NextResponse.json({ error: 'Voucher number is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('voucher_registry')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revoked_reason: reason || 'Revoked by administrative authority',
      })
      .eq('voucher_no', voucherNo);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      voucherNo,
      status: 'revoked',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to revoke voucher' }, { status: 500 });
  }
}
