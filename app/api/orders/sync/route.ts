import { NextResponse } from 'next/server';
import { supabase } from '@/lib/backend/supabase';
import { syncOrder } from '@/lib/backend/orderService';
import type { OrderRow } from '@shared';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id là bắt buộc' },
        { status: 400 }
      );
    }

    // Lấy tất cả đơn hàng của user
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, normalized_status')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Không thể lấy danh sách đơn: ${error.message}`);
    }

    // Lọc ra các đơn hàng chưa hoàn thành (chưa giao, chưa hoàn)
    const activeOrders = (orders as OrderRow[] || []).filter(
      (o) => !['delivered', 'returned'].includes(o.normalized_status)
    );

    // Kích hoạt đối soát đồng thời cho tất cả các đơn đang hoạt động
    const syncPromises = activeOrders.map((o) =>
      syncOrder(o.id).catch((err) =>
        console.error(`[Manual-Sync] Lỗi đối soát đơn ${o.id}:`, err.message)
      )
    );

    await Promise.all(syncPromises);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API Orders Sync] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
