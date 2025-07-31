import { generateCategoryFeed } from '@/lib/feed-generator'
import { FeedAnalytics } from '@/lib/feed-analytics'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    // Track feed access
    await FeedAnalytics.trackFeedAccess(request, `category-${slug}`)

    // Check for conditional request
    const ifNoneMatch = request.headers.get('if-none-match')
    const ifModifiedSince = request.headers.get('if-modified-since')

    // Generate category-specific feed
    const { rss: rssFeed } = await generateCategoryFeed(slug)

    // Create ETag from content
    const etag = `"${generateETag(rssFeed)}"`
    const lastModified = new Date().toUTCString()

    // Handle conditional requests
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
      const ifModifiedDate = new Date(ifModifiedSince)
      const currentDate = new Date(lastModified)
      if (ifModifiedDate >= currentDate) {
        return new Response(null, { status: 304 })
      }
    }

    // Return feed with proper headers
    return new Response(rssFeed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Content-Length': rssFeed.length.toString(),
        ETag: etag,
        'Last-Modified': lastModified,
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
        'X-Robots-Tag': 'noindex',
        'X-Content-Type-Options': 'nosniff',
        'X-Feed-Category': slug,
      },
    })
  } catch (error) {
    console.error('Error generating category feed:', error)

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Feed Error</title>
          <description>Unable to generate feed for category: ${slug}</description>
          <link>${process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'}</link>
        </channel>
      </rss>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      }
    )
  }
}

// Helper function for ETag generation
function generateETag(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex')
}
