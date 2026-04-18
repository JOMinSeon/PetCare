import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://dapi.kakao.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://t1.daumcdn.net https://*.lemonsqueezy.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: https://t1.daumcdn.net; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://dapi.kakao.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://t1.daumcdn.net https://*.lemonsqueezy.com; frame-src 'self' https://googleads.g.doubleclick.net https://www.google.com https://*.lemonsqueezy.com https://ep2.adtrafficquality.google;" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
