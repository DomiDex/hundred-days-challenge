# Task 22: API Testing Utilities and Helpers

## Overview

Create comprehensive testing utilities and helpers specifically for API route testing to ensure consistent, maintainable, and thorough tests across all endpoints.

## Test Utilities to Implement

### 1. Core API Testing Utilities

```typescript
// src/__tests__/api/test-utils/request.ts

import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

/**
 * Creates a mock NextRequest for testing API routes
 */
export function createMockRequest(options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string>
  searchParams?: Record<string, string>
  cookies?: Record<string, string>
} = {}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    headers: customHeaders = {},
    body,
    params = {},
    searchParams = {},
    cookies = {}
  } = options

  // Create URL with search params
  const urlObj = new URL(url)
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })

  // Create headers
  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    ...customHeaders
  })

  // Add cookies to headers
  if (Object.keys(cookies).length > 0) {
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')
    requestHeaders.set('Cookie', cookieString)
  }

  // Create request init
  const init: RequestInit = {
    method,
    headers: requestHeaders,
  }

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    init.body = JSON.stringify(body)
  }

  const request = new NextRequest(urlObj.toString(), init)

  // Mock params (for dynamic routes)
  if (Object.keys(params).length > 0) {
    Object.defineProperty(request, 'params', {
      value: params,
      writable: false
    })
  }

  return request
}

/**
 * Creates mock headers for testing
 */
export function createMockHeaders(customHeaders: Record<string, string> = {}): Headers {
  return new Headers({
    'Content-Type': 'application/json',
    'User-Agent': 'Jest Test',
    ...customHeaders
  })
}
```

### 2. Response Testing Helpers

```typescript
// src/__tests__/api/test-utils/response.ts

/**
 * Asserts that a response is valid JSON with expected status
 */
export async function expectJsonResponse(
  response: Response,
  expectedStatus: number,
  expectedBody?: any
): Promise<any> {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('Content-Type')).toContain('application/json')
  
  const json = await response.json()
  
  if (expectedBody !== undefined) {
    expect(json).toEqual(expectedBody)
  }
  
  return json
}

/**
 * Asserts that a response is an error with expected message
 */
export async function expectErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedMessage?: string
): Promise<void> {
  expect(response.status).toBe(expectedStatus)
  
  const json = await response.json()
  expect(json).toHaveProperty('error')
  
  if (expectedMessage) {
    expect(json.error).toBe(expectedMessage)
  }
}

/**
 * Asserts that a response is a valid feed
 */
export async function expectFeedResponse(
  response: Response,
  contentType: 'rss' | 'atom' | 'json'
): Promise<string> {
  expect(response.status).toBe(200)
  
  const expectedContentTypes = {
    rss: 'application/rss+xml',
    atom: 'application/atom+xml',
    json: 'application/feed+json'
  }
  
  expect(response.headers.get('Content-Type')).toContain(expectedContentTypes[contentType])
  expect(response.headers.get('Cache-Control')).toBeDefined()
  
  const content = await response.text()
  expect(content).toBeTruthy()
  
  return content
}

/**
 * Asserts redirect response
 */
export function expectRedirectResponse(
  response: Response,
  expectedUrl: string,
  expectedStatus: number = 307
): void {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('Location')).toBe(expectedUrl)
}
```

### 3. Authentication & Security Helpers

```typescript
// src/__tests__/api/test-utils/auth.ts

/**
 * Creates authorization header with bearer token
 */
export function createAuthHeader(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`
  }
}

/**
 * Generates a valid JWT token for testing
 */
export function generateTestToken(payload: {
  sub?: string
  role?: string
  exp?: number
} = {}): string {
  // Simple base64 encoded token for testing
  const header = { alg: 'HS256', typ: 'JWT' }
  const defaultPayload = {
    sub: 'test-user',
    role: 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload
  }
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(defaultPayload)).toString('base64url')
  const signature = 'test-signature'
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Creates CSRF token header
 */
export function createCSRFHeader(token: string): Record<string, string> {
  return {
    'X-CSRF-Token': token
  }
}

/**
 * Generates webhook signature
 */
export function generateWebhookSignature(
  payload: string | object,
  secret: string
): string {
  const crypto = require('crypto')
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload)
  
  return crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex')
}
```

### 4. Mock Service Factories

```typescript
// src/__tests__/api/test-utils/mocks.ts

import { createClient } from '@prismicio/client'

/**
 * Mocks Prismic client with predefined responses
 */
export function mockPrismicClient(responses: {
  getByUID?: Record<string, any>
  getAllByType?: any[]
  getByID?: Record<string, any>
} = {}) {
  const client = {
    getByUID: jest.fn().mockImplementation((type, uid) => {
      if (responses.getByUID?.[uid]) {
        return Promise.resolve(responses.getByUID[uid])
      }
      return Promise.reject(new Error('Document not found'))
    }),
    getAllByType: jest.fn().mockResolvedValue(responses.getAllByType || []),
    getByID: jest.fn().mockImplementation((id) => {
      if (responses.getByID?.[id]) {
        return Promise.resolve(responses.getByID[id])
      }
      return Promise.reject(new Error('Document not found'))
    }),
    query: jest.fn().mockResolvedValue({ results: [] })
  }
  
  jest.mocked(createClient).mockReturnValue(client as any)
  return client
}

/**
 * Mocks newsletter service
 */
export function mockNewsletterService() {
  return {
    subscribe: jest.fn().mockResolvedValue({ id: 'sub_123', status: 'pending' }),
    unsubscribe: jest.fn().mockResolvedValue({ success: true }),
    verifyWebhook: jest.fn().mockReturnValue(true),
    processWebhook: jest.fn().mockResolvedValue({ processed: true })
  }
}

/**
 * Mocks rate limiter
 */
export function mockRateLimiter(allowed: boolean = true) {
  return {
    check: jest.fn().mockResolvedValue({
      success: allowed,
      limit: 100,
      remaining: allowed ? 99 : 0,
      reset: new Date(Date.now() + 3600000)
    })
  }
}
```

### 5. Data Generators

```typescript
// src/__tests__/api/test-utils/generators.ts

/**
 * Generates a CSP violation report
 */
export function createCSPReport(overrides: Partial<{
  documentUri: string
  violatedDirective: string
  effectiveDirective: string
  originalPolicy: string
  blockedUri: string
  statusCode: number
  referrer: string
  scriptSample: string
  disposition: string
}> = {}): any {
  return {
    'csp-report': {
      'document-uri': 'https://example.com/page',
      'violated-directive': 'script-src',
      'effective-directive': 'script-src',
      'original-policy': "default-src 'self'",
      'blocked-uri': 'https://evil.com/script.js',
      'status-code': 0,
      'referrer': '',
      'script-sample': '',
      'disposition': 'enforce',
      ...overrides
    }
  }
}

/**
 * Generates newsletter subscription data
 */
export function createSubscriptionData(overrides: Partial<{
  email: string
  firstName: string
  lastName: string
  tags: string[]
}> = {}) {
  return {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    tags: ['blog', 'newsletter'],
    ...overrides
  }
}

/**
 * Generates webhook event
 */
export function createWebhookEvent(type: string, data: any = {}) {
  return {
    id: 'evt_123',
    type,
    created: Date.now(),
    data,
    signature: 'test-signature'
  }
}
```

### 6. Test Environment Setup

```typescript
// src/__tests__/api/test-utils/setup.ts

/**
 * Sets up test environment variables
 */
export function setupTestEnv(overrides: Record<string, string> = {}) {
  const defaults = {
    NODE_ENV: 'test',
    PRISMIC_ACCESS_TOKEN: 'test-token',
    PRISMIC_WEBHOOK_SECRET: 'test-webhook-secret',
    PREVIEW_SECRET: 'test-preview-secret',
    API_SECRET_KEY: 'test-api-secret',
    NEWSLETTER_API_KEY: 'test-newsletter-key',
    NEWSLETTER_WEBHOOK_SECRET: 'test-newsletter-webhook',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000'
  }
  
  Object.entries({ ...defaults, ...overrides }).forEach(([key, value]) => {
    process.env[key] = value
  })
}

/**
 * Cleans up test environment
 */
export function cleanupTestEnv() {
  const envKeys = [
    'PRISMIC_ACCESS_TOKEN',
    'PRISMIC_WEBHOOK_SECRET',
    'PREVIEW_SECRET',
    'API_SECRET_KEY',
    'NEWSLETTER_API_KEY',
    'NEWSLETTER_WEBHOOK_SECRET'
  ]
  
  envKeys.forEach(key => {
    delete process.env[key]
  })
}
```

### 7. Performance Testing Utilities

```typescript
// src/__tests__/api/test-utils/performance.ts

/**
 * Measures API response time
 */
export async function measureResponseTime(
  fn: () => Promise<Response>
): Promise<{ response: Response; duration: number }> {
  const start = performance.now()
  const response = await fn()
  const duration = performance.now() - start
  
  return { response, duration }
}

/**
 * Tests rate limiting behavior
 */
export async function testRateLimit(
  makeRequest: () => Promise<Response>,
  expectedLimit: number
): Promise<void> {
  const responses: Response[] = []
  
  // Make requests up to the limit
  for (let i = 0; i < expectedLimit + 5; i++) {
    responses.push(await makeRequest())
  }
  
  // Check that requests within limit succeed
  for (let i = 0; i < expectedLimit; i++) {
    expect(responses[i].status).toBe(200)
  }
  
  // Check that requests beyond limit are rate limited
  for (let i = expectedLimit; i < responses.length; i++) {
    expect(responses[i].status).toBe(429)
  }
}
```

## Usage Examples

### Example: Testing Newsletter Subscribe Endpoint

```typescript
import { createMockRequest, expectJsonResponse, expectErrorResponse } from '../test-utils'
import { POST } from '@/app/api/newsletter/subscribe/route'

describe('POST /api/newsletter/subscribe', () => {
  it('should subscribe valid email', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/newsletter/subscribe',
      body: { email: 'test@example.com' }
    })
    
    const response = await POST(request)
    
    await expectJsonResponse(response, 200, {
      success: true,
      message: 'Successfully subscribed'
    })
  })
  
  it('should reject invalid email', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { email: 'invalid-email' }
    })
    
    const response = await POST(request)
    
    await expectErrorResponse(response, 400, 'Invalid email address')
  })
})
```

## Success Criteria

- ✅ All utility functions properly typed
- ✅ Mock factories cover all external services
- ✅ Request/response helpers handle all scenarios
- ✅ Security utilities properly implemented
- ✅ Performance testing utilities functional
- ✅ Examples and documentation complete

## Notes

- Utilities should be reusable across all API tests
- Keep utilities focused and single-purpose
- Ensure proper TypeScript types throughout
- Mock external dependencies appropriately
- Consider edge cases in utility implementations