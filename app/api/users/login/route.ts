import { NextResponse } from 'next/server';
import { loginUserAccount } from '@/lib/backend/userService';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email là bắt buộc' },
        { status: 400 }
      );
    }

    const result = await loginUserAccount(email, password);
    return NextResponse.json({
      success: true,
      profile: result.profile,
      token: result.token,
    });
  } catch (err: any) {
    console.error('[API Users Login] Error:', err.message);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 401 }
    );
  }
}
