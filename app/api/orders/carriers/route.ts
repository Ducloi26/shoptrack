import { NextResponse } from 'next/server';
import { getSupportedCarriers } from '@/lib/backend/carriers/registry';

export async function GET() {
  try {
    const carriers = getSupportedCarriers();
    return NextResponse.json({ success: true, carriers });
  } catch (err: any) {
    console.error('[API Carriers GET] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
