import { generateCategoryFeed } from '@/lib/feed-generator'
import crypto from 'crypto'

export const revalidate = 3600
export const dynamic = 'force-dynamic' // Explicitly mark as dynamic

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const { rss } = await generateCategoryFeed(slug)
    
    // Generate ETag
    const etag = `"${generateETag(rss)}"`
    const lastModified = new Date().toUTCString()
    
    // Check for conditional requests
    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 })
    }
    
    return new Response(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
        'X-Robots-Tag': 'noindex',
        'Last-Modified': lastModified,
        'ETag': etag,
      },
    })
  } catch (error) {
    console.error('Error generating category feed:', error)
    return new Response('Category not found', { status: 404 })
  }
}

// Helper function for ETag generation
function generateETag(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex')
}