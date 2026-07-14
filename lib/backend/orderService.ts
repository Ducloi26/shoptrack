import { supabase } from './supabase';
import { getTracker } from './carriers/registry';
import type { CarrierId, OrderRow } from '@shared';

export interface CreateOrderInput {
  user_id: string;
  carrier: CarrierId;
  tracking_code: string;
  phone?: string;
  note?: string;
}

/**
 * Đối soát đơn hàng cụ thể từ nhà vận chuyển và lưu vào DB
 */
export async function syncOrder(orderId: string): Promise<OrderRow> {
  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (fetchErr || !order) {
    throw new Error(`Không tìm thấy đơn hàng: ${orderId}`);
  }

  const tracker = getTracker(order.carrier);
  if (!tracker) {
    console.warn(`[Sync] Không hỗ trợ carrier: ${order.carrier}`);
    return order as OrderRow;
  }

  // Lấy trạng thái hành trình mới nhất từ hãng vận chuyển
  const result = await tracker.fetchStatus(order.tracking_code, order.phone);

  const isTerminal = ['delivered', 'returned', 'failed'].includes(result.normalizedStatus);

  const { data: updated, error: updateErr } = await supabase
    .from('orders')
    .update({
      normalized_status: result.normalizedStatus,
      raw_status: result.rawStatus,
      history: result.history,
      last_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(isTerminal && !order.completed_at && { completed_at: new Date().toISOString() }),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (updateErr || !updated) {
    throw new Error(`Không thể cập nhật đơn hàng: ${updateErr?.message}`);
  }

  return updated as OrderRow;
}

/**
 * Lấy danh sách đơn hàng của user (có tự động trigger sync chạy ngầm nếu quá 10s chưa check)
 */
export async function getUserOrders(userId: string): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Không thể lấy danh sách đơn: ${error.message}`);
  }

  const orders = (data as OrderRow[]) ?? [];

  // Tự động kiểm tra cập nhật các đơn hàng chưa hoàn thành (chạy nền)
  const now = new Date();
  for (const order of orders) {
    const isTerminal = ['delivered', 'returned', 'failed'].includes(order.normalized_status);
    if (isTerminal) continue;

    const lastChecked = order.last_checked_at ? new Date(order.last_checked_at) : new Date(0);
    const diffMs = now.getTime() - lastChecked.getTime();

    // Nếu đơn chưa bao giờ check thành công hoặc đã quá 10 giây chưa được đối soát lại
    if (order.normalized_status === 'unknown' || diffMs > 10 * 1000) {
      // Fire-and-forget check chạy ngầm (Serverless có thể bị timeout nhưng vẫn chạy tốt ở dev local)
      syncOrder(order.id).catch((err) => 
        console.error(`[Auto-Sync] Lỗi trigger check đơn ${order.tracking_code}:`, err.message)
      );
    }
  }

  return orders;
}

/**
 * Tạo đơn hàng mới và thực hiện đồng bộ ngay lập tức trước khi trả về
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderRow> {
  const { user_id, carrier, tracking_code, phone, note } = input;

  // Kiểm tra trùng lặp
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('tracking_code', tracking_code)
    .eq('user_id', user_id)
    .single();

  if (existing) {
    throw new Error('Đơn hàng này đã được theo dõi');
  }

  const now = new Date().toISOString();
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id,
      carrier,
      tracking_code,
      phone,
      note,
      normalized_status: 'unknown',
      history: [],
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error || !order) {
    throw new Error(`Không thể tạo đơn hàng: ${error?.message}`);
  }

  // Thực hiện đồng bộ trạng thái trực tiếp để trả về kết quả chính xác ngay
  try {
    const syncedOrder = await syncOrder(order.id);
    return syncedOrder;
  } catch (err: any) {
    console.error(`[OrderService] Lỗi đồng bộ ban đầu cho ${tracking_code}:`, err.message);
    return order as OrderRow;
  }
}

/**
 * Xoá đơn hàng của user
 */
export async function deleteOrder(orderId: string, userId: string): Promise<void> {
  // Xác thực quyền sở hữu
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (!order) {
    throw new Error('Không tìm thấy đơn hàng hoặc bạn không có quyền xoá');
  }

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Không thể xoá đơn hàng: ${error.message}`);
  }
}

/**
 * Cập nhật ghi chú của đơn hàng
 */
export async function updateOrderNote(orderId: string, userId: string, note: string): Promise<OrderRow> {
  const { data, error } = await supabase
    .from('orders')
    .update({ note, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Không tìm thấy đơn hàng hoặc bạn không có quyền sửa');
  }

  return data as OrderRow;
}
