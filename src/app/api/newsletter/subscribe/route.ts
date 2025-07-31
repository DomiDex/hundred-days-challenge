import { NextResponse } from 'next/server'
import mailchimp from '@/lib/mailchimp'
import crypto from 'crypto'
import { validateEmail, sanitizeInput, createRateLimiter } from '@/lib/newsletter-validation'

// Rate limiter: 5 requests per minute per IP
const rateLimiter = createRateLimiter(5, 60000)

export async function POST(request: Request) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  if (!rateLimiter(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const { email, firstName, lastName, tags } = await request.json()

  // Validate and sanitize inputs
  if (!email || !validateEmail(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 })
  }

  const sanitizedEmail = sanitizeInput(email).toLowerCase()
  const sanitizedFirstName = firstName ? sanitizeInput(firstName) : ''
  const sanitizedLastName = lastName ? sanitizeInput(lastName) : ''

  try {
    // Generate subscriber hash for updates
    const subscriberHash = crypto.createHash('md5').update(sanitizedEmail).digest('hex')

    // Check if user already exists
    try {
      const member = await mailchimp.lists.getListMember(
        process.env.MAILCHIMP_AUDIENCE_ID!,
        subscriberHash
      )

      // Update existing member
      if (member.status === 'subscribed') {
        return NextResponse.json({
          message: 'You are already subscribed!',
          status: 'already_subscribed',
        })
      }

      // Resubscribe unsubscribed member
      await mailchimp.lists.updateListMember(process.env.MAILCHIMP_AUDIENCE_ID!, subscriberHash, {
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
      const response = await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID!, {
        email_address: sanitizedEmail,
        status: 'subscribed',
        merge_fields: {
          FNAME: sanitizedFirstName,
          LNAME: sanitizedLastName,
        },
        tags: tags || ['website-signup'],
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
