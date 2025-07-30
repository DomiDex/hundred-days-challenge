# Task 12: Prismic Webhook and Deployment Integration

## Priority: Medium

## Description

Set up Prismic webhooks to trigger automatic deployments on content changes and implement on-demand revalidation for optimal performance.

## Dependencies

- Task 11: Vercel Deployment Setup (must be completed)

## Implementation Steps

### 1. **Create Webhook Handler**

- Create `src/app/api/revalidate/route.ts`:

```typescript
import { revalidatePath, revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    // Verify webhook signature
    const signature = headers().get('x-prismic-signature')
    const secret = process.env.PRISMIC_WEBHOOK_SECRET

    if (!signature || !secret) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.text()
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')

    if (signature !== expectedSignature) {
      return Response.json({ message: 'Invalid signature' }, { status: 401 })
    }

    // Parse webhook payload
    const payload = JSON.parse(body)

    // Revalidate based on document type
    switch (payload.type) {
      case 'post':
        revalidatePath('/blog')
        revalidatePath(`/blog/${payload.uid}`)
        revalidateTag('posts')
        break
      case 'author':
        revalidatePath('/authors')
        revalidatePath(`/authors/${payload.uid}`)
        revalidateTag('authors')
        break
      case 'category':
        revalidatePath('/categories')
        revalidateTag('categories')
        break
      default:
        revalidatePath('/')
    }

    return Response.json({ revalidated: true, timestamp: Date.now() })
  } catch (error) {
    return Response.json({ message: 'Error processing webhook' }, { status: 500 })
  }
}
```

### 2. **Configure Prismic Webhooks**

In Prismic Dashboard:

```
Settings > Webhooks > Create a webhook

Name: Production Revalidation
URL: https://yourdomain.com/api/revalidate
Secret: <generate-secure-secret>

Triggers:
- Document published
- Document unpublished
- Document updated
```

### 3. **Create Deployment Webhook**

- Create `src/app/api/deploy/route.ts`:

```typescript
export async function POST(request: Request) {
  try {
    // Verify webhook secret
    const authHeader = headers().get('authorization')
    if (authHeader !== `Bearer ${process.env.DEPLOY_WEBHOOK_SECRET}`) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Trigger Vercel deployment
    const deployHook = process.env.VERCEL_DEPLOY_HOOK_URL

    const response = await fetch(deployHook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trigger: 'prismic-content-update',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error('Deployment trigger failed')
    }

    return Response.json({
      message: 'Deployment triggered',
      timestamp: Date.now(),
    })
  } catch (error) {
    return Response.json({ message: 'Error triggering deployment' }, { status: 500 })
  }
}
```

### 4. **Set Up Vercel Deploy Hooks**

In Vercel Dashboard:

```
Settings > Git > Deploy Hooks

Name: Prismic Content Update
Branch: main (for production)

Copy the webhook URL
```

### 5. **Configure Staging Webhooks**

Repeat for staging environment:

```
Staging Webhook URL: https://staging.yourdomain.com/api/revalidate
Staging Deploy Hook: Different Vercel hook for staging branch
```

### 6. **Implement Webhook Logging**

- Create `src/lib/webhook-logger.ts`:

```typescript
export async function logWebhookEvent(event: {
  type: string
  payload: any
  status: 'success' | 'error'
  message?: string
}) {
  console.log('[Webhook]', {
    timestamp: new Date().toISOString(),
    ...event,
  })

  // Optional: Send to monitoring service
  if (process.env.MONITORING_ENDPOINT) {
    await fetch(process.env.MONITORING_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(event),
    })
  }
}
```

### 7. **Add Rate Limiting**

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

// In webhook handler
const identifier = request.headers.get('x-forwarded-for') || 'anonymous'
const { success } = await ratelimit.limit(identifier)

if (!success) {
  return Response.json({ message: 'Rate limited' }, { status: 429 })
}
```

### 8. **Testing Webhooks**

- Create `scripts/test-webhook.js`:

```javascript
const crypto = require('crypto')
const fetch = require('node-fetch')

async function testWebhook() {
  const secret = process.env.PRISMIC_WEBHOOK_SECRET
  const payload = {
    type: 'post',
    uid: 'test-post',
    id: 'test-id',
  }

  const body = JSON.stringify(payload)
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex')

  const response = await fetch('http://localhost:3000/api/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-prismic-signature': signature,
    },
    body,
  })

  console.log('Response:', await response.json())
}

testWebhook()
```

## Webhook Configuration

### Environment Variables

```env
# Webhook Secrets
PRISMIC_WEBHOOK_SECRET=<generate-with-openssl>
DEPLOY_WEBHOOK_SECRET=<generate-with-openssl>
VERCEL_DEPLOY_HOOK_URL=<from-vercel-dashboard>

# Optional Monitoring
MONITORING_ENDPOINT=<your-monitoring-service>
```

### Security Best Practices

- Always verify webhook signatures
- Use strong, unique secrets
- Implement rate limiting
- Log all webhook events
- Monitor for failures
- Use HTTPS endpoints only

## Testing Checklist

- [ ] Webhook endpoint accessible
- [ ] Signature verification works
- [ ] Invalid signatures rejected
- [ ] Rate limiting functions
- [ ] Revalidation triggers correctly
- [ ] Deployment hooks work
- [ ] Logging captures events
- [ ] Error handling works

## Monitoring

- Set up alerts for webhook failures
- Monitor revalidation success rate
- Track deployment frequency
- Log webhook response times

## Success Criteria

- Content updates trigger revalidation
- Major changes trigger full deployment
- Webhook security implemented
- Rate limiting prevents abuse
- Proper logging and monitoring
- Both staging and production configured
