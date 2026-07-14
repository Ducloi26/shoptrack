import { NextResponse } from 'next/server';
import { updateProfileStatus } from '@/lib/backend/userService';
import type { UserStatus } from '@shared';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const { admin_id, status } = await request.json();

    if (!admin_id || !status) {
      return NextResponse.json(
        { success: false, error: 'admin_id và status là bắt buộc' },
        { status: 400 }
      );
    }

    const profile = await updateProfileStatus(admin_id, targetUserId, status as UserStatus);
    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error('[API Users Status PATCH] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
