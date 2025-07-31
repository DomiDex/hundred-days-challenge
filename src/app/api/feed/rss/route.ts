import { generateFeeds } from '@/lib/feed-generator'
import { FeedAnalytics } from '@/lib/feed-analytics'
import crypto from 'crypto'

export const revalidate = 3600 // Revalidate every hour

export const dynamic = 'force-dynamic' // Explicitly mark as dynamic due to conditional GET support

export async function GET(request: Request) {
  try {
    // Track feed access
    await FeedAnalytics.trackFeedAccess(request, 'rss')

    // Check for conditional requests
    const ifNoneMatch = request.headers.get('if-none-match')
    const ifModifiedSince = request.headers.get('if-modified-since')

    const { rss } = await generateFeeds()

    // Generate ETag
    const etag = `"${generateETag(rss)}"`
    const lastModified = new Date().toUTCString()

    // Handle conditional GET
    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          ETag: etag,
          'Last-Modified': lastModified,
          'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
        },
      })
    }

    if (ifModifiedSince) {
      const modifiedSinceDate = new Date(ifModifiedSince)
      const currentDate = new Date(lastModified)
      if (modifiedSinceDate >= currentDate) {
        return new Response(null, { status: 304 })
      }
    }

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Content-Length': rss.length.toString(),
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
        // SEO best practices headers
        'X-Robots-Tag': 'noindex', // Prevent feed URLs from appearing in search results
        'Last-Modified': lastModified,
        ETag: etag,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating feed', { status: 500 })
  }
}

// Helper function for ETag generation
function generateETag(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex')
}
