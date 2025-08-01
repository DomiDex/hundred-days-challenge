import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-mailchimp-signature')

  // Verify webhook signature if webhook key is configured
  const webhookKey = process.env.MAILCHIMP_WEBHOOK_KEY
  if (webhookKey && signature) {
    const expectedSignature = crypto.createHmac('sha256', webhookKey).update(body).digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  try {
    const data = JSON.parse(body)

    // Handle different webhook events
    switch (data.type) {
      case 'subscribe':
        console.log('New subscriber:', data.data.email)
        // You could track this in your database or analytics
        break

      case 'unsubscribe':
        console.log('Unsubscribed:', data.data.email)
        // Update your records if needed
        break

      case 'profile':
        console.log('Profile updated:', data.data.email)
        // Handle profile updates
        break

      case 'cleaned':
        console.log('Email cleaned:', data.data.email, 'Reason:', data.data.reason)
        // Handle bounced or invalid emails
        break

      default:
        console.log('Unknown webhook type:', data.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
  }
}
