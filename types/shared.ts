// ============================================
// Shared Types — Bản sao cục bộ cho Frontend (Tránh lỗi Turbopack Windows)
// ============================================

export type CarrierId = 'SPX' | 'GHN' | 'GHTK' | 'JT' | 'VTP' | 'NJV' | 'BEST';

export type NormalizedStatus =
  | 'pending'       // Chờ lấy hàng
  | 'picked_up'     // Đã lấy hàng
  | 'in_transit'    // Đang vận chuyển
  | 'delivering'    // Đang giao đến bạn
  | 'delivered'     // Đã giao thành công
  | 'returned'      // Hoàn về shop
  | 'failed'        // Giao thất bại
  | 'unknown';      // Không xác định

export interface TrackingHistory {
  time: string; // ISO 8601
  description: string;
  location?: string;
}

export interface TrackingResult {
  rawStatus: string;
  normalizedStatus: NormalizedStatus;
  history: TrackingHistory[];
  updatedAt: string;
}

// Database row shape (Supabase)
export interface OrderRow {
  id: string;
  user_id: string;
  carrier: CarrierId;
  tracking_code: string;
  phone?: string;
  normalized_status: NormalizedStatus;
  raw_status?: string;
  history: TrackingHistory[];
  completed_at?: string;
  last_checked_at?: string;
  created_at: string;
  updated_at: string;
  note?: string;
}

export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// ============================================
// Polling interval (phút) theo trạng thái
// ============================================
export const POLL_INTERVAL_MINUTES: Record<NormalizedStatus, number> = {
  pending: 480,       // 8 tiếng
  picked_up: 240,     // 4 tiếng
  in_transit: 180,    // 3 tiếng
  delivering: 30,     // 30 phút
  delivered: 0,       // Dừng check
  returned: 0,        // Dừng check
  failed: 120,        // 2 tiếng
  unknown: 360,       // 6 tiếng
};

// ============================================
// Carrier metadata
// ============================================
export const CARRIERS: Record<CarrierId, { name: string; color: string; logo?: string }> = {
  SPX:  { name: 'Shopee Express',        color: '#EE4D2D' },
  GHN:  { name: 'Giao Hàng Nhanh',       color: '#FD5C00' },
  GHTK: { name: 'Giao Hàng Tiết Kiệm',   color: '#2E7D32' },
  JT:   { name: 'J&T Express',           color: '#C8102E' },
  VTP:  { name: 'Viettel Post',          color: '#0055A5' },
  NJV:  { name: 'Ninja Van',             color: '#6C3BC5' },
  BEST: { name: 'Best Express',          color: '#0066CC' },
};

export const STATUS_LABELS: Record<NormalizedStatus, string> = {
  pending:    'Chờ lấy hàng',
  picked_up:  'Đã lấy hàng',
  in_transit: 'Đang vận chuyển',
  delivering: 'Đang giao đến bạn',
  delivered:  'Đã giao thành công',
  returned:   'Hoàn về shop',
  failed:     'Giao thất bại',
  unknown:    'Không xác định',
};

export const STATUS_COLORS: Record<NormalizedStatus, { bg: string; text: string; dot: string }> = {
  pending:    { bg: '#FFF3CD', text: '#856404', dot: '#FFC107' },
  picked_up:  { bg: '#CCE5FF', text: '#004085', dot: '#007BFF' },
  in_transit: { bg: '#D4EDDA', text: '#155724', dot: '#28A745' },
  delivering: { bg: '#D1ECF1', text: '#0C5460', dot: '#17A2B8' },
  delivered:  { bg: '#D4EDDA', text: '#155724', dot: '#198754' },
  returned:   { bg: '#F8D7DA', text: '#721C24', dot: '#DC3545' },
  failed:     { bg: '#F8D7DA', text: '#721C24', dot: '#DC3545' },
  unknown:    { bg: '#E2E3E5', text: '#383D41', dot: '#6C757D' },
};

// ============================================
// API Response types (dùng chung FE & BE)
// ============================================

/** Wrapper chuẩn cho mọi API response */
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/** Response cho GET /api/orders */
export interface GetOrdersResponse {
  success: boolean;
  orders: OrderRow[];
}

/** Request body cho POST /api/orders */
export interface CreateOrderRequest {
  carrier: CarrierId;
  tracking_code: string;
  phone?: string;
  user_id: string;
  note?: string;
}

/** Response cho POST /api/orders */
export interface CreateOrderResponse {
  success: boolean;
  order: OrderRow;
}

/** Request body cho PATCH /api/orders/:id/note */
export interface UpdateNoteRequest {
  note: string;
  user_id: string;
}

/** Carrier info cho UI */
export interface CarrierInfo {
  id: CarrierId;
  name: string;
  color: string;
}

/** Auth Request/Response types */
export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  profile: ProfileRow;
  token?: string;
}
