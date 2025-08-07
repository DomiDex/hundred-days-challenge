import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle feed-specific middleware without affecting other routes
  if (
    pathname.match(/\/(rss|atom|feed)\.xml|feed\.json|opensearch\.xml/) ||
    pathname.startsWith('/feeds/')
  ) {
    const response = NextResponse.next()

    // Add compression hints for edge runtime
    const acceptEncoding = request.headers.get('accept-encoding') || ''
    if (acceptEncoding) {
      response.headers.set('Vary', 'Accept-Encoding')
    }

    // Add feed-specific cache headers
    response.headers.set('X-Robots-Tag', 'noindex, follow')

    return response
  }

  // Skip middleware for all other routes to avoid hydration issues
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only match feed routes
    '/rss.xml',
    '/atom.xml',
    '/feed.json',
    '/opensearch.xml',
    '/feeds/:path*',
  ],
}
