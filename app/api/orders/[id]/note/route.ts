import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateOrderNote } from '@/lib/backend/orderService';

const UpdateNoteSchema = z.object({
  note: z.string().max(200),
  user_id: z.string().uuid(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = UpdateNoteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu không hợp lệ', details: result.error.format() },
        { status: 400 }
      );
    }

    const order = await updateOrderNote(id, result.data.user_id, result.data.note);
    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error('[API Orders PATCH note] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
