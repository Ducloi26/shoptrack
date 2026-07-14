'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateProfile } from '../lib/api';
import { DEMO_USER_ID } from '../lib/constants';
import type { ProfileRow, UserRole, UserStatus } from '../types';

interface UseProfileReturn {
  profile: ProfileRow | null;
  loading: boolean;
  error: string | null;
  updateOwnInfo: (fullName: string, phone?: string) => Promise<void>;
  // Các hàm tiện ích dành riêng cho Mock Demo (Cho phép Switch Role nhanh để test)
  mockStatusChange: (status: UserStatus) => void;
  mockRoleChange: (role: UserRole) => void;
  refreshProfile: () => Promise<void>;
}

export function useProfile(userId?: string): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getUserProfile(userId);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin tài khoản');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateOwnInfo = useCallback(async (fullName: string, phone?: string) => {
    if (!profile || !userId) return;
    setLoading(true);
    try {
      const updated = await updateProfile(userId, fullName, phone);
      setProfile(updated);
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật thông tin');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile, userId]);

  // Giả lập chuyển quyền / trạng thái duyệt nhanh trên giao diện để test duyệt tài khoản
  const mockStatusChange = useCallback((status: UserStatus) => {
    setProfile((prev) => prev ? { ...prev, status } : null);
  }, []);

  const mockRoleChange = useCallback((role: UserRole) => {
    setProfile((prev) => prev ? { ...prev, role } : null);
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return {
    profile,
    loading,
    error,
    updateOwnInfo,
    mockStatusChange,
    mockRoleChange,
    refreshProfile,
  };
}
