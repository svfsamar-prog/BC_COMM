import { NextResponse } from 'next/server';
import { parseCommissionWorkbook } from '@/lib/parser';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const month = formData.get('month') as string | null;
    const yearStr = formData.get('year') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const year = yearStr ? parseInt(yearStr, 10) : 2026;
    const records = parseCommissionWorkbook(buffer, file.name, month || undefined, year);

    return NextResponse.json({
      success: true,
      filename: file.name,
      count: records.length,
      records,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process statement' }, { status: 500 });
  }
}
