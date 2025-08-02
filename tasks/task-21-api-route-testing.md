# Task 21: Comprehensive API Route Testing

## Overview

Implement comprehensive unit tests for all API routes in `/src/app/api/` to ensure proper functionality, security, and error handling. Target 90%+ code coverage for API routes.

## API Routes to Test

### 1. Admin Routes
- **`/api/admin/security-metrics`** - Security metrics endpoint

### 2. Security & Monitoring
- **`/api/csp-report`** - Content Security Policy violation reporting
- **`/api/revalidate`** - Webhook for content revalidation

### 3. Preview System
- **`/api/preview`** - Preview mode activation
- **`/api/exit-preview`** - Preview mode deactivation

### 4. Feed Endpoints
- **`/api/feed/rss`** - RSS feed generation
- **`/api/feed/atom`** - Atom feed generation
- **`/api/feed/json`** - JSON feed generation
- **`/api/feed/category/[slug]`** - Category-specific RSS feed

### 5. Newsletter
- **`/api/newsletter/subscribe`** - Newsletter subscription
- **`/api/newsletter/webhook`** - Newsletter webhook handler

### 6. Content
- **`/api/posts`** - Posts listing endpoint

## Test Structure

### Directory Structure
```
src/__tests__/api/
├── admin/
│   └── security-metrics.test.ts
├── csp-report.test.ts
├── exit-preview.test.ts
├── feed/
│   ├── atom.test.ts
│   ├── category.test.ts
│   ├── json.test.ts
│   └── rss.test.ts
├── newsletter/
│   ├── subscribe.test.ts
│   └── webhook.test.ts
├── posts.test.ts
├── preview.test.ts
└── revalidate.test.ts
```

## Testing Requirements

### 1. Admin Security Metrics Tests
```typescript
// src/__tests__/api/admin/security-metrics.test.ts
describe('GET /api/admin/security-metrics', () => {
  // Authentication tests
  it('should return 401 when no authorization header')
  it('should return 401 with invalid token')
  it('should return 403 with non-admin token')
  
  // Success cases
  it('should return security metrics with valid admin token')
  it('should include CSP violations, rate limits, and security events')
  
  // Error handling
  it('should handle database errors gracefully')
})
```

### 2. CSP Report Tests
```typescript
// src/__tests__/api/csp-report.test.ts
describe('POST /api/csp-report', () => {
  // Valid reports
  it('should accept valid CSP violation report')
  it('should validate report structure')
  it('should store report in monitoring system')
  
  // Invalid reports
  it('should reject invalid report format')
  it('should handle missing required fields')
  
  // Rate limiting
  it('should rate limit excessive reports')
  
  // Security
  it('should sanitize report data')
})
```

### 3. Preview System Tests
```typescript
// src/__tests__/api/preview.test.ts
describe('GET /api/preview', () => {
  // Authentication
  it('should require secret token')
  it('should reject invalid tokens')
  
  // Document handling
  it('should handle valid document types')
  it('should validate slug parameter')
  it('should set preview cookies correctly')
  
  // Redirects
  it('should redirect to correct preview URL')
  it('should handle missing documents')
})

// src/__tests__/api/exit-preview.test.ts
describe('GET /api/exit-preview', () => {
  it('should clear preview cookies')
  it('should redirect to home page')
  it('should handle redirect parameter safely')
})
```

### 4. Feed Generation Tests
```typescript
// src/__tests__/api/feed/rss.test.ts
describe('GET /api/feed/rss', () => {
  // Content generation
  it('should generate valid RSS 2.0 feed')
  it('should include all published posts')
  it('should order posts by date descending')
  
  // Feed metadata
  it('should include correct channel metadata')
  it('should handle special characters in content')
  
  // Caching
  it('should set appropriate cache headers')
  
  // Error handling
  it('should handle Prismic API errors')
})

// Similar tests for atom.test.ts, json.test.ts

// src/__tests__/api/feed/category.test.ts
describe('GET /api/feed/category/[slug]', () => {
  it('should generate feed for valid category')
  it('should return 404 for non-existent category')
  it('should filter posts by category correctly')
})
```

### 5. Newsletter Tests
```typescript
// src/__tests__/api/newsletter/subscribe.test.ts
describe('POST /api/newsletter/subscribe', () => {
  // Validation
  it('should validate email format')
  it('should reject invalid email addresses')
  
  // Rate limiting
  it('should rate limit by IP')
  it('should rate limit by email')
  
  // Integration
  it('should subscribe to newsletter service')
  it('should handle duplicate subscriptions')
  
  // Security
  it('should sanitize input data')
  it('should validate CSRF token')
  
  // Error handling
  it('should handle service errors gracefully')
})

// src/__tests__/api/newsletter/webhook.test.ts
describe('POST /api/newsletter/webhook', () => {
  it('should verify webhook signature')
  it('should process valid webhook events')
  it('should reject invalid signatures')
  it('should handle different event types')
})
```

### 6. Posts API Tests
```typescript
// src/__tests__/api/posts.test.ts
describe('GET /api/posts', () => {
  // Pagination
  it('should return paginated results')
  it('should respect page and limit parameters')
  
  // Filtering
  it('should filter by category')
  it('should filter by author')
  it('should filter by date range')
  
  // Sorting
  it('should sort by date')
  it('should sort by popularity')
  
  // Response format
  it('should return correct JSON structure')
  it('should include metadata')
  
  // Caching
  it('should set cache headers')
})
```

### 7. Revalidation Tests
```typescript
// src/__tests__/api/revalidate.test.ts
describe('POST /api/revalidate', () => {
  // Authentication
  it('should verify webhook signature')
  it('should reject unsigned requests')
  
  // Revalidation
  it('should revalidate specific paths')
  it('should handle tag-based revalidation')
  it('should revalidate home and category pages')
  
  // Error handling
  it('should handle revalidation failures')
})
```

## Common Test Utilities

### Mock Factories
```typescript
// src/__tests__/api/test-utils.ts
export function createMockRequest(options?: Partial<NextRequest>): NextRequest
export function createMockHeaders(headers?: Record<string, string>): Headers
export function mockPrismicClient(responses?: Record<string, any>)
export function mockNewsletterService()
export function generateWebhookSignature(payload: string, secret: string): string
```

### Test Helpers
```typescript
// API response assertions
export async function expectJsonResponse(response: Response, status: number)
export async function expectErrorResponse(response: Response, status: number, message: string)
export async function expectFeedResponse(response: Response, contentType: string)

// Security helpers
export function createAuthHeader(token: string): Headers
export function createCSPReport(overrides?: Partial<CSPReport>): CSPReport
```

## Implementation Steps

### Phase 1: Setup and Utilities (Day 1)
1. Create test directory structure
2. Implement mock factories and helpers
3. Set up test environment variables
4. Configure API route testing utilities

### Phase 2: Core API Tests (Days 2-3)
5. Implement preview system tests
6. Implement feed generation tests
7. Implement posts API tests
8. Implement revalidation tests

### Phase 3: Security & Integration Tests (Days 4-5)
9. Implement admin endpoint tests
10. Implement CSP report tests
11. Implement newsletter tests
12. Add rate limiting tests

### Phase 4: Coverage & Polish (Day 6)
13. Achieve 90%+ code coverage
14. Add edge case tests
15. Performance and load tests
16. Documentation updates

## Testing Best Practices

### 1. Isolation
- Mock external services (Prismic, Newsletter, etc.)
- Use test database for data-dependent tests
- Reset state between tests

### 2. Security Testing
- Test all authentication paths
- Verify rate limiting works
- Test input validation and sanitization
- Check for injection vulnerabilities

### 3. Error Scenarios
- Test network failures
- Test malformed requests
- Test service unavailability
- Test timeout scenarios

### 4. Performance
- Test response times
- Verify caching works correctly
- Test concurrent request handling

## Success Metrics

- ✅ 90%+ code coverage for all API routes
- ✅ All security vulnerabilities addressed
- ✅ Rate limiting properly tested
- ✅ Error handling comprehensive
- ✅ Response formats validated
- ✅ Performance benchmarks met
- ✅ Integration points mocked appropriately

## Dependencies

- Jest with Next.js configuration
- Testing utilities from Task 06
- Mock factories from Task 20
- API route implementations

## Notes

- Use `next/test` utilities for API route testing
- Mock all external services to ensure fast, reliable tests
- Focus on both happy paths and error scenarios
- Ensure tests are maintainable and well-documented
- Consider adding contract tests for external APIs