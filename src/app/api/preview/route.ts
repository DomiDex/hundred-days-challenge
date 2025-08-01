import { redirectToPreviewURL } from '@prismicio/next'
import { createClient } from '@/prismicio'
import { NextRequest, NextResponse } from 'next/server'
import { getSecurityConfig } from '@/lib/env'
import crypto from 'crypto'

// Simple in-memory rate limiting for preview access
const previewAttempts = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_ATTEMPTS = 5

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempt = previewAttempts.get(ip)

  if (!attempt || now - attempt.timestamp > RATE_LIMIT_WINDOW) {
    previewAttempts.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (attempt.count >= MAX_ATTEMPTS) {
    return false
  }

  attempt.count++
  return true
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of previewAttempts.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW * 2) {
      previewAttempts.delete(ip)
    }
  }
}, RATE_LIMIT_WINDOW)

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)

    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      console.warn(`Preview rate limit exceeded for IP: ${clientIp}`)
      return NextResponse.json(
        { error: 'Too many preview requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Get token from query params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const documentId = searchParams.get('documentId')

    // Validate preview token if configured
    const { previewSecret } = getSecurityConfig()
    if (previewSecret && process.env.NODE_ENV === 'production') {
      if (!token) {
        console.warn(`Preview access attempt without token from IP: ${clientIp}`)
        return NextResponse.json({ error: 'Preview token required' }, { status: 401 })
      }

      // Validate token format and expiry
      try {
        const [tokenData, signature] = token.split('.')
        if (!tokenData || !signature) {
          throw new Error('Invalid token format')
        }

        // Verify signature
        const expectedSignature = crypto
          .createHmac('sha256', previewSecret)
          .update(tokenData)
          .digest('base64url')

        if (signature !== expectedSignature) {
          throw new Error('Invalid token signature')
        }

        // Decode and validate token data
        const decoded = JSON.parse(Buffer.from(tokenData, 'base64url').toString())

        // Check expiry (1 hour)
        if (Date.now() > decoded.exp) {
          throw new Error('Token expired')
        }

        // Validate document ID matches if provided
        if (documentId && decoded.documentId !== documentId) {
          throw new Error('Document ID mismatch')
        }
      } catch (error) {
        console.warn(`Invalid preview token from IP: ${clientIp}`, error)
        return NextResponse.json({ error: 'Invalid or expired preview token' }, { status: 401 })
      }
    }

    // Log preview access
    console.log(`Preview access granted`, {
      ip: clientIp,
      documentId,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    })

    // Create Prismic client and redirect
    const client = createClient()

    // Redirect to preview URL
    return await redirectToPreviewURL({ client, request })
  } catch (error) {
    console.error('Preview route error:', error)
    return NextResponse.json(
      { error: 'An error occurred while setting up preview' },
      { status: 500 }
    )
  }
}
