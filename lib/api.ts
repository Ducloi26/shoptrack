import type {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersResponse,
  OrderRow,
  ProfileRow,
  UserStatus,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from '@shared';

// ============================================
// API Client — tất cả calls đến backend
// ============================================
const BASE_URL = '';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.error || 'Lỗi không xác định', data.code);
  }

  return data as T;
}

// ============================================
// Orders API
// ============================================

/** Lấy danh sách đơn hàng của user */
export async function getOrders(userId: string): Promise<OrderRow[]> {
  const data = await fetchApi<GetOrdersResponse>(
    `/api/orders?user_id=${encodeURIComponent(userId)}`,
  );
  return data.orders;
}

/** Thêm đơn hàng mới */
export async function createOrder(body: CreateOrderRequest): Promise<OrderRow> {
  const data = await fetchApi<CreateOrderResponse>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data.order;
}

/** Xoá đơn hàng */
export async function deleteOrder(orderId: string, userId: string): Promise<void> {
  await fetchApi<{ success: boolean }>(
    `/api/orders/${orderId}?user_id=${encodeURIComponent(userId)}`,
    { method: 'DELETE' },
  );
}

/** Cập nhật ghi chú */
export async function updateNote(
  orderId: string,
  userId: string,
  note: string,
): Promise<OrderRow> {
  const data = await fetchApi<{ success: boolean; order: OrderRow }>(
    `/api/orders/${orderId}/note`,
    {
      method: 'PATCH',
      body: JSON.stringify({ note, user_id: userId }),
    },
  );
  return data.order;
}

// ============================================
// Users / Admin API
// ============================================

/** Lấy thông tin profile hiện tại */
export async function getUserProfile(userId: string): Promise<ProfileRow> {
  const data = await fetchApi<{ success: boolean; profile: ProfileRow }>(
    `/api/users/profile?user_id=${encodeURIComponent(userId)}`
  );
  return data.profile;
}

/** Cập nhật thông tin profile của bản thân */
export async function updateProfile(userId: string, fullName: string, phone?: string): Promise<ProfileRow> {
  const data = await fetchApi<{ success: boolean; profile: ProfileRow }>(
    `/api/users/profile?user_id=${encodeURIComponent(userId)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ full_name: fullName, phone }),
    }
  );
  return data.profile;
}

/** Lấy danh sách tài khoản theo trạng thái (chờ duyệt/đã duyệt...) dành cho Admin */
export async function getProfilesByStatus(adminId: string, status: UserStatus): Promise<ProfileRow[]> {
  const data = await fetchApi<{ success: boolean; profiles: ProfileRow[] }>(
    `/api/users/pending?admin_id=${encodeURIComponent(adminId)}&status=${status}`
  );
  return data.profiles;
}

/** Admin duyệt hoặc từ chối người dùng mới */
export async function reviewProfile(adminId: string, targetUserId: string, status: 'approved' | 'rejected'): Promise<ProfileRow> {
  const data = await fetchApi<{ success: boolean; profile: ProfileRow }>('/api/users/review', {
    method: 'POST',
    body: JSON.stringify({ admin_id: adminId, target_user_id: targetUserId, status }),
  });
  return data.profile;
}

// ============================================
// Auth API
// ============================================

/** Đăng ký tài khoản người dùng mới */
export async function registerAccount(body: RegisterRequest): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Đăng nhập tài khoản bằng email & password */
export async function loginAccount(body: LoginRequest): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export { ApiError };
