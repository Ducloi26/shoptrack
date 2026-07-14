import { NextResponse } from 'next/server';
import { registerUserAccount } from '@/lib/backend/userService';

export async function POST(request: Request) {
  try {
    const { email, password, full_name, phone } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email là bắt buộc' },
        { status: 400 }
      );
    }

    const profile = await registerUserAccount(email, password, full_name, phone);
    return NextResponse.json({
      success: true,
      profile,
      token: 'temp-pending-token', // Cấp token tạm thời cho tài khoản đang chờ duyệt
    });
  } catch (err: any) {
    console.error('[API Users Register] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 400 }
    );
  }
}
