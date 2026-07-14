import { NextResponse } from 'next/server';
import { getUserProfile, updateOwnProfile } from '@/lib/backend/userService';

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

    const profile = await getUserProfile(userId);
    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error('[API Users Profile GET] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const { full_name, phone } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id là bắt buộc' },
        { status: 400 }
      );
    }

    if (!full_name) {
      return NextResponse.json(
        { success: false, error: 'full_name là bắt buộc' },
        { status: 400 }
      );
    }

    const profile = await updateOwnProfile(userId, full_name, phone);
    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error('[API Users Profile PUT] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
