import type { NextConfig } from 'next'

const isProduction = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Security: Disable source maps in production
  productionBrowserSourceMaps: false,
  // Security: Disable powered by header
  poweredByHeader: false,
  // Security: Enable React strict mode
  reactStrictMode: true,
  // Optimize build
  swcMinify: true,
  compiler: {
    // Remove console.log in production
    removeConsole: isProduction
      ? {
          exclude: ['error', 'warn'],
        }
      : false,
  },
  async rewrites() {
    return [
      {
        source: '/rss.xml',
        destination: '/api/feed/rss',
      },
      {
        source: '/atom.xml',
        destination: '/api/feed/atom',
      },
      {
        source: '/feed.json',
        destination: '/api/feed/json',
      },
      {
        source: '/feeds/category/:slug.xml',
        destination: '/api/feed/category/:slug',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      // CSP header temporarily disabled due to nonce hydration issues
      // TODO: Implement proper nonce-based CSP with middleware
      // {
      //   source: '/:path*',
      //   headers: [
      //     {
      //       key: 'Content-Security-Policy',
      //       value: isProduction
      //         ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://prismic.io https://static.cdn.prismic.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; media-src 'self' https:; connect-src 'self' https://hundred-days-challenge.cdn.prismic.io https://*.prismic.io wss://*.prismic.io https://api.mailchimp.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://platform.twitter.com https://x.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;"
      //         : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' http: https: ws: wss:; media-src 'self' https:; object-src 'none'; base-uri 'self';",
      //     },
      //   ],
      // },
      // Add security headers for API routes
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ]
  },
}

export default nextConfig
