import { NextRequest, NextResponse } from 'next/server'
import mailchimp from '@/lib/mailchimp'
import crypto from 'crypto'
import { validateEmail, sanitizeInput } from '@/lib/newsletter-validation'
import { withErrorHandler } from '@/lib/error-handler'
import { validateRequestBody } from '@/lib/validation'
import { createSecureApiRoute } from '@/lib/api-auth'
import { getMailchimpConfig } from '@/lib/env'

async function handleSubscribe(request: NextRequest) {
  // Parse and validate request body
  const rawBody = await request.json()
  const body = validateRequestBody<{
    email: string
    firstName?: string
    lastName?: string
    tags?: string[]
  }>(rawBody, {
    email: { required: true, type: 'string' },
    firstName: { required: false, type: 'string', sanitizer: (v) => sanitizeInput(String(v)) },
    lastName: { required: false, type: 'string', sanitizer: (v) => sanitizeInput(String(v)) },
    tags: { required: false, type: 'array' },
  })

  // Validate and sanitize email
  if (!validateEmail(body.email)) {
    return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 })
  }

  const sanitizedEmail = sanitizeInput(body.email).toLowerCase()
  const sanitizedFirstName = body.firstName || ''
  const sanitizedLastName = body.lastName || ''

  // Get Mailchimp config
  const mailchimpConfig = getMailchimpConfig()
  if (!mailchimpConfig) {
    console.error('Mailchimp not configured')
    return NextResponse.json(
      { error: 'Newsletter service temporarily unavailable' },
      { status: 503 }
    )
  }

  try {
    // Generate subscriber hash for updates
    const subscriberHash = crypto.createHash('md5').update(sanitizedEmail).digest('hex')

    // Check if user already exists
    try {
      const member = await mailchimp.lists.getListMember(mailchimpConfig.audienceId, subscriberHash)

      // Update existing member
      if (member.status === 'subscribed') {
        return NextResponse.json({
          message: 'You are already subscribed!',
          status: 'already_subscribed',
        })
      }

      // Resubscribe unsubscribed member
      await mailchimp.lists.updateListMember(mailchimpConfig.audienceId, subscriberHash, {
        status: 'subscribed',
        merge_fields: {
          FNAME: sanitizedFirstName,
          LNAME: sanitizedLastName,
        },
      })

      return NextResponse.json({
        message: 'Successfully resubscribed to newsletter!',
        status: 'resubscribed',
      })
    } catch {
      // Member doesn't exist, create new
      const response = await mailchimp.lists.addListMember(mailchimpConfig.audienceId, {
        email_address: sanitizedEmail,
        status: 'subscribed',
        merge_fields: {
          FNAME: sanitizedFirstName,
          LNAME: sanitizedLastName,
        },
        tags: body.tags || ['website-signup'],
      })

      return NextResponse.json({
        message: 'Successfully subscribed to newsletter!',
        status: 'subscribed',
        id: (response as { id: string }).id,
      })
    }
  } catch (error) {
    console.error('Mailchimp error:', error)

    // Handle specific Mailchimp errors
    const mailchimpError = error as { status?: number }
    if (mailchimpError.status === 400) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (mailchimpError.status === 401) {
      console.error('Mailchimp authentication failed. Check API key and server.')
      return NextResponse.json(
        { error: 'Newsletter service temporarily unavailable.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    )
  }
}

// Export secure route with error handling
export const POST = withErrorHandler(
  createSecureApiRoute(handleSubscribe, {
    requireAuth: false, // Public endpoint
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5, // 5 requests per minute
    },
    allowedMethods: ['POST'],
  })
)
