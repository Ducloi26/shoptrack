export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px',
      }}
      aria-label="Đang tải..."
      role="status"
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--brand-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
        aria-hidden="true"
      />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Đang tải ShopTrack...
      </p>
    </div>
  );
}
