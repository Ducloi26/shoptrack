import { NextResponse } from 'next/server';
import { deleteOrder } from '@/lib/backend/orderService';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id là bắt buộc' },
        { status: 400 }
      );
    }

    await deleteOrder(id, userId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API Orders DELETE] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
