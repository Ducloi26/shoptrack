import { NextResponse } from 'next/server';
import { supabase } from '@/lib/backend/supabase';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Bảo mật: chỉ cho phép Vercel Cron
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Vercel Cron] Running daily cleanup...');
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const { error, count } = await supabase
      .from('orders')
      .delete({ count: 'exact' })
      .in('normalized_status', ['delivered', 'returned', 'failed'])
      .lt('completed_at', threeDaysAgo);

    if (error) {
      throw new Error(`Dọn dẹp DB thất bại: ${error.message}`);
    }

    console.log(`[Vercel Cron] Đã dọn dẹp ${count} đơn hàng hoàn thành quá 3 ngày`);
    return NextResponse.json({ success: true, deleted: count });
  } catch (err: any) {
    console.error('[Vercel Cron Cleanup] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
