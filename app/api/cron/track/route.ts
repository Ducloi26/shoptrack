import { NextResponse } from 'next/server';
import { supabase } from '@/lib/backend/supabase';
import { syncOrder } from '@/lib/backend/orderService';
import { POLL_INTERVAL_MINUTES } from '@shared';
import type { OrderRow } from '@shared';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Bảo mật: chỉ cho phép Vercel Cron (hoặc dev chạy thử với secret tương ứng)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Vercel Cron] Running background tracking check...');
    const now = new Date();

    // Lấy tất cả các đơn hàng chưa hoàn thành (chưa giao, chưa chuyển hoàn)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .not('normalized_status', 'in', '("delivered","returned")');

    if (error) {
      throw new Error(`Không thể lấy danh sách đơn: ${error.message}`);
    }

    let enqueued = 0;
    const syncPromises = [];

    for (const order of (orders as OrderRow[]) || []) {
      const intervalMin = POLL_INTERVAL_MINUTES[order.normalized_status] ?? 360;
      const lastChecked = order.last_checked_at
        ? new Date(order.last_checked_at)
        : new Date(0);
      const minutesSince = (now.getTime() - lastChecked.getTime()) / 60000;

      // Nếu đã đến thời gian đối soát
      if (minutesSince >= intervalMin) {
        enqueued++;
        // Chạy song song đối soát trực tiếp với nhà vận chuyển
        syncPromises.push(
          syncOrder(order.id).catch((err) =>
            console.error(`[Vercel Cron] Lỗi đối soát đơn ${order.tracking_code}:`, err.message)
          )
        );
      }
    }

    await Promise.all(syncPromises);
    console.log(`[Vercel Cron] Đã hoàn thành đối soát ${enqueued} đơn hàng`);

    return NextResponse.json({ success: true, checked: enqueued });
  } catch (err: any) {
    console.error('[Vercel Cron Track] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic'; // Chặn Next.js static cache endpoint này
