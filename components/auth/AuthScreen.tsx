'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody } from '../ui/Card';

interface AuthScreenProps {
  login: (email: string, password?: string) => Promise<any>;
  register: (email: string, password?: string, fullName?: string, phone?: string) => Promise<any>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function AuthScreen({ login, register, loading, error, clearError }: AuthScreenProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // Client side validation
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleTabChange = (newTab: 'login' | 'register') => {
    setTab(newTab);
    clearError();
    setValidationError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!loginEmail.trim()) {
      setValidationError('Vui lòng nhập Email');
      return;
    }
    if (!loginPassword) {
      setValidationError('Vui lòng nhập mật khẩu');
      return;
    }

    try {
      await login(loginEmail.trim(), loginPassword);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!regFullName.trim()) {
      setValidationError('Vui lòng nhập Họ và tên');
      return;
    }
    if (!regEmail.trim()) {
      setValidationError('Vui lòng nhập Email');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setValidationError('Mật khẩu phải chứa ít nhất 6 ký tự');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setValidationError('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    try {
      await register(regEmail.trim(), regPassword, regFullName.trim(), regPhone.trim() || undefined);
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '24px',
    }}>
      <Card style={{
        maxWidth: '440px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
      }}>
        {/* Header decoration */}
        <div style={{
          background: 'var(--brand-gradient)',
          padding: '30px 24px',
          textAlign: 'center',
          color: 'white',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.2)" />
              <path
                d="M8 20 L14 12 L18 16 L22 10"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              />
              <circle cx="22" cy="10" r="2.5" fill="white" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>ShopTrack</h2>
          <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '4px' }}>Theo dõi đơn hàng thông minh toàn diện</p>
        </div>

        <CardBody style={{ padding: '28px 24px' }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface-2)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '4px',
            marginBottom: '24px',
          }}>
            <button
              onClick={() => handleTabChange('login')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                background: tab === 'login' ? 'var(--bg-surface)' : 'transparent',
                color: tab === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                borderRadius: 'var(--border-radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: tab === 'login' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => handleTabChange('register')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                background: tab === 'register' ? 'var(--bg-surface)' : 'transparent',
                color: tab === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                borderRadius: 'var(--border-radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: tab === 'register' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Đăng ký
            </button>
          </div>

          {/* Feedback messages */}
          {(error || validationError) && (
            <div className="toast toast-error" style={{ marginBottom: '20px', display: 'block', width: '100%', fontSize: '0.8rem' }}>
              ⚠️ {validationError || error}
            </div>
          )}

          {/* Login view */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Email"
                type="email"
                placeholder="ten@vi-du.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                style={{ width: '100%', marginTop: '8px', padding: '10px' }}
              >
                Đăng nhập
              </Button>
            </form>
          ) : (
            /* Register view */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                label="Email"
                type="email"
                placeholder="ten@vi-du.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                label="Số điện thoại"
                placeholder="09xx xxx xxx (Tùy chọn)"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                disabled={loading}
              />
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="••••••"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                style={{ width: '100%', marginTop: '8px', padding: '10px' }}
              >
                Đăng ký thành viên
              </Button>
            </form>
          )}

          {/* Quick instructions / tips */}
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: '1.4',
          }}>
            {tab === 'login' ? (
              <p>Mẹo: Đăng nhập bằng tài khoản Admin để truy cập chức năng phê duyệt thành viên.</p>
            ) : (
              <p>Chú ý: Tài khoản đăng ký mới sẽ ở trạng thái chờ duyệt (Pending) cho đến khi được Admin phê duyệt.</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
