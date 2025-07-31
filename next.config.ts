import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
}

export default nextConfig
