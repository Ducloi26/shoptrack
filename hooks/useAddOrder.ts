'use client';

import { useState, useCallback } from 'react';
import { createOrder } from '../lib/api';
import { DEMO_USER_ID } from '../lib/constants';
import type { CarrierId, OrderRow } from '../types';

interface AddOrderInput {
  carrier: CarrierId;
  tracking_code: string;
  phone?: string;
  note?: string;
}

interface UseAddOrderReturn {
  submit: (data: AddOrderInput, onSuccess?: (order: OrderRow) => void) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  clearState: () => void;
}

export function useAddOrder(userId?: string): UseAddOrderReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clearState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  const submit = useCallback(async (
    data: AddOrderInput,
    onSuccess?: (order: OrderRow) => void,
  ) => {
    if (!userId) {
      setError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const order = await createOrder({
        ...data,
        user_id: userId,
      });

      setSuccess(true);
      onSuccess?.(order);

      // Auto clear success sau 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      // Humanize error messages
      const msg = err.message || 'Không thể thêm đơn hàng';
      if (msg.includes('đã được theo dõi') || err.code === 'DUPLICATE_ORDER') {
        setError('Mã vận đơn này đã được thêm vào danh sách theo dõi');
      } else if (err.status === 400) {
        setError('Thông tin không hợp lệ, vui lòng kiểm tra lại');
      } else if (err.status >= 500) {
        setError('Lỗi máy chủ, vui lòng thử lại sau');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { submit, loading, error, success, clearState };
}
