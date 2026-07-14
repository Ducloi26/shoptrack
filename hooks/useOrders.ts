'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getOrders, deleteOrder } from '../lib/api';
import { DEMO_USER_ID, FRONTEND_POLL_INTERVAL_MS } from '../lib/constants';
import type { OrderRow } from '../types';

interface UseOrdersReturn {
  orders: OrderRow[];
  loading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
  deletingId: string | null;
  refresh: () => Promise<void>;
  handleDelete: (orderId: string) => Promise<void>;
  addOrderOptimistic: (order: OrderRow) => void;
}

export function useOrders(userId?: string): UseOrdersReturn {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Dùng ref để tránh stale closure trong setInterval
  const isMounted = useRef(true);

  const refresh = useCallback(async (silent = false) => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setError(null);

    try {
      if (!silent) {
        // Gửi lệnh đối soát trực tiếp lên Serverless để đồng bộ trước
        await fetch(`/api/orders/sync?user_id=${encodeURIComponent(userId)}`, { method: 'POST' }).catch((err) => 
          console.error('[Sync] Lỗi trigger sync thủ công:', err)
        );
      }

      const data = await getOrders(userId);
      if (isMounted.current) {
        setOrders(data);
        setLastRefreshed(new Date());
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || 'Không thể tải danh sách đơn hàng');
      }
    } finally {
      if (isMounted.current && !silent) {
        setLoading(false);
      }
    }
  }, [userId]);

  // Optimistic update — thêm đơn vào list ngay lập tức trước khi server confirm
  const addOrderOptimistic = useCallback((order: OrderRow) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const handleDelete = useCallback(async (orderId: string) => {
    if (!userId) return;
    setDeletingId(orderId);
    try {
      await deleteOrder(orderId, userId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      setError(err.message || 'Không thể xoá đơn hàng');
    } finally {
      setDeletingId(null);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Background polling — silent refresh mỗi 60s
  useEffect(() => {
    const interval = setInterval(() => {
      refresh(true); // silent = không setLoading(true)
    }, FRONTEND_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [refresh]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    orders,
    loading,
    error,
    lastRefreshed,
    deletingId,
    refresh: () => refresh(false),
    handleDelete,
    addOrderOptimistic,
  };
}
