/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdfkit'],
  compress: true,

  // ── Production Console Stripping ──────────────────────────────────────────
  // Removes all console.log calls from the production bundle.
  // console.error and console.warn are preserved for debugging.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // ── Tree-Shaking for Heavy Packages ───────────────────────────────────────
  // Tells Next.js to only bundle the specific sub-paths used, not entire SDKs.
  experimental: {
    optimizePackageImports: [
      '@aws-sdk/client-s3',
      '@aws-sdk/s3-request-presigner',
      'nodemailer',
    ],
  },

  // ── Image Optimization ────────────────────────────────────────────────────
  // Re-enables Next.js image optimization (WebP/AVIF conversion, lazy loading).
  // Add remote domains here if you use next/image with external URLs.
  images: {
    minimumCacheTTL: 86400,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google OAuth avatars
    ],
  },

  async headers() {
    return [
      {
        // Media Assets & Video Background (Edge Byte-Range Streaming + Long TTL)
        source: '/:path*.(mp4|webm|jpg|jpeg|png|gif|ico|svg|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
      {
        // Global Security Headers for Vercel CDN
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Strict CSP — replaces the deprecated X-XSS-Protection header
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/eval required for Next.js dev & RSC hydration
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
              "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https:",
              "frame-ancestors 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

