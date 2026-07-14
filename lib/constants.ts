import type { CarrierId, NormalizedStatus } from '@shared';

// ============================================
// Re-export từ shared để FE không phải import từ ../../shared
// ============================================
export { CARRIERS, STATUS_LABELS, STATUS_COLORS, POLL_INTERVAL_MINUTES } from '@shared';

// ============================================
// Frontend-only constants
// ============================================

/** User ID tạm (sẽ được thay bằng Supabase Auth sau) */
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

/** Polling interval cho real-time update (ms) */
export const FRONTEND_POLL_INTERVAL_MS = 60_000; // 60 giây

/** Max ký tự ghi chú */
export const MAX_NOTE_LENGTH = 200;

/** Danh sách carrier với thứ tự hiển thị trong dropdown */
export const CARRIER_OPTIONS: Array<{ id: CarrierId; name: string; color: string }> = [
  { id: 'SPX',  name: 'Shopee Express',       color: '#EE4D2D' },
  { id: 'GHN',  name: 'Giao Hàng Nhanh',      color: '#FD5C00' },
  { id: 'GHTK', name: 'Giao Hàng Tiết Kiệm',  color: '#2E7D32' },
  { id: 'JT',   name: 'J&T Express',          color: '#C8102E' },
  { id: 'VTP',  name: 'Viettel Post',         color: '#0055A5' },
  { id: 'NJV',  name: 'Ninja Van',            color: '#6C3BC5' },
  { id: 'BEST', name: 'Best Express',         color: '#0066CC' },
];

/** Status nhóm cho filter */
export const STATUS_GROUPS: Record<string, NormalizedStatus[]> = {
  'Tất cả': ['pending', 'picked_up', 'in_transit', 'delivering', 'delivered', 'returned', 'failed', 'unknown'],
  'Đang vận chuyển': ['pending', 'picked_up', 'in_transit', 'delivering'],
  'Hoàn thành': ['delivered'],
  'Có vấn đề': ['returned', 'failed'],
};

/** Biểu tượng status */
export const STATUS_ICONS: Record<NormalizedStatus, string> = {
  pending:    '⏳',
  picked_up:  '📦',
  in_transit: '🚚',
  delivering: '🛵',
  delivered:  '✅',
  returned:   '↩️',
  failed:     '❌',
  unknown:    '❓',
};
