'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardBody } from '../ui/Card';
import type { ProfileRow, UserRole, UserStatus } from '../../types';

interface ProfileViewProps {
  profile: ProfileRow;
  onUpdate: (fullName: string, phone?: string) => Promise<void>;
  onMockStatus: (status: UserStatus) => void;
  onMockRole: (role: UserRole) => void;
}

export function ProfileView({ profile, onUpdate, onMockStatus, onMockRole }: ProfileViewProps) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await onUpdate(fullName, phone);
      setEditing(false);
      setMessage('Cập nhật thông tin thành công!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage('Lỗi: ' + (err.message || 'Không thể lưu'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Thông báo cập nhật */}
      {message && (
        <div className={`toast ${message.startsWith('Lỗi') ? 'toast-error' : 'toast-success'}`} role="status">
          {message}
        </div>
      )}

      {/* Hồ sơ cá nhân */}
      <Card>
        <CardBody className="profile-hero" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div className="avatar" style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--brand-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: '800'
          }}>
            {fullName.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>{profile.full_name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{profile.email}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <span className="badge" style={{ background: profile.role === 'admin' ? '#E0F2FE' : '#F3F4F6', color: profile.role === 'admin' ? '#0369A1' : '#374151' }}>
                Role: {profile.role.toUpperCase()}
              </span>
              <span className="badge" style={{ background: profile.status === 'approved' ? '#D1FAE5' : '#FEE2E2', color: profile.status === 'approved' ? '#065F46' : '#991B1B' }}>
                Status: {profile.status.toUpperCase()}
              </span>
            </div>
          </div>
          {!editing && (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              ✏️ Sửa hồ sơ
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Form chỉnh sửa thông tin */}
      {editing && (
        <Card>
          <CardHeader><h4>Chỉnh sửa thông tin</h4></CardHeader>
          <CardBody>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input
                label="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  Huỷ
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={saving}>
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Cài đặt ứng dụng */}
      <Card>
        <CardHeader><h4>Cài đặt thông báo</h4></CardHeader>
        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1px', padding: '0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid var(--border-color)'
          }}>
            <div>
              <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>Thông báo đẩy (Push Notification)</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nhận thông báo nổi lập tức khi có cập nhật vận đơn</p>
            </div>
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={() => setPushEnabled(!pushEnabled)}
              style={{ width: '40px', height: '20px', cursor: 'pointer' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
            <div>
              <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>Đổi mật khẩu</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cập nhật lại khoá bảo vệ mật khẩu</p>
            </div>
            <Button variant="secondary" size="sm">Đổi</Button>
          </div>
        </CardBody>
      </Card>

      {/* Mocking Panel (Cho Demo Tester) */}
      <Card style={{ borderColor: 'var(--brand-primary-light)', background: 'rgba(238, 77, 45, 0.02)' }}>
        <CardHeader style={{ borderBottomColor: 'rgba(238, 77, 45, 0.1)' }}>
          <h4 style={{ color: 'var(--brand-primary)' }}>🛠️ Chế độ Demo (Switch Account Role)</h4>
        </CardHeader>
        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Dùng các nút dưới đây để giả lập chuyển đổi quyền hạn / trạng thái duyệt tài khoản nhằm kiểm thử nhanh các chế độ giao diện khác nhau (Admin, Chờ duyệt...).
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 200px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Giả lập Trạng thái duyệt:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Button variant={profile.status === 'approved' ? 'primary' : 'secondary'} size="sm" onClick={() => onMockStatus('approved')}>
                  Duyệt (Approved)
                </Button>
                <Button variant={profile.status === 'pending' ? 'primary' : 'secondary'} size="sm" onClick={() => onMockStatus('pending')}>
                  Chờ (Pending)
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 200px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Giả lập Quyền hạn:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Button variant={profile.role === 'admin' ? 'primary' : 'secondary'} size="sm" onClick={() => onMockRole('admin')}>
                  Admin
                </Button>
                <Button variant={profile.role === 'user' ? 'primary' : 'secondary'} size="sm" onClick={() => onMockRole('user')}>
                  User
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      
    </div>
  );
}
