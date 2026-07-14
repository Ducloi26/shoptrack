import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ShopTrack — Theo dõi đơn hàng thông minh',
  description:
    'Theo dõi tự động đơn hàng từ Shopee Express, GHN, GHTK, J&T, Viettel Post và nhiều đơn vị vận chuyển khác. Nhận thông báo khi có cập nhật.',
  keywords: 'theo dõi đơn hàng, tracking, shopee express, GHN, vận chuyển, SPX',
  authors: [{ name: 'ShopTrack' }],
  robots: 'index, follow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShopTrack',
  },
  openGraph: {
    title: 'ShopTrack — Theo dõi đơn hàng thông minh',
    description: 'Theo dõi tự động đơn hàng từ nhiều đơn vị vận chuyển tại Việt Nam',
    type: 'website',
    locale: 'vi_VN',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F9FA' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F1A' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="app-shell">{children}</body>
    </html>
  );
}
