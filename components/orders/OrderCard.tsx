'use client';

import { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';
import { CARRIERS } from '../../lib/constants';
import type { OrderRow } from '../../types';

interface OrderCardProps {
  order: OrderRow;
  onDelete: (id: string) => void;
  deleting?: boolean;
}

export function OrderCard({ order, onDelete, deleting = false }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const carrier = CARRIERS[order.carrier];

  const lastEvent = order.history?.[order.history.length - 1];
  const formattedDate = new Date(order.updated_at).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const formattedCreated = new Date(order.created_at).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`order-card ${expanded ? 'order-card-expanded' : ''}`} data-order-id={order.id}>
      {/* Header */}
      <div className="order-card-header">
        <div className="order-card-carrier">
          {/* Carrier color dot */}
          <div
            className="carrier-dot"
            style={{ backgroundColor: carrier?.color ?? '#888' }}
            title={carrier?.name}
          />
          <div className="order-card-info">
            <span className="order-tracking-code">{order.tracking_code}</span>
            <span className="order-carrier-name" style={{ color: carrier?.color }}>
              {carrier?.name ?? order.carrier}
            </span>
          </div>
        </div>

        <div className="order-card-actions">
          <StatusBadge status={order.normalized_status} size="sm" />
          <button
            className="order-expand-btn"
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Thu gọn' : 'Xem chi tiết'}
            title={expanded ? 'Thu gọn' : 'Xem chi tiết'}
          >
            <svg
              className={`expand-icon ${expanded ? 'expanded' : ''}`}
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="order-card-meta">
        {lastEvent && (
          <p className="order-last-event">
            <span className="order-meta-icon">📍</span>
            {lastEvent.description}
            {lastEvent.location && ` — ${lastEvent.location}`}
          </p>
        )}
        <div className="order-meta-row">
          <span className="order-meta-item">
            <span className="order-meta-icon">🕐</span>
            Cập nhật: {formattedDate}
          </span>
          <span className="order-meta-item">
            <span className="order-meta-icon">📅</span>
            Thêm: {formattedCreated}
          </span>
          {order.phone && (
            <span className="order-meta-item">
              <span className="order-meta-icon">📞</span>
              {order.phone}
            </span>
          )}
        </div>
        {order.note && (
          <p className="order-note">
            <span className="order-meta-icon">📝</span>
            {order.note}
          </p>
        )}
      </div>

      {/* Expanded: lịch sử tracking */}
      {expanded && (
        <div className="order-history" aria-label="Lịch sử vận chuyển">
          <h4 className="order-history-title">Lịch sử vận chuyển</h4>
          {order.history && order.history.length > 0 ? (
            <ol className="timeline" reversed>
              {[...order.history].reverse().map((event, idx) => (
                <li key={idx} className={`timeline-item ${idx === 0 ? 'timeline-item-current' : ''}`}>
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <p className="timeline-desc">{event.description}</p>
                    <div className="timeline-meta">
                      {event.location && (
                        <span className="timeline-location">📍 {event.location}</span>
                      )}
                      <span className="timeline-time">
                        {new Date(event.time).toLocaleString('vi-VN', {
                          day: '2-digit', month: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="timeline-empty">Chưa có lịch sử vận chuyển</p>
          )}

          {/* Delete button trong expanded */}
          <div className="order-card-footer">
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              onClick={() => onDelete(order.id)}
              id={`delete-order-${order.id}`}
            >
              🗑 Ngừng theo dõi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
