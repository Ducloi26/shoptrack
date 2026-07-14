import type { CarrierId, NormalizedStatus, TrackingResult } from '@shared';

// ============================================
// Interface chuẩn — mọi carrier PHẢI implement
// ============================================
export interface CarrierTracker {
  carrierId: CarrierId;
  fetchStatus(trackingCode: string, phone?: string): Promise<TrackingResult>;
}

// ============================================
// Helper: normalize status từ text carrier
// ============================================
export function guessNormalizedStatus(rawStatus: string): NormalizedStatus {
  const s = rawStatus.toLowerCase();
  
  // 1. Đã giao (Delivered) - Mức ưu tiên cao nhất
  if (s.includes('đã giao') || s.includes('delivered') || s.includes('thành công') || s.includes('successful')) return 'delivered';
  
  // 2. Trả hàng/Hoàn hàng (Returned)
  if (s.includes('hoàn') || s.includes('return')) return 'returned';
  
  // 3. Giao thất bại/Hủy (Failed)
  if (s.includes('thất bại') || s.includes('fail') || s.includes('không giao') || s.includes('canceled') || s.includes('unsuccessful')) return 'failed';
  
  // 4. Đang giao hàng (Delivering)
  if (s.includes('đang giao') || s.includes('delivering') || s.includes('out for delivery') || s.includes('courier')) return 'delivering';
  
  // 5. Đã lấy hàng (Picked Up)
  if (s.includes('đã lấy') || s.includes('picked') || s.includes('received')) return 'picked_up';
  
  // 6. Đang trung chuyển (In Transit) - Cụm từ chung chung 'hub', 'kho' kiểm tra sau
  if (s.includes('đang vận') || s.includes('vận chuyển') || s.includes('trung chuyển') || s.includes('transit') || s.includes('in transit') || s.includes('sorting') || s.includes('hub') || s.includes('soc') || s.includes('kho') || s.includes('bưu cục') || s.includes('departed') || s.includes('arrived')) return 'in_transit';
  
  // 7. Chờ lấy hàng (Pending)
  if (s.includes('chờ lấy') || s.includes('waiting') || s.includes('pending') || s.includes('created')) return 'pending';
  
  return 'unknown';
}
