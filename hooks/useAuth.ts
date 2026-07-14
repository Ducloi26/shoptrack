'use client';

import { useState, useEffect, useCallback } from 'react';
import { loginAccount, registerAccount, getUserProfile } from '../lib/api';
import type { ProfileRow } from '../types';

const STORAGE_PROFILE_KEY = 'shoptrack_user_profile';
const STORAGE_TOKEN_KEY = 'shoptrack_user_token';

export interface UseAuthReturn {
  profile: ProfileRow | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<ProfileRow>;
  register: (email: string, password?: string, fullName?: string, phone?: string) => Promise<ProfileRow>;
  logout: () => void;
  refreshProfileState: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Khôi phục session từ localStorage khi mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);

      if (storedProfile && storedToken) {
        const parsedProfile = JSON.parse(storedProfile) as ProfileRow;
        setProfile(parsedProfile);
        setToken(storedToken);

        // Silent refresh profile để cập nhật trạng thái mới nhất từ server (ví dụ: đã được duyệt)
        getUserProfile(parsedProfile.id)
          .then((freshProfile) => {
            setProfile(freshProfile);
            localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(freshProfile));
          })
          .catch((err) => {
            console.error('Lỗi tự động làm mới profile:', err);
            // Nếu không thể tải profile từ server (có thể user bị xóa), logout
            if (err.status === 404 || err.status === 401) {
              logout();
            }
          });
      }
    } catch (e) {
      console.error('Lỗi đọc session từ localStorage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginAccount({ email, password });
      
      setProfile(res.profile);
      setToken(res.token || '');

      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(res.profile));
      localStorage.setItem(STORAGE_TOKEN_KEY, res.token || '');
      
      return res.profile;
    } catch (err: any) {
      const errMsg = err.message || 'Đăng nhập không thành công';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password?: string, fullName?: string, phone?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerAccount({
        email,
        password,
        full_name: fullName || 'Người dùng mới',
        phone,
      });

      // Mặc định sau đăng ký, trạng thái là pending
      // Lưu lại profile để hiển thị màn hình chờ duyệt
      setProfile(res.profile);
      setToken(res.token || 'temp-pending-token');

      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(res.profile));
      localStorage.setItem(STORAGE_TOKEN_KEY, res.token || 'temp-pending-token');

      return res.profile;
    } catch (err: any) {
      const errMsg = err.message || 'Đăng ký không thành công';
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setProfile(null);
    setToken(null);
    setError(null);
    localStorage.removeItem(STORAGE_PROFILE_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  }, []);

  const refreshProfileState = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const freshProfile = await getUserProfile(profile.id);
      setProfile(freshProfile);
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(freshProfile));
    } catch (err: any) {
      setError(err.message || 'Không thể làm mới thông tin tài khoản');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    profile,
    token,
    loading,
    error,
    login,
    register,
    logout,
    refreshProfileState,
    clearError,
  };
}
