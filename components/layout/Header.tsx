import React from 'react';
import { Notifications } from './Notifications';
import type { OrderRow, ProfileRow } from '../../types';

interface HeaderProps {
  orderCount?: number;
  lastRefreshed?: Date | null;
  orders?: OrderRow[];
  userProfile?: ProfileRow | null;
  onLogout?: () => void;
}

export function Header({ orderCount, lastRefreshed, orders = [], userProfile, onLogout }: HeaderProps) {
  const timeStr = lastRefreshed
    ? lastRefreshed.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <header className="header" role="banner">
      <div className="header-inner">
        {/* Logo + Brand */}
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
              <path
                d="M8 20 L14 12 L18 16 L22 10"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              />
              <circle cx="22" cy="10" r="2.5" fill="white" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#FF6B35" />
                  <stop offset="100%" stopColor="#EE4D2D" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="header-title">ShopTrack</h1>
            <p className="header-subtitle">Theo dõi đơn hàng thông minh</p>
          </div>
        </div>

        {/* Status info + Notifications + Profile dropdown / logout */}
        <div className="header-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {orderCount !== undefined && (
            <div className="header-stat dsk dsk-block">
              <span className="header-stat-value">{orderCount}</span>
              <span className="header-stat-label">đơn đang theo dõi</span>
            </div>
          )}
          {timeStr && (
            <div className="header-refresh-time dsk dsk-flex" title="Thời gian cập nhật gần nhất">
              <span className="refresh-dot" aria-hidden="true" />
              Cập nhật lúc {timeStr}
            </div>
          )}
          
          {/* Notifications bell */}
          <Notifications orders={orders} />

          {/* User profile dropdown / logout */}
          {userProfile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
              <div className="avatar dsk dsk-flex" style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--brand-primary)', color: 'white',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: '800'
              }}>
                {userProfile.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="dsk dsk-block" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{userProfile.full_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {userProfile.role === 'admin' ? '⚙️ Admin' : '👤 Thành viên'}
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand-primary)';
                    e.currentTarget.style.color = 'var(--brand-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Đăng xuất
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
