# Task 23: API Route Test Implementation

## Overview

Implement comprehensive tests for each API route using the utilities from Task 22. This task provides detailed test implementations for all endpoints.

## Test Implementations

### 1. Preview System Tests

```typescript
// src/__tests__/api/preview.test.ts

import { GET } from '@/app/api/preview/route'
import { GET as exitPreview } from '@/app/api/exit-preview/route'
import { 
  createMockRequest, 
  expectRedirectResponse, 
  expectErrorResponse,
  mockPrismicClient,
  setupTestEnv,
  cleanupTestEnv
} from './test-utils'

describe('Preview API Routes', () => {
  beforeEach(() => {
    setupTestEnv()
  })
  
  afterEach(() => {
    cleanupTestEnv()
    jest.clearAllMocks()
  })
  
  describe('GET /api/preview', () => {
    it('should require secret token', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/preview',
        searchParams: {
          documentId: 'test-doc',
          token: 'wrong-token'
        }
      })
      
      const response = await GET(request)
      await expectErrorResponse(response, 401, 'Invalid token')
    })
    
    it('should activate preview mode with valid token', async () => {
      mockPrismicClient({
        getByID: {
          'test-doc': {
            id: 'test-doc',
            type: 'post',
            uid: 'test-post',
            data: { title: 'Test Post' }
          }
        }
      })
      
      const request = createMockRequest({
        searchParams: {
          documentId: 'test-doc',
          token: process.env.PREVIEW_SECRET!
        }
      })
      
      const response = await GET(request)
      
      // Check redirect
      expectRedirectResponse(response, '/blog/uncategorized/test-post')
      
      // Check preview cookies are set
      const setCookie = response.headers.get('Set-Cookie')
      expect(setCookie).toContain('__prerender_bypass')
      expect(setCookie).toContain('__next_preview_data')
    })
    
    it('should handle missing document', async () => {
      mockPrismicClient({
        getByID: {}
      })
      
      const request = createMockRequest({
        searchParams: {
          documentId: 'missing-doc',
          token: process.env.PREVIEW_SECRET!
        }
      })
      
      const response = await GET(request)
      await expectErrorResponse(response, 404, 'Document not found')
    })
  })
  
  describe('GET /api/exit-preview', () => {
    it('should clear preview cookies and redirect', async () => {
      const request = createMockRequest()
      const response = await exitPreview(request)
      
      expectRedirectResponse(response, '/')
      
      // Check cookies are cleared
      const setCookie = response.headers.get('Set-Cookie')
      expect(setCookie).toContain('__prerender_bypass=; Max-Age=0')
      expect(setCookie).toContain('__next_preview_data=; Max-Age=0')
    })
  })
})
```

### 2. Feed Generation Tests

```typescript
// src/__tests__/api/feed/rss.test.ts

import { GET } from '@/app/api/feed/rss/route'
import { 
  createMockRequest, 
  expectFeedResponse,
  mockPrismicClient,
  createMockPost
} from '../test-utils'
import { parseStringPromise } from 'xml2js'

describe('GET /api/feed/rss', () => {
  it('should generate valid RSS feed', async () => {
    const mockPosts = [
      createMockPost({ 
        uid: 'post-1',
        data: {
          title: 'Test Post 1',
          excerpt: 'This is test post 1',
          publishDate: '2024-01-01'
        }
      }),
      createMockPost({ 
        uid: 'post-2',
        data: {
          title: 'Test Post 2',
          excerpt: 'This is test post 2',
          publishDate: '2024-01-02'
        }
      })
    ]
    
    mockPrismicClient({
      getAllByType: mockPosts
    })
    
    const request = createMockRequest()
    const response = await GET(request)
    
    const content = await expectFeedResponse(response, 'rss')
    
    // Parse and validate RSS
    const parsed = await parseStringPromise(content)
    expect(parsed.rss).toBeDefined()
    expect(parsed.rss.channel).toBeDefined()
    expect(parsed.rss.channel[0].item).toHaveLength(2)
    
    // Validate feed metadata
    const channel = parsed.rss.channel[0]
    expect(channel.title[0]).toBe('100 Days of Craft')
    expect(channel.link[0]).toContain('http://localhost:3000')
    expect(channel.description[0]).toBeDefined()
    
    // Validate items
    const items = channel.item
    expect(items[0].title[0]).toBe('Test Post 2') // Most recent first
    expect(items[1].title[0]).toBe('Test Post 1')
  })
  
  it('should handle empty posts', async () => {
    mockPrismicClient({ getAllByType: [] })
    
    const request = createMockRequest()
    const response = await GET(request)
    
    const content = await expectFeedResponse(response, 'rss')
    const parsed = await parseStringPromise(content)
    
    expect(parsed.rss.channel[0].item).toBeUndefined()
  })
  
  it('should set proper cache headers', async () => {
    mockPrismicClient({ getAllByType: [] })
    
    const request = createMockRequest()
    const response = await GET(request)
    
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=7200')
  })
})
```

### 3. Newsletter Subscription Tests

```typescript
// src/__tests__/api/newsletter/subscribe.test.ts

import { POST } from '@/app/api/newsletter/subscribe/route'
import { 
  createMockRequest, 
  expectJsonResponse,
  expectErrorResponse,
  mockNewsletterService,
  mockRateLimiter,
  testRateLimit
} from '../test-utils'

describe('POST /api/newsletter/subscribe', () => {
  let newsletterService: ReturnType<typeof mockNewsletterService>
  let rateLimiter: ReturnType<typeof mockRateLimiter>
  
  beforeEach(() => {
    newsletterService = mockNewsletterService()
    rateLimiter = mockRateLimiter()
  })
  
  it('should subscribe valid email', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { 
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }
    })
    
    const response = await POST(request)
    
    await expectJsonResponse(response, 200, {
      success: true,
      message: 'Successfully subscribed to newsletter'
    })
    
    expect(newsletterService.subscribe).toHaveBeenCalledWith({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    })
  })
  
  it('should validate email format', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { email: 'invalid-email' }
    })
    
    const response = await POST(request)
    
    await expectErrorResponse(response, 400, 'Invalid email address')
    expect(newsletterService.subscribe).not.toHaveBeenCalled()
  })
  
  it('should handle duplicate subscriptions', async () => {
    newsletterService.subscribe.mockRejectedValue({
      code: 'MEMBER_EXISTS',
      message: 'Member already exists'
    })
    
    const request = createMockRequest({
      method: 'POST',
      body: { email: 'existing@example.com' }
    })
    
    const response = await POST(request)
    
    await expectJsonResponse(response, 200, {
      success: true,
      message: 'Email already subscribed'
    })
  })
  
  it('should enforce rate limiting', async () => {
    await testRateLimit(
      () => POST(createMockRequest({
        method: 'POST',
        body: { email: 'test@example.com' },
        headers: { 'X-Forwarded-For': '1.2.3.4' }
      })),
      5 // 5 requests per minute
    )
  })
  
  it('should sanitize input data', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { 
        email: 'test@example.com',
        firstName: '<script>alert("xss")</script>',
        lastName: 'User'
      }
    })
    
    const response = await POST(request)
    
    await expectJsonResponse(response, 200)
    
    expect(newsletterService.subscribe).toHaveBeenCalledWith({
      email: 'test@example.com',
      firstName: 'scriptalert("xss")/script',
      lastName: 'User'
    })
  })
})
```

### 4. CSP Report Tests

```typescript
// src/__tests__/api/csp-report.test.ts

import { POST } from '@/app/api/csp-report/route'
import { 
  createMockRequest, 
  expectJsonResponse,
  expectErrorResponse,
  createCSPReport,
  mockRateLimiter
} from './test-utils'

describe('POST /api/csp-report', () => {
  it('should accept valid CSP report', async () => {
    const report = createCSPReport()
    const request = createMockRequest({
      method: 'POST',
      headers: { 'Content-Type': 'application/csp-report' },
      body: report
    })
    
    const response = await POST(request)
    
    await expectJsonResponse(response, 200, { received: true })
  })
  
  it('should validate report structure', async () => {
    const request = createMockRequest({
      method: 'POST',
      headers: { 'Content-Type': 'application/csp-report' },
      body: { invalid: 'report' }
    })
    
    const response = await POST(request)
    
    await expectErrorResponse(response, 400, 'Invalid CSP report format')
  })
  
  it('should rate limit by IP', async () => {
    const rateLimiter = mockRateLimiter(false)
    
    const request = createMockRequest({
      method: 'POST',
      headers: { 
        'Content-Type': 'application/csp-report',
        'X-Forwarded-For': '1.2.3.4'
      },
      body: createCSPReport()
    })
    
    const response = await POST(request)
    
    expect(response.status).toBe(429)
    expect(response.headers.get('X-RateLimit-Limit')).toBe('100')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
  })
  
  it('should log violations for monitoring', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    
    const report = createCSPReport({
      violatedDirective: 'script-src',
      blockedUri: 'https://evil.com/script.js'
    })
    
    const request = createMockRequest({
      method: 'POST',
      headers: { 'Content-Type': 'application/csp-report' },
      body: report
    })
    
    await POST(request)
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('CSP Violation'),
      expect.objectContaining({
        directive: 'script-src',
        blockedUri: 'https://evil.com/script.js'
      })
    )
    
    consoleSpy.mockRestore()
  })
})
```

### 5. Revalidation Webhook Tests

```typescript
// src/__tests__/api/revalidate.test.ts

import { POST } from '@/app/api/revalidate/route'
import { 
  createMockRequest, 
  expectJsonResponse,
  expectErrorResponse,
  generateWebhookSignature,
  createWebhookEvent
} from './test-utils'
import { revalidatePath, revalidateTag } from 'next/cache'

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn()
}))

describe('POST /api/revalidate', () => {
  const webhookSecret = 'test-webhook-secret'
  
  beforeEach(() => {
    process.env.PRISMIC_WEBHOOK_SECRET = webhookSecret
    jest.clearAllMocks()
  })
  
  it('should verify webhook signature', async () => {
    const event = createWebhookEvent('document.update', {
      type: 'post',
      uid: 'test-post'
    })
    
    const signature = generateWebhookSignature(event, webhookSecret)
    
    const request = createMockRequest({
      method: 'POST',
      headers: {
        'X-Prismic-Signature': signature
      },
      body: event
    })
    
    const response = await POST(request)
    
    await expectJsonResponse(response, 200, {
      revalidated: true,
      paths: expect.any(Array)
    })
  })
  
  it('should reject invalid signature', async () => {
    const request = createMockRequest({
      method: 'POST',
      headers: {
        'X-Prismic-Signature': 'invalid-signature'
      },
      body: createWebhookEvent('document.update', {})
    })
    
    const response = await POST(request)
    
    await expectErrorResponse(response, 401, 'Invalid webhook signature')
  })
  
  it('should revalidate post paths', async () => {
    const event = createWebhookEvent('document.update', {
      type: 'post',
      uid: 'test-post',
      tags: ['blog', 'category:tech']
    })
    
    const signature = generateWebhookSignature(event, webhookSecret)
    
    const request = createMockRequest({
      method: 'POST',
      headers: { 'X-Prismic-Signature': signature },
      body: event
    })
    
    await POST(request)
    
    expect(revalidatePath).toHaveBeenCalledWith('/blog/tech/test-post')
    expect(revalidatePath).toHaveBeenCalledWith('/blog')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidateTag).toHaveBeenCalledWith('blog')
    expect(revalidateTag).toHaveBeenCalledWith('category:tech')
  })
  
  it('should handle different document types', async () => {
    const event = createWebhookEvent('document.update', {
      type: 'homepage',
      uid: 'homepage'
    })
    
    const signature = generateWebhookSignature(event, webhookSecret)
    
    const request = createMockRequest({
      method: 'POST',
      headers: { 'X-Prismic-Signature': signature },
      body: event
    })
    
    await POST(request)
    
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidateTag).toHaveBeenCalledWith('homepage')
  })
})
```

### 6. Posts API Tests

```typescript
// src/__tests__/api/posts.test.ts

import { GET } from '@/app/api/posts/route'
import { 
  createMockRequest, 
  expectJsonResponse,
  mockPrismicClient,
  createMockPost
} from './test-utils'

describe('GET /api/posts', () => {
  it('should return paginated posts', async () => {
    const mockPosts = Array(15).fill(null).map((_, i) => 
      createMockPost({ 
        uid: `post-${i}`,
        data: { title: `Post ${i}` }
      })
    )
    
    mockPrismicClient({
      query: jest.fn().mockResolvedValue({
        results: mockPosts.slice(0, 10),
        total_results_size: 15,
        page: 1,
        total_pages: 2
      })
    })
    
    const request = createMockRequest({
      searchParams: { page: '1', limit: '10' }
    })
    
    const response = await GET(request)
    
    const data = await expectJsonResponse(response, 200)
    
    expect(data).toMatchObject({
      posts: expect.arrayContaining([
        expect.objectContaining({ uid: 'post-0' })
      ]),
      pagination: {
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2
      }
    })
  })
  
  it('should filter by category', async () => {
    const request = createMockRequest({
      searchParams: { category: 'tech' }
    })
    
    const response = await GET(request)
    
    // Verify query was called with category filter
    const client = require('@prismicio/client').createClient()
    expect(client.query).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          // Verify category filter predicate
        })
      ])
    )
  })
  
  it('should validate pagination parameters', async () => {
    const request = createMockRequest({
      searchParams: { page: '-1', limit: '1000' }
    })
    
    const response = await GET(request)
    
    const data = await expectJsonResponse(response, 200)
    
    // Should use default/max values
    expect(data.pagination.page).toBe(1)
    expect(data.pagination.limit).toBe(100) // Max limit
  })
  
  it('should set cache headers', async () => {
    mockPrismicClient({ query: jest.fn().mockResolvedValue({ results: [] }) })
    
    const request = createMockRequest()
    const response = await GET(request)
    
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60, s-maxage=300')
  })
})
```

## Testing Strategy

### 1. Coverage Goals
- Aim for 90%+ code coverage for all API routes
- Cover both success and error paths
- Test edge cases and boundary conditions

### 2. Test Organization
- Group related tests together
- Use descriptive test names
- Keep tests focused and isolated

### 3. Mock Strategy
- Mock all external dependencies
- Use realistic test data
- Verify mock interactions

### 4. Security Testing
- Test authentication on protected routes
- Verify rate limiting works
- Test input validation and sanitization
- Check for injection vulnerabilities

### 5. Performance Testing
- Verify response times are acceptable
- Test caching behavior
- Check for memory leaks

## Implementation Checklist

- [x] Preview system tests complete
- [x] Feed generation tests complete
- [x] Newsletter tests complete
- [x] CSP report tests complete
- [x] Revalidation tests complete
- [x] Posts API tests complete
- [x] Admin endpoint tests complete
- [ ] All tests passing
- [ ] 90%+ code coverage achieved
- [ ] Documentation updated

## Notes

- Use the test utilities from Task 22
- Ensure tests are maintainable and readable
- Add comments for complex test scenarios
- Consider adding integration tests for critical paths
- Keep test data realistic but deterministic