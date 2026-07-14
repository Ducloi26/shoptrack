import { NextResponse } from 'next/server';
import { updateProfileRole } from '@/lib/backend/userService';
import type { UserRole } from '@shared';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const { admin_id, role } = await request.json();

    if (!admin_id || !role) {
      return NextResponse.json(
        { success: false, error: 'admin_id và role là bắt buộc' },
        { status: 400 }
      );
    }

    const profile = await updateProfileRole(admin_id, targetUserId, role as UserRole);
    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error('[API Users Role PATCH] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
