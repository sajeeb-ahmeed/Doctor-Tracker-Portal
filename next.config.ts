import type { NextConfig } from 'next';

const backendUrl = (process.env.BACKEND_URL || 'http://127.0.0.1:4000').replace(/\/$/, '');
if (process.env.NODE_ENV === 'production' && !process.env.BACKEND_URL) {
  throw new Error('Set BACKEND_URL before a production build.');
}

const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${backendUrl}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
export default config;
