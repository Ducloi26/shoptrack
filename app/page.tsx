'use client';

import { useState, useMemo } from 'react';
import { Header } from '../components/layout/Header';
import { AddOrderForm } from '../components/orders/AddOrderForm';
import { OrderList } from '../components/orders/OrderList';
import { ProfileView } from '../components/orders/ProfileView';
import { AdminView } from '../components/orders/AdminView';
import { useOrders } from '../hooks/useOrders';
import { useAddOrder } from '../hooks/useAddOrder';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { AuthScreen } from '../components/auth/AuthScreen';
import { STATUS_GROUPS } from '../lib/constants';
import type { CarrierId } from '../types';

type ActiveTab = 'orders' | 'profile' | 'admin';

export default function HomePage() {
  const {
    profile: authProfile,
    loading: authLoading,
    error: authError,
    login,
    register,
    logout,
    refreshProfileState,
    clearError,
  } = useAuth();

  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    lastRefreshed,
    deletingId,
    handleDelete,
    addOrderOptimistic,
  } = useOrders(authProfile?.id);

  const { submit, loading: adding, error: addError, success: addSuccess } = useAddOrder(authProfile?.id);

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    updateOwnInfo,
    mockStatusChange,
    mockRoleChange,
    refreshProfile,
  } = useProfile(authProfile?.id);

  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [filter, setFilter] = useState<string>('Tất cả');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(true);

  // Stats
  const stats = useMemo(() => {
    const active = orders.filter(
      (o) => !['delivered', 'returned', 'failed'].includes(o.normalized_status),
    ).length;
    const delivering = orders.filter((o) => o.normalized_status === 'delivering').length;
    const delivered = orders.filter((o) => o.normalized_status === 'delivered').length;
    const issues = orders.filter((o) =>
      ['returned', 'failed'].includes(o.normalized_status),
    ).length;

    return { total: orders.length, active, delivering, delivered, issues };
  }, [orders]);

  const handleAddOrder = async (data: {
    carrier: CarrierId;
    tracking_code: string;
    phone?: string;
    note?: string;
  }) => {
    await submit(data, (order) => {
      addOrderOptimistic(order);
    });
  };

  const filterKeys = Object.keys(STATUS_GROUPS);

  // Loading auth session
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Đang khởi tạo phiên làm việc...</p>
      </div>
    );
  }

  // Chưa đăng nhập -> Hiển thị AuthScreen
  if (!authProfile) {
    return (
      <AuthScreen
        key="auth-screen"
        login={login}
        register={register}
        loading={authLoading}
        error={authError}
        clearError={clearError}
      />
    );
  }

  // Loading profile from db
  if (profileLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  // Fallback nếu có authProfile nhưng không có db profile
  if (!profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Không tìm thấy thông tin tài khoản trong hệ thống dữ liệu.</p>
        <button className="btn btn-primary" onClick={logout}>Đăng xuất</button>
      </div>
    );
  }

  // A. MÀN HÌNH CHỜ DUYỆT (PENDING / REJECTED STATUS)
  if (profile && (profile.status === 'pending' || profile.status === 'rejected')) {
    return (
      <>
        <Header orders={orders} lastRefreshed={lastRefreshed} userProfile={profile} onLogout={logout} />
        <main className="page-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '32px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)' }}>
            <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px' }}>
              {profile.status === 'pending' ? '⏳' : '❌'}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '10px' }}>
              {profile.status === 'pending' ? 'Tài khoản đang chờ duyệt' : 'Đăng ký bị từ chối'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '24px' }}>
              {profile.status === 'pending'
                ? `Chào ${profile.full_name}, tài khoản của bạn (${profile.email}) đang ở trạng thái chờ quản trị viên phê duyệt để truy cập ứng dụng.`
                : `Rất tiếc, yêu cầu tham gia của bạn đã bị từ chối. Vui lòng liên hệ Admin.`}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => refreshProfile()}
                style={{ padding: '8px 16px', fontWeight: 'bold' }}
              >
                🔄 Kiểm tra lại
              </button>
              <button
                className="btn btn-ghost"
                onClick={logout}
                style={{ padding: '8px 16px', fontWeight: 'bold', color: 'var(--text-secondary)' }}
              >
                Đăng xuất
              </button>
            </div>

            <div style={{ padding: '16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px dashed var(--border-color)', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--brand-primary)' }}>Mẹo kiểm thử nhanh (Demo Mode):</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => mockStatusChange('approved')}
              >
                Duyệt ngay (Simulate Approval)
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <div key="dashboard-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <Header
        orderCount={stats.active}
        lastRefreshed={lastRefreshed}
        orders={orders}
        userProfile={profile}
        onLogout={logout}
      />

      <main className="page-main" id="main-content">
        
        {/* ── Tabs Navigation ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', paddingBottom: '2px', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={`filter-tab ${activeTab === 'orders' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            📦 Đơn hàng
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`filter-tab ${activeTab === 'profile' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            👤 Tài khoản
          </button>
          {profile && profile.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`filter-tab ${activeTab === 'admin' ? 'active' : ''}`}
              style={{ padding: '8px 16px', fontSize: '0.9rem', fontWeight: 'bold' }}
            >
              ⚙️ Quản trị
            </button>
          )}
        </div>

        {/* ── Render Tab 1: Orders (Đơn hàng) ── */}
        {activeTab === 'orders' && (
          <>
            {/* Stats Row */}
            <div className="stats-row" aria-label="Thống kê đơn hàng">
              <div className="stat-card">
                <span className="stat-card-icon">📦</span>
                <div>
                  <div className="stat-card-value">{stats.total}</div>
                  <div className="stat-card-label">Tổng đơn</div>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-card-icon">🚚</span>
                <div>
                  <div className="stat-card-value">{stats.active}</div>
                  <div className="stat-card-label">Đang theo dõi</div>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-card-icon">🛵</span>
                <div>
                  <div className="stat-card-value">{stats.delivering}</div>
                  <div className="stat-card-label">Đang giao</div>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-card-icon">✅</span>
                <div>
                  <div className="stat-card-value">{stats.delivered}</div>
                  <div className="stat-card-label">Đã giao</div>
                </div>
              </div>
            </div>

            {/* Add Order Section */}
            <div className="section" id="add-order-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span aria-hidden="true">➕</span> Thêm đơn hàng mới
                </h2>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setFormOpen((p) => !p)}
                  aria-expanded={formOpen}
                  aria-controls="add-order-form-body"
                  id="toggle-form-btn"
                >
                  {formOpen ? 'Thu gọn' : 'Mở rộng'}
                </button>
              </div>

              {formOpen && (
                <div className="section-body" id="add-order-form-body">
                  {addError && (
                    <div className="toast toast-error" role="alert" aria-live="polite">
                      ⚠️ {addError}
                    </div>
                  )}
                  {addSuccess && (
                    <div className="toast toast-success" role="status" aria-live="polite">
                      ✅ Đã thêm đơn hàng! Đang kiểm tra trạng thái...
                    </div>
                  )}
                  <AddOrderForm onSubmit={handleAddOrder} loading={adding} />
                </div>
              )}
            </div>

            {/* Orders List Section */}
            <div className="section" id="orders-section">
              <div className="section-header">
                <h2 className="section-title">
                  <span aria-hidden="true">📋</span> Danh sách đơn hàng
                </h2>
              </div>

              <div className="section-body">
                {/* Search */}
                <div className="search-bar-wrapper">
                  <span className="search-icon" aria-hidden="true">🔍</span>
                  <input
                    id="search-orders-input"
                    type="search"
                    className="search-input"
                    placeholder="Tìm theo mã vận đơn, hãng vận chuyển, ghi chú..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Tìm kiếm đơn hàng"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs" role="tablist" aria-label="Lọc theo trạng thái">
                  {filterKeys.map((key) => (
                    <button
                      key={key}
                      className={`filter-tab ${filter === key ? 'active' : ''}`}
                      onClick={() => setFilter(key)}
                      role="tab"
                      aria-selected={filter === key}
                      id={`filter-tab-${key.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {key}
                    </button>
                  ))}
                </div>

                {/* Orders */}
                <OrderList
                  orders={orders}
                  loading={ordersLoading}
                  error={ordersError}
                  deletingId={deletingId}
                  onDelete={handleDelete}
                  filter={filter}
                  search={search}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Render Tab 2: Profile (Tài khoản) ── */}
        {activeTab === 'profile' && profile && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">👤 Thông tin tài khoản</h2>
            </div>
            <div className="section-body" style={{ marginTop: '16px' }}>
              <ProfileView
                profile={profile}
                onUpdate={updateOwnInfo}
                onMockStatus={mockStatusChange}
                onMockRole={mockRoleChange}
              />
            </div>
          </div>
        )}

        {/* ── Render Tab 3: Admin (Quản trị) ── */}
        {activeTab === 'admin' && profile && profile.role === 'admin' && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">⚙️ Quản trị hệ thống</h2>
            </div>
            <div className="section-body" style={{ marginTop: '16px' }}>
              <AdminView adminId={profile.id} onRefreshCurrentProfile={refreshProfile} />
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="content-wrapper" style={{
        textAlign: 'center',
        padding: '20px',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        borderTop: '1px solid var(--border-color)',
      }}>
        ShopTrack — Cập nhật tự động mỗi 60 giây · Hỗ trợ SPX, GHN, GHTK, J&T, VTP, NJV, BEST
      </footer>
    </div>
  );
}
