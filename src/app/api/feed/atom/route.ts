import { generateFeeds } from '@/lib/feed-generator'
import crypto from 'crypto'

export const revalidate = 3600
export const dynamic = 'force-dynamic' // Explicitly mark as dynamic due to conditional GET support

export async function GET(request: Request) {
  try {
    // Check for conditional requests
    const ifNoneMatch = request.headers.get('if-none-match')
    const ifModifiedSince = request.headers.get('if-modified-since')
    
    const { atom } = await generateFeeds()
    
    // Generate ETag
    const etag = `"${generateETag(atom)}"`
    const lastModified = new Date().toUTCString()
    
    // Handle conditional GET
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 })
    }
    
    if (ifModifiedSince) {
      const modifiedSinceDate = new Date(ifModifiedSince)
      const currentDate = new Date(lastModified)
      if (modifiedSinceDate >= currentDate) {
        return new Response(null, { status: 304 })
      }
    }

    return new Response(atom, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
        'X-Robots-Tag': 'noindex',
        'Last-Modified': lastModified,
        'ETag': etag,
      },
    })
  } catch (error) {
    console.error('Error generating Atom feed:', error)
    return new Response('Error generating feed', { status: 500 })
  }
}

// Helper function for ETag generation
function generateETag(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex')
}