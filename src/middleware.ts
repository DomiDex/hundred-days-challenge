import { NextRequest, NextResponse } from 'next/server'
import { getSecurityConfig, buildCSPHeader } from '@/lib/security-config'

export function middleware(request: NextRequest) {
  // Generate nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Clone the request headers
  const requestHeaders = new Headers(request.headers)

  // Add nonce to request headers so it can be read in server components
  requestHeaders.set('x-nonce', nonce)

  // Get environment-specific security configuration
  const securityConfig = getSecurityConfig()

  // Build CSP header with environment-specific configuration
  const cspHeader = buildCSPHeader(securityConfig, nonce)

  // Create response with modified request
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Add security headers to response
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Nonce', nonce)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
