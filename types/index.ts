// ============================================
// Frontend-specific types
// Re-export shared types + FE-only extensions
// ============================================

export type {
  CarrierId,
  NormalizedStatus,
  OrderRow,
  TrackingHistory,
  TrackingResult,
  CreateOrderRequest,
  CarrierInfo,
  ProfileRow,
  UserRole,
  UserStatus,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '@shared';

/** State của form thêm đơn hàng */
export interface AddOrderFormState {
  carrier: import('@shared').CarrierId | '';
  tracking_code: string;
  phone: string;
  note: string;
}

/** Filter và sort options cho danh sách đơn */
export type SortField = 'created_at' | 'updated_at' | 'normalized_status';
export type SortDirection = 'asc' | 'desc';

export interface OrderFilters {
  status: string; // key trong STATUS_GROUPS
  sort: SortField;
  direction: SortDirection;
  search: string;
}

/** Stat card dùng trong dashboard */
export interface StatCard {
  label: string;
  value: number;
  icon: string;
  color: string;
}
