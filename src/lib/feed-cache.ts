import { unstable_cache } from 'next/cache'
import { generateFeeds, generateCategoryFeed } from './feed-generator'

/**
 * Cache configuration for feeds
 */
const FEED_CACHE_CONFIG = {
  revalidate: 3600, // 1 hour
  tags: ['feed', 'posts'],
}

/**
 * Get cached main feeds (RSS, Atom, JSON)
 */
export const getCachedFeeds = unstable_cache(
  async () => {
    console.log('Generating fresh feeds...')
    return generateFeeds()
  },
  ['main-feeds'],
  FEED_CACHE_CONFIG
)

/**
 * Get cached category feed
 */
export const getCachedCategoryFeed = unstable_cache(
  async (categorySlug: string) => {
    console.log(`Generating fresh feed for category: ${categorySlug}`)
    return generateCategoryFeed(categorySlug)
  },
  ['category-feed'],
  {
    ...FEED_CACHE_CONFIG,
    tags: ['feed', 'posts', 'category'],
  }
)

/**
 * Helper to generate ETag from content and timestamp
 */
export function generateETag(content: string, timestamp?: Date): string {
  // Use Web Crypto API for browser compatibility, fallback to Node crypto
  const data = content + (timestamp?.toISOString() || Date.now())

  // Simple hash function for ETag generation
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return `"${Math.abs(hash).toString(16)}"`
}

/**
 * Helper to get last modified date for feeds
 */
export async function getFeedLastModified(): Promise<Date> {
  // In a real implementation, this would query the database
  // for the most recent post modification date
  return new Date()
}

/**
 * Handle conditional GET requests for feeds
 */
export function handleConditionalGet(
  request: Request,
  content: string,
  lastModified?: Date
): Response | null {
  const etag = generateETag(content, lastModified)
  const ifNoneMatch = request.headers.get('if-none-match')
  const ifModifiedSince = request.headers.get('if-modified-since')

  // Check ETag match
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        'Last-Modified': lastModified?.toUTCString() || new Date().toUTCString(),
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
      },
    })
  }

  // Check Last-Modified
  if (ifModifiedSince && lastModified) {
    const clientDate = new Date(ifModifiedSince)
    if (lastModified <= clientDate) {
      return new Response(null, {
        status: 304,
        headers: {
          ETag: etag,
          'Last-Modified': lastModified.toUTCString(),
          'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
        },
      })
    }
  }

  return null
}

/**
 * Create a cached response with proper headers
 */
export function createFeedResponse(
  content: string,
  contentType: string,
  lastModified?: Date
): Response {
  const etag = generateETag(content, lastModified)

  return new Response(content, {
    headers: {
      'Content-Type': `${contentType}; charset=utf-8`,
      'Content-Length': Buffer.byteLength(content).toString(),
      ETag: etag,
      'Last-Modified': lastModified?.toUTCString() || new Date().toUTCString(),
      'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
      'X-Robots-Tag': 'noindex',
      'X-Content-Type-Options': 'nosniff',
      // Compression will be handled by Next.js/Vercel automatically
      'Accept-Encoding': 'gzip, deflate, br',
    },
  })
}
