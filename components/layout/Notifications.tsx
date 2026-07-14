'use client';

import { useState, useEffect, useRef } from 'react';
import type { OrderRow } from '../../types';
import { STATUS_ICONS, STATUS_LABELS } from '../../lib/constants';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: Date;
  read: boolean;
}

interface NotificationsProps {
  orders: OrderRow[];
}

export function Notifications({ orders }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevStatusesRef = useRef<Record<string, string>>({});

  // Xin quyền thông báo trình duyệt khi khởi chạy
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          console.log(`Quyền thông báo hệ thống: ${permission}`);
        });
      }
    }
  }, []);

  // Theo dõi sự thay đổi trạng thái đơn để phát thông báo đẩy trình duyệt
  useEffect(() => {
    if (orders.length === 0) return;

    const prevStatuses = prevStatusesRef.current;
    const currentStatuses: Record<string, string> = {};

    orders.forEach((order) => {
      currentStatuses[order.id] = order.normalized_status;

      const prevStatus = prevStatuses[order.id];
      // Chỉ kích hoạt khi trạng thái trước đó đã tồn tại và khác trạng thái hiện tại
      if (prevStatus && prevStatus !== order.normalized_status) {
        const targetStatuses = ['delivering', 'delivered', 'failed', 'returned'];
        if (targetStatuses.includes(order.normalized_status)) {
          let statusLabel = '';
          let statusMessage = '';

          switch (order.normalized_status) {
            case 'delivering':
              statusLabel = 'Đang giao hàng 🛵';
              statusMessage = `Đơn hàng ${order.tracking_code} (${order.carrier}) đang được shipper giao đến bạn!`;
              break;
            case 'delivered':
              statusLabel = 'Đã giao thành công ✅';
              statusMessage = `Đơn hàng ${order.tracking_code} (${order.carrier}) đã được giao thành công.`;
              break;
            case 'failed':
              statusLabel = 'Giao hàng thất bại ❌';
              statusMessage = `Đơn hàng ${order.tracking_code} (${order.carrier}) giao hàng không thành công.`;
              break;
            case 'returned':
              statusLabel = 'Đơn hàng bị chuyển hoàn 🔄';
              statusMessage = `Đơn hàng ${order.tracking_code} (${order.carrier}) đang được chuyển hoàn về người gửi.`;
              break;
          }

          // Gửi thông báo đẩy hệ điều hành
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`ShopTrack: ${statusLabel}`, {
                body: statusMessage,
                tag: order.id, // Nhóm các thông báo của cùng đơn hàng
              });
            } catch (err) {
              console.error('Lỗi khi gửi thông báo đẩy trình duyệt:', err);
            }
          }
        }
      }
    });

    // Cập nhật ref cho lần so sánh tiếp theo
    prevStatusesRef.current = currentStatuses;
  }, [orders]);

  // Theo dõi sự thay đổi trạng thái đơn để sinh thông báo (Simulated / Real-time updates)
  useEffect(() => {
    if (orders.length === 0) return;

    // Giả lập thông báo dựa trên lịch sử vận chuyển mới nhất của các đơn hàng
    const newNotifs: NotificationItem[] = [];
    orders.forEach((order) => {
      if (order.history && order.history.length > 0) {
        const lastEvent = order.history[order.history.length - 1];
        const statusIcon = STATUS_ICONS[order.normalized_status] || '📦';
        const statusLabel = STATUS_LABELS[order.normalized_status];
        
        newNotifs.push({
          id: `${order.id}-${order.updated_at}`,
          title: `Đơn ${order.tracking_code} - ${statusLabel}`,
          body: `${statusIcon} ${lastEvent.description} ${lastEvent.location ? ` tại ${lastEvent.location}` : ''}`,
          time: new Date(order.updated_at),
          read: false,
        });
      }
    });

    // Sắp xếp thông báo mới nhất lên đầu
    newNotifs.sort((a, b) => b.time.getTime() - a.time.getTime());
    
    // Giới hạn max 10 thông báo
    setNotifications(newNotifs.slice(0, 10));
  }, [orders]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notifications-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Icon Chuông thông báo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
          padding: '8px', borderRadius: '50%', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background var(--transition-fast)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        aria-label="Thông báo"
        aria-expanded={isOpen}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {/* Số thông báo chưa đọc */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            background: 'var(--brand-primary)', color: 'white',
            borderRadius: '50%', width: '16px', height: '16px',
            fontSize: '10px', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Menu thả xuống */}
      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, marginTop: '8px',
          width: '320px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-lg)', zIndex: 1000, overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>Thông báo đẩy</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none', border: 'none', color: 'var(--brand-primary)',
                  fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Đọc tất cả
              </button>
            )}
          </div>

          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                🔔 Chưa có thông báo cập nhật vận đơn nào.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    background: notif.read ? 'transparent' : 'rgba(238, 77, 45, 0.03)',
                    transition: 'background 0.2s'
                  }}
                >
                  <p style={{
                    margin: 0, fontWeight: notif.read ? '600' : '700',
                    fontSize: '0.82rem', color: 'var(--text-primary)'
                  }}>
                    {notif.title}
                  </p>
                  <p style={{
                    margin: '3px 0 0', fontSize: '0.75rem',
                    color: 'var(--text-secondary)', lineHeight: '1.4'
                  }}>
                    {notif.body}
                  </p>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    {notif.time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
