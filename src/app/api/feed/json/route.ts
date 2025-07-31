import { generateFeeds } from '@/lib/feed-generator'
import { FeedAnalytics } from '@/lib/feed-analytics'
import crypto from 'crypto'

export const revalidate = 3600
export const dynamic = 'force-dynamic' // Explicitly mark as dynamic due to conditional GET support

export async function GET(request: Request) {
  try {
    // Track feed access
    await FeedAnalytics.trackFeedAccess(request, 'json')

    // Check for conditional requests
    const ifNoneMatch = request.headers.get('if-none-match')
    const ifModifiedSince = request.headers.get('if-modified-since')

    const { json } = await generateFeeds()

    // Generate ETag
    const etag = `"${generateETag(json)}"`
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

    return new Response(json, {
      headers: {
        'Content-Type': 'application/feed+json; charset=utf-8',
        'Content-Length': json.length.toString(),
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
        'X-Robots-Tag': 'noindex',
        'Last-Modified': lastModified,
        ETag: etag,
        'X-Content-Type-Options': 'nosniff',
        // CORS headers for JSON feeds
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    })
  } catch (error) {
    console.error('Error generating JSON feed:', error)
    return new Response('Error generating feed', { status: 500 })
  }
}

// Helper function for ETag generation
function generateETag(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex')
}
