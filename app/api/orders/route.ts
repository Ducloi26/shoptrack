import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserOrders, createOrder } from '@/lib/backend/orderService';
import type { CarrierId } from '@shared';

const AddOrderSchema = z.object({
  carrier: z.enum(['SPX', 'GHN', 'GHTK', 'JT', 'VTP', 'NJV', 'BEST'] as [CarrierId, ...CarrierId[]]),
  tracking_code: z.string().min(5).max(50).trim(),
  phone: z.string().optional(),
  user_id: z.string().uuid(),
  note: z.string().max(200).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id là bắt buộc' },
        { status: 400 }
      );
    }

    const orders = await getUserOrders(userId);
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    console.error('[API Orders GET] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = AddOrderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', details: result.error.format() },
        { status: 400 }
      );
    }

    const order = await createOrder(result.data);
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: any) {
    console.error('[API Orders POST] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
