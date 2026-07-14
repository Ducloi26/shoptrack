'use client';

import { OrderCard } from './OrderCard';
import { OrderCardSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../layout/EmptyState';
import type { OrderRow, NormalizedStatus } from '../../types';
import { STATUS_GROUPS } from '../../lib/constants';

interface OrderListProps {
  orders: OrderRow[];
  loading: boolean;
  error: string | null;
  deletingId: string | null;
  onDelete: (id: string) => void;
  filter: string;
  search: string;
}

export function OrderList({
  orders,
  loading,
  error,
  deletingId,
  onDelete,
  filter,
  search,
}: OrderListProps) {
  // Loading skeleton
  if (loading && orders.length === 0) {
    return (
      <div className="order-list" aria-label="Đang tải đơn hàng...">
        {Array.from({ length: 3 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="order-list-error" role="alert">
        <p className="error-icon">⚠️</p>
        <p className="error-message">{error}</p>
        <p className="error-hint">Kiểm tra kết nối và thử lại</p>
      </div>
    );
  }

  // Filter theo status group
  const statusFilter = STATUS_GROUPS[filter] ?? STATUS_GROUPS['Tất cả'];
  let filtered = orders.filter((o) =>
    statusFilter.includes(o.normalized_status as NormalizedStatus),
  );

  // Filter theo search
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.tracking_code.toLowerCase().includes(q) ||
        o.carrier.toLowerCase().includes(q) ||
        o.note?.toLowerCase().includes(q),
    );
  }

  // Empty state
  if (filtered.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title={
          orders.length === 0
            ? 'Chưa có đơn hàng nào'
            : 'Không tìm thấy đơn phù hợp'
        }
        description={
          orders.length === 0
            ? 'Thêm mã vận đơn đầu tiên của bạn để bắt đầu theo dõi'
            : 'Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm'
        }
      />
    );
  }

  return (
    <div
      className="order-list"
      aria-label={`Danh sách đơn hàng (${filtered.length} đơn)`}
    >
      <div className="order-list-count">
        {filtered.length} đơn hàng
        {loading && <span className="order-list-refreshing"> · Đang cập nhật...</span>}
      </div>

      {filtered.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onDelete={onDelete}
          deleting={deletingId === order.id}
        />
      ))}
    </div>
  );
}
