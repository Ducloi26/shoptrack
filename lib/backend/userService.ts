import { supabase } from './supabase';
import type { ProfileRow, UserRole, UserStatus } from '@shared';

/**
 * Lấy profile tài khoản từ DB.
 * Nếu chưa tồn tại trong bảng `profiles` (do trigger Supabase trễ), tự động tạo bản ghi mới ở trạng thái "pending".
 */
export async function getUserProfile(userId: string): Promise<ProfileRow> {
  let { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  let retryCount = 0;
  while (error && error.code === 'PGRST303' && retryCount < 3) {
    retryCount++;
    console.warn(`[Supabase] Lệch đồng hồ hệ thống (PGRST303), thử lại lần ${retryCount} sau 1s cho user ${userId}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const retryResult = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    profile = retryResult.data;
    error = retryResult.error;
  }

  if (error) {
    if (error.code !== 'PGRST116') {
      throw new Error(`Lỗi truy vấn hồ sơ: ${error.message} (code: ${error.code})`);
    }

    // Không tìm thấy hồ sơ -> Tự động khởi tạo profile "pending" từ Auth metadata
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      throw new Error('Không tìm thấy người dùng này trên hệ thống auth');
    }

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: authUser.user.user_metadata?.full_name || 'Người dùng mới',
        email: authUser.user.email || 'demo@email.com',
        phone: authUser.user.user_metadata?.phone || '',
        role: 'user',
        status: 'pending',
      })
      .select()
      .single();

    if (createError) {
      // Race condition
      if (createError.code === '23505') {
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (!retryError && retryProfile) {
          return retryProfile as ProfileRow;
        }
      }
      throw new Error(`Lỗi khởi tạo hồ sơ: ${createError.message}`);
    }

    return newProfile as ProfileRow;
  }

  return profile as ProfileRow;
}

/**
 * Lấy danh sách tài khoản theo trạng thái duyệt (cho Admin)
 */
export async function getProfilesByStatus(adminId: string, status: UserStatus): Promise<ProfileRow[]> {
  const adminProfile = await getUserProfile(adminId);
  if (adminProfile.role !== 'admin') {
    throw new Error('Bạn không có quyền truy cập chức năng này');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Không thể lấy danh sách: ${error.message}`);
  }

  return (data as ProfileRow[]) ?? [];
}

/**
 * Cập nhật trạng thái duyệt người dùng (Duyệt / Từ chối)
 */
export async function updateProfileStatus(
  adminId: string,
  targetUserId: string,
  newStatus: UserStatus
): Promise<ProfileRow> {
  const adminProfile = await getUserProfile(adminId);
  if (adminProfile.role !== 'admin') {
    throw new Error('Bạn không có quyền thực hiện hành động này');
  }

  if (adminId === targetUserId) {
    throw new Error('Bạn không thể tự cập nhật trạng thái của chính mình');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', targetUserId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Không tìm thấy tài khoản người dùng cần duyệt');
  }

  return data as ProfileRow;
}

/**
 * Cập nhật thông tin profile của bản thân
 */
export async function updateOwnProfile(
  userId: string,
  fullName: string,
  phone?: string
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Không thể cập nhật hồ sơ: ${error?.message || 'Không tìm thấy hồ sơ'}`);
  }

  return data as ProfileRow;
}

/**
 * Cập nhật quyền hạn (role) người dùng
 */
export async function updateProfileRole(
  adminId: string,
  targetUserId: string,
  newRole: UserRole
): Promise<ProfileRow> {
  const adminProfile = await getUserProfile(adminId);
  if (adminProfile.role !== 'admin') {
    throw new Error('Bạn không có quyền thực hiện hành động này');
  }

  if (adminId === targetUserId) {
    throw new Error('Bạn không thể tự cập nhật quyền hạn của chính mình');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', targetUserId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Không tìm thấy tài khoản người dùng cần cập nhật quyền hạn');
  }

  return data as ProfileRow;
}

/**
 * Đăng ký tài khoản mới qua Supabase Auth Admin API (tự động verify email)
 */
export async function registerUserAccount(
  email: string,
  password?: string,
  fullName?: string,
  phone?: string
): Promise<ProfileRow> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: password || '123456',
    email_confirm: true,
    user_metadata: { full_name: fullName, phone },
  });

  if (error || !data.user) {
    throw new Error(`Không thể đăng ký tài khoản: ${error?.message || 'Lỗi không xác định'}`);
  }

  return getUserProfile(data.user.id);
}

/**
 * Đăng nhập tài khoản bằng Email/Password
 */
export async function loginUserAccount(
  email: string,
  password?: string
): Promise<{ profile: ProfileRow; token?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password || '123456',
  });

  if (error || !data.user || !data.session) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const profile = await getUserProfile(data.user.id);
  return {
    profile,
    token: data.session.access_token,
  };
}
