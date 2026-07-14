import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Next.js tự động nhận cấu hình alias từ tsconfig.json, không cần cấu hình thủ công ở đây */
  allowedDevOrigins: ['192.168.1.9', 'localhost', '127.0.0.1'],
};

export default nextConfig;
