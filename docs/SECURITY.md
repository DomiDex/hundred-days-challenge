# Security Implementation Guide

This document outlines the security measures implemented in the 100 Days of Craft blog application.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Authentication & Authorization](#authentication--authorization)
3. [Rate Limiting](#rate-limiting)
4. [Input Validation & Sanitization](#input-validation--sanitization)
5. [Error Handling](#error-handling)
6. [Cookie Security](#cookie-security)
7. [API Security](#api-security)
8. [Testing](#testing)

## Environment Variables

### Configuration

All sensitive configuration is managed through environment variables with strict validation:

```typescript
// src/lib/env.ts
- Required variables are validated on startup
- Production requires HTTPS URLs
- Secrets must be at least 32 characters
- Graceful fallbacks in development
```

### Required Variables

```env
# Production Required
PREVIEW_SECRET=<32+ char secret>
API_SECRET_KEY=<32+ char secret>
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Optional but Recommended
PRISMIC_WEBHOOK_SECRET=<32+ char secret>
MAILCHIMP_WEBHOOK_KEY=<32+ char secret>
UPSTASH_REDIS_REST_URL=<redis-url>
UPSTASH_REDIS_REST_TOKEN=<redis-token>
```

## Authentication & Authorization

### API Authentication

```typescript
// src/lib/api-auth.ts
- API key validation with constant-time comparison
- CORS configuration for allowed origins
- Automatic security headers
- Request method validation
```

### Preview Mode Security

```typescript
// src/app/api/preview/route.ts
- Token-based authentication with HMAC signatures
- 1-hour token expiry
- Rate limiting (5 attempts per minute)
- IP-based tracking and logging
```

## Rate Limiting

### Implementation

We use Upstash Redis for distributed rate limiting with in-memory fallback:

```typescript
// src/lib/rate-limit.ts
- API endpoints: 100 requests/minute
- Auth endpoints: 5 requests/minute
- Preview access: 10 requests/5 minutes
- Newsletter: 3 requests/hour
```

### Headers

Rate limit information is provided in response headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset timestamp
- `Retry-After`: Seconds until retry (when limited)

## Input Validation & Sanitization

### Zod Schemas

```typescript
// src/lib/validation.ts
- Email validation with lowercase normalization
- URL validation with protocol checks
- Slug format validation
- Newsletter subscription schema
- Contact form schema
```

### Sanitization Functions

- `sanitizeString()`: Removes HTML tags and control characters
- `escapeHtml()`: Escapes HTML entities for display
- `sanitizeRateLimitIdentifier()`: Prevents Redis key injection

## Error Handling

### Error Classes

```typescript
// src/lib/error-handling.ts
- ApiError: Base class with status codes
- AuthenticationError: 401 responses
- AuthorizationError: 403 responses
- RateLimitError: 429 with retry headers
- ValidationError: 400 with field details
```

### Error Responses

Production error responses never leak sensitive information:

```json
{
  "error": {
    "message": "Client-safe error message",
    "code": "ERROR_CODE"
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456789"
}
```

## Cookie Security

### Configuration

```typescript
// src/lib/cookies.ts
{
  httpOnly: true,              // No JavaScript access
  secure: true,                // HTTPS only in production
  sameSite: 'lax',            // CSRF protection
  path: '/',                   // Scope limitation
  maxAge: 60 * 60 * 24        // 24-hour default
}
```

### Cookie Types

- Session cookies: 24-hour max age
- Preview cookies: 1-hour max age, strict sameSite
- Auth cookies: Always secure, 7-day max age

## API Security

### Request Protection

1. **Method Validation**: Only allowed HTTP methods
2. **CORS Headers**: Restricted to configured origins
3. **Rate Limiting**: Per-endpoint limits
4. **Authentication**: API key validation when required
5. **Request Logging**: IP, user agent, timestamp

### Security Headers

All API responses include:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Cache-Control: no-store`

## Testing

### Security Test Suite

Run security tests with:

```bash
npm test src/lib/__tests__/security.test.ts
```

### Test Coverage

- ✅ Email validation
- ✅ URL validation
- ✅ String sanitization
- ✅ HTML escaping
- ✅ Rate limit identifier sanitization
- ✅ Schema validation
- ✅ Cookie security options
- ✅ Environment security detection

### Manual Testing Checklist

- [ ] Test rate limiting by exceeding request limits
- [ ] Verify preview mode requires valid tokens
- [ ] Check API endpoints reject invalid methods
- [ ] Confirm error messages don't leak sensitive data
- [ ] Validate CORS headers in browser
- [ ] Test input validation with malicious inputs
- [ ] Verify cookies are httpOnly and secure

## Best Practices

1. **Never trust user input** - Always validate and sanitize
2. **Use prepared statements** - Prevent SQL injection
3. **Implement least privilege** - Minimal permissions
4. **Log security events** - Track suspicious activity
5. **Keep dependencies updated** - Regular security patches
6. **Use HTTPS everywhere** - Encrypt all traffic
7. **Implement CSP** - Prevent XSS attacks
8. **Regular security audits** - Test and review

## Monitoring

### What to Monitor

- Failed authentication attempts
- Rate limit violations
- Invalid input patterns
- Error rates by endpoint
- Response times

### Alerts

Set up alerts for:

- Multiple failed auth attempts from same IP
- Spike in 4xx/5xx errors
- Unusual traffic patterns
- Long response times

## Incident Response

1. **Detect**: Monitor logs and alerts
2. **Contain**: Rate limit or block malicious IPs
3. **Investigate**: Review logs and patterns
4. **Remediate**: Fix vulnerabilities
5. **Document**: Record incident details
6. **Review**: Update security measures

## Dependency Management

### Automated Updates

Dependabot is configured to:

- Check for updates weekly
- Create PRs for security updates
- Group updates by type
- Auto-merge patch updates (when tests pass)

### Security Scanning

```bash
npm run security:audit    # Audit production dependencies
npm run security:check    # Check for moderate+ vulnerabilities
npm run security:fix      # Auto-fix vulnerabilities
npm run security:scan     # Full security scan including lint
```

### Pre-commit Hooks

Git hooks automatically:

- Scan for hardcoded secrets
- Check for .env files
- Run security audit
- Validate code quality

## Client-Side Security

### XSS Prevention

```typescript
import { sanitizeHtml, sanitizeUserInput } from '@/lib/client-security'

// Sanitize rich content
const safeHtml = sanitizeHtml(userContent)

// Sanitize user input (more restrictive)
const safeInput = sanitizeUserInput(userComment)
```

### Secure Storage

```typescript
import { secureStorage } from '@/lib/client-security'

// Store sensitive data (base64 encoded)
secureStorage.setItem('token', value, true)

// Retrieve sensitive data
const token = secureStorage.getItem<string>('token', true)
```

## Security Monitoring

### Real-time Monitoring

```typescript
import { logSecurityEvent, SecurityEventType } from '@/lib/security-monitoring'

// Log security events
logSecurityEvent(SecurityEventType.AUTH_FAILURE, request, {
  username: attempt.username,
  reason: 'Invalid credentials',
})
```

### Security Metrics API

```bash
# Get security metrics (requires API key)
curl -H "X-API-Key: your-key" \
  https://yourdomain.com/api/admin/security-metrics?window=3600000
```

## Build Security

- Source maps disabled in production
- Console statements removed
- Bundle analysis available
- Secure environment handling
- Automated security checks on build

## Known Limitations

### Content Security Policy (CSP)

CSP is temporarily disabled due to Next.js hydration conflicts with nonce attributes. The application still maintains security through:

- Other security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Input validation and sanitization
- XSS prevention via DOMPurify
- Secure coding practices

A proper CSP implementation without hydration issues is planned for a future update.

## Additional Documentation

- [Security Checklist](./SECURITY-CHECKLIST.md) - Comprehensive security checklist
- [Security Policy](/SECURITY.md) - Vulnerability reporting and response

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Prismic Security](https://prismic.io/docs/security)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
