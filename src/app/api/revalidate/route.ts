import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createSecureApiRoute, verifyWebhookSignature } from '@/lib/api-auth'
import { ApiErrors, withErrorHandler } from '@/lib/error-handler'
import { getPrismicConfig } from '@/lib/env'
import { validateQueryParam } from '@/lib/validation'

async function handleRevalidate(request: NextRequest) {
  // Get webhook secret from config
  const { webhookSecret } = getPrismicConfig()

  // If webhook secret is configured, verify the signature
  if (webhookSecret && process.env.NODE_ENV === 'production') {
    const body = await request.text()

    if (!verifyWebhookSignature(request, body, webhookSecret)) {
      throw ApiErrors.Unauthorized('Invalid webhook signature')
    }

    // Parse the webhook payload
    const payload = JSON.parse(body)

    // Log webhook event
    console.log('Prismic webhook received:', {
      type: payload.type,
      domain: payload.domain,
      timestamp: new Date().toISOString(),
    })
  }

  // Allow manual revalidation with API key
  const tag = validateQueryParam(request.nextUrl.searchParams.get('tag'), { type: 'slug' }) as
    | string
    | null

  // Revalidate the specified tag or default to 'prismic'
  const revalidatedTag = tag || 'prismic'
  revalidateTag(revalidatedTag)

  // Log revalidation
  console.log('Cache revalidated:', {
    tag: revalidatedTag,
    timestamp: new Date().toISOString(),
    ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
  })

  return NextResponse.json({
    revalidated: true,
    tag: revalidatedTag,
    timestamp: Date.now(),
  })
}

// Export secure route with error handling
export const POST = withErrorHandler(
  createSecureApiRoute(handleRevalidate, {
    requireAuth: false, // Webhook uses signature instead
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // Allow 10 revalidations per minute
    },
    allowedMethods: ['POST'],
  })
)
