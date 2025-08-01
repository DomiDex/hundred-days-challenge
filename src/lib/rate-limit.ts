import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create Redis client for rate limiting
// In production, use Upstash Redis with proper credentials
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

// Fallback in-memory store for development
const inMemoryStore = new Map<string, { count: number; resetTime: number }>()

// Create different rate limiters for different use cases
export const rateLimiters = {
  // General API rate limiter
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        analytics: true,
        prefix: '@upstash/ratelimit:api',
      })
    : null,

  // Stricter rate limiter for authentication endpoints
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: '@upstash/ratelimit:auth',
      })
    : null,

  // Preview access rate limiter
  preview: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '5 m'),
        analytics: true,
        prefix: '@upstash/ratelimit:preview',
      })
    : null,

  // Newsletter subscription rate limiter
  newsletter: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        analytics: true,
        prefix: '@upstash/ratelimit:newsletter',
      })
    : null,
}

// Fallback rate limiter for development without Redis
export function fallbackRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  const key = `${identifier}:${Math.floor(now / windowMs)}`

  // Clean up old entries
  if (Math.random() < 0.01) {
    for (const [k] of inMemoryStore.entries()) {
      const [, timestamp] = k.split(':')
      if (parseInt(timestamp) * windowMs + windowMs < now) {
        inMemoryStore.delete(k)
      }
    }
  }

  const current = inMemoryStore.get(key) || { count: 0, resetTime: now + windowMs }

  if (current.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: current.resetTime,
    }
  }

  current.count++
  inMemoryStore.set(key, current)

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - current.count,
    reset: current.resetTime,
  }
}

// Helper to check rate limit
export async function checkRateLimit(
  type: keyof typeof rateLimiters,
  identifier: string
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const limiter = rateLimiters[type]

  if (!limiter) {
    // Fallback for development
    const limits = {
      api: { max: 100, window: 60000 },
      auth: { max: 5, window: 60000 },
      preview: { max: 10, window: 300000 },
      newsletter: { max: 3, window: 3600000 },
    }

    const config = limits[type]
    return fallbackRateLimit(identifier, config.max, config.window)
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  return {
    success,
    limit,
    remaining,
    reset,
  }
}

// Helper to get rate limit headers
export function getRateLimitHeaders(result: {
  limit: number
  remaining: number
  reset: number
}): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    ...(result.remaining === 0
      ? {
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        }
      : {}),
  }
}
