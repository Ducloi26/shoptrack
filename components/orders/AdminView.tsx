'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProfilesByStatus, reviewProfile } from '../../lib/api';
import { DEMO_USER_ID } from '../../lib/constants';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import type { ProfileRow, UserStatus } from '../../types';

interface AdminViewProps {
  adminId: string;
  onRefreshCurrentProfile: () => Promise<void>;
}

export function AdminView({ adminId, onRefreshCurrentProfile }: AdminViewProps) {
  const [statusTab, setStatusTab] = useState<UserStatus>('pending');
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (!adminId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProfilesByStatus(adminId, statusTab);
      setProfiles(data);
    } catch (err: any) {
      setError(err.message || 'Không thể lấy danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  }, [adminId, statusTab]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleReview = async (targetUserId: string, newStatus: 'approved' | 'rejected') => {
    if (!adminId) return;
    setActioningId(targetUserId);
    try {
      await reviewProfile(adminId, targetUserId, newStatus);
      // Remove khỏi danh sách hiển thị hiện tại
      setProfiles((prev) => prev.filter((p) => p.id !== targetUserId));
      
      // Nếu tự duyệt chính mình trong DB (hoặc demo), cập nhật lại profile hiện tại
      if (targetUserId === adminId) {
        await onRefreshCurrentProfile();
      }
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Không thể duyệt tài khoản'));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className={`filter-tab ${statusTab === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusTab('pending')}
        >
          Chờ duyệt {statusTab === 'pending' && profiles.length > 0 ? `(${profiles.length})` : ''}
        </button>
        <button
          className={`filter-tab ${statusTab === 'approved' ? 'active' : ''}`}
          onClick={() => setStatusTab('approved')}
        >
          Đã duyệt
        </button>
        <button
          className={`filter-tab ${statusTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setStatusTab('rejected')}
        >
          Đã từ chối
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <Card style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          🔄 Đang tải danh sách tài khoản...
        </Card>
      ) : error ? (
        <Card style={{ padding: '24px', textAlign: 'center', color: 'var(--red-600)' }}>
          ⚠️ {error}
        </Card>
      ) : profiles.length === 0 ? (
        <Card style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>👥</span>
          Không có tài khoản nào thuộc trạng thái này
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Layout bảng cho màn hình máy tính */}
          <div className="dsk dsk-block card" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 'bold' }}>Họ và tên</th>
                  <th style={{ padding: '12px 18px', fontWeight: 'bold' }}>Email</th>
                  <th style={{ padding: '12px 18px', fontWeight: 'bold' }}>Số điện thoại</th>
                  <th style={{ padding: '12px 18px', fontWeight: 'bold' }}>Ngày đăng ký</th>
                  {statusTab === 'pending' && <th style={{ padding: '12px 18px', fontWeight: 'bold', textAlign: 'right' }}>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '700' }}>{p.full_name}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{p.email}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{p.phone || '—'}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                      {new Date(p.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    {statusTab === 'pending' && (
                      <td style={{ padding: '8px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          style={{ marginRight: '6px' }}
                          loading={actioningId === p.id}
                          onClick={() => handleReview(p.id, 'approved')}
                        >
                          ✓ Duyệt
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={actioningId === p.id}
                          onClick={() => handleReview(p.id, 'rejected')}
                        >
                          ✕ Từ chối
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Layout cards cho màn hình điện thoại di động (Mobile responsive) */}
          <div className="mob" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            {profiles.map((p) => (
              <Card key={p.id} style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <p style={{ fontWeight: '800', fontSize: '0.95rem', margin: 0 }}>{p.full_name}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(p.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0' }}>{p.email}</p>
                {p.phone && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0' }}>📞 {p.phone}</p>}
                
                {statusTab === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ flex: 1 }}
                      loading={actioningId === p.id}
                      onClick={() => handleReview(p.id, 'approved')}
                    >
                      ✓ Duyệt
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      style={{ flex: 1 }}
                      loading={actioningId === p.id}
                      onClick={() => handleReview(p.id, 'rejected')}
                    >
                      ✕ Từ chối
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
