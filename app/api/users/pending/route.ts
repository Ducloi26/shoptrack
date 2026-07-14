import { NextResponse } from 'next/server';
import { getProfilesByStatus } from '@/lib/backend/userService';
import type { UserStatus } from '@shared';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('admin_id');
    const status = (searchParams.get('status') || 'pending') as UserStatus;

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: 'admin_id là bắt buộc' },
        { status: 400 }
      );
    }

    const profiles = await getProfilesByStatus(adminId, status);
    return NextResponse.json({ success: true, profiles });
  } catch (err: any) {
    console.error('[API Users Pending GET] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
