import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSecurityConfig } from './env'

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// CORS configuration
const ALLOWED_ORIGINS =
  process.env.NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://localhost:3001']
    : [process.env.NEXT_PUBLIC_SITE_URL || '']

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface ApiAuthOptions {
  rateLimit?: RateLimitConfig
  requireAuth?: boolean
  allowedMethods?: string[]
  cors?: boolean
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
}

export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'

  // Use API key if provided for better rate limiting
  const apiKey = request.headers.get('x-api-key')

  return apiKey ? `key:${apiKey}` : `ip:${ip}`
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): boolean {
  const now = Date.now()
  const limit = rateLimitStore.get(identifier)

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return true
  }

  if (limit.count >= config.maxRequests) {
    return false
  }

  limit.count++
  return true
}

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    return false
  }

  const { apiSecretKey } = getSecurityConfig()

  // In development, allow a test key
  if (process.env.NODE_ENV === 'development' && apiKey === 'test-api-key') {
    return true
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(apiSecretKey))
}

export function verifyWebhookSignature(
  request: NextRequest,
  body: string,
  secret: string
): boolean {
  const signature = request.headers.get('x-webhook-signature')

  if (!signature) {
    return false
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')

  // Constant-time comparison
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

export function setCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin')

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  if (request.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, X-API-Key, X-Webhook-Signature'
    )
    response.headers.set('Access-Control-Max-Age', '86400')
  }

  return response
}

export async function withApiAuth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: ApiAuthOptions = {}
): Promise<NextResponse> {
  const {
    rateLimit = DEFAULT_RATE_LIMIT,
    requireAuth = true,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
    cors = true,
  } = options

  try {
    // Check method
    if (!allowedMethods.includes(request.method)) {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 })
      return cors ? setCorsHeaders(request, response) : response
    }

    // Check rate limit
    const identifier = getClientIdentifier(request)
    if (!checkRateLimit(identifier, rateLimit)) {
      const response = NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.windowMs / 1000)),
          },
        }
      )
      return cors ? setCorsHeaders(request, response) : response
    }

    // Check authentication
    if (requireAuth && !validateApiKey(request)) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return cors ? setCorsHeaders(request, response) : response
    }

    // Call handler
    const response = await handler(request)

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Cache-Control', 'no-store')

    return cors ? setCorsHeaders(request, response) : response
  } catch (error) {
    console.error('API error:', error)

    // Don't leak error details in production
    const message =
      process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'

    const response = NextResponse.json({ error: message }, { status: 500 })

    return cors ? setCorsHeaders(request, response) : response
  }
}

// Helper to create a secure API route
export function createSecureApiRoute(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options?: ApiAuthOptions
) {
  return (request: NextRequest) => withApiAuth(request, handler, options)
}
