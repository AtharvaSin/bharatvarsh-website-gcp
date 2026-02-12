import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Enable standalone output for Docker/Cloud Run deployment */
  output: 'standalone',

  /** Security headers for all routes (Phase 7) */
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://vitals.vercel-insights.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
    // Forum API read endpoints: public caching.
    {
      source: '/api/forum/topics',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=300, stale-while-revalidate=60',
        },
      ],
    },
    {
      source: '/api/forum/threads',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=30, stale-while-revalidate=60',
        },
      ],
    },
    {
      source: '/api/forum/users/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=60, stale-while-revalidate=60',
        },
      ],
    },
  ],
};

export default nextConfig;
