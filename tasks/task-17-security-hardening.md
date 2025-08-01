# Task 17: Security Hardening Implementation

## Priority: Critical

## Description

Implement critical security improvements identified in the security audit to address vulnerabilities and enhance the overall security posture of the application.

## Dependencies

- Task 03: Security Headers (completed)
- Task 04: Authentication Security (completed)

## Implementation Steps

### Phase 1: Critical Security Fixes (Day 1-2)

#### 1. **Fix XSS Vulnerability in Rich Text Rendering**

Install DOMPurify:

```bash
npm install dompurify @types/dompurify isomorphic-dompurify
```

Update `src/components/blog/RichTextRenderer.tsx`:

```typescript
import DOMPurify from 'isomorphic-dompurify'

// In the oEmbed handler
if (node.oembed.html) {
  const sanitizedHtml = DOMPurify.sanitize(node.oembed.html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allowfullscreen', 'frameborder', 'src'],
    ALLOWED_URI_REGEXP: /^https?:\/\/(www\.)?(youtube\.com|vimeo\.com|twitter\.com)/,
  })
  return (
    <div
      className="embed-container"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
```

#### 2. **Fix Webhook Security**

Update `src/app/api/newsletter/webhook/route.ts`:

```typescript
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-mailchimp-signature')
  const timestamp = request.headers.get('x-mailchimp-timestamp')

  // Always require signature in production
  if (process.env.NODE_ENV === 'production') {
    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prevent replay attacks (5 minute window)
    const requestTime = parseInt(timestamp)
    const currentTime = Math.floor(Date.now() / 1000)
    if (Math.abs(currentTime - requestTime) > 300) {
      return NextResponse.json({ error: 'Request expired' }, { status: 401 })
    }

    // Verify signature
    if (!verifyWebhookSignature(request, body, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }
}
```

#### 3. **Remove Console Logs**

Create `src/lib/logger.ts`:

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console[level](message, context)
    } else {
      // In production, send to logging service
      // Example: sendToDatadog(level, message, context)
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, { ...context, error: error?.stack })
  }
}

export const logger = new Logger()
```

Replace all `console.log/warn/error` statements with:

```typescript
import { logger } from '@/lib/logger'

// Instead of: console.log('Preview access granted', {...})
logger.info('Preview access granted', { ip, documentId })
```

### Phase 2: High Priority Security (Day 3-4)

#### 4. **Implement CSRF Protection**

Install CSRF package:

```bash
npm install @edge-csrf/nextjs
```

Create `src/middleware/csrf.ts`:

```typescript
import { createCsrfMiddleware } from '@edge-csrf/nextjs'

export const csrfMiddleware = createCsrfMiddleware({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
  excludePathPrefixes: ['/api/webhook', '/api/revalidate'],
})
```

Update `src/middleware.ts` to include CSRF:

```typescript
import { csrfMiddleware } from './middleware/csrf'

export async function middleware(request: NextRequest) {
  // Run CSRF check first
  const csrfResponse = await csrfMiddleware(request)
  if (csrfResponse) return csrfResponse

  // Continue with existing middleware...
}
```

#### 5. **Fix Mailchimp Configuration**

Update `src/lib/mailchimp.ts`:

```typescript
import mailchimp from '@mailchimp/mailchimp_marketing'
import { getMailchimpConfig } from './env'

const config = getMailchimpConfig()

if (config) {
  mailchimp.setConfig({
    apiKey: config.apiKey,
    server: config.server,
  })
} else if (process.env.NODE_ENV === 'production') {
  throw new Error('Mailchimp configuration required in production')
}

export default mailchimp
export { config as mailchimpConfig }
```

#### 6. **Centralize Environment Access**

Audit and update all files using `process.env` directly:

```bash
# Find all direct env access
grep -r "process\.env\." src/ --include="*.ts" --include="*.tsx" | grep -v "src/lib/env.ts"
```

Replace with centralized access through `getEnv()` or specific config functions.

### Phase 3: Medium Priority (Day 5-6)

#### 7. **Implement JWT for Preview Tokens**

Install JWT library:

```bash
npm install jose
```

Create `src/lib/jwt.ts`:

```typescript
import { SignJWT, jwtVerify } from 'jose'
import { getSecurityConfig } from './env'

const { previewSecret } = getSecurityConfig()
const secret = new TextEncoder().encode(previewSecret)

export async function createPreviewToken(documentId: string) {
  const token = await new SignJWT({ documentId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .setAudience('preview')
    .setIssuer('100daysofcraft')
    .sign(secret)

  return token
}

export async function verifyPreviewToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      audience: 'preview',
      issuer: '100daysofcraft',
    })
    return payload
  } catch {
    return null
  }
}
```

#### 8. **Add Missing Security Headers**

Update `next.config.ts`:

```typescript
headers: [
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'require-corp',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
]
```

#### 9. **Implement Dependency Scanning**

Add to `package.json`:

```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "security:check": "npm run security:audit && npm run lint:security",
    "lint:security": "eslint . --config .eslintrc.security.js"
  }
}
```

Create `.github/workflows/security.yml`:

```yaml
name: Security Checks

on:
  push:
    branches: [main, develop]
  pull_request:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run security:check
      - run: npx @security-scanner/cli scan
```

### Phase 4: Monitoring & Documentation (Day 7)

#### 10. **Implement Security Monitoring**

Update `src/lib/error-handler.ts`:

```typescript
import { logger } from './logger'

// Add security event tracking
export function logSecurityEvent(
  event: 'auth_failure' | 'rate_limit' | 'csp_violation' | 'invalid_input',
  details: Record<string, unknown>
) {
  logger.warn(`Security Event: ${event}`, {
    ...details,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })

  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // sendToSecurityMonitoring(event, details)
  }
}
```

#### 11. **Create Security.txt**

Create `public/.well-known/security.txt`:

```
Contact: security@100daysofcraft.com
Expires: 2025-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://100daysofcraft.com/.well-known/security.txt
```

## Testing Checklist

### Security Testing

- [ ] XSS: Test oEmbed rendering with malicious HTML
- [ ] CSRF: Verify token validation on state-changing operations
- [ ] Webhooks: Test signature verification and replay prevention
- [ ] Logging: Verify no sensitive data in production logs
- [ ] Rate Limiting: Test limits are enforced correctly
- [ ] CSP: Check for violations in browser console
- [ ] Dependencies: Run `npm audit` and verify no high vulnerabilities

### Integration Testing

- [ ] Preview functionality works with JWT tokens
- [ ] Newsletter subscription works with CSRF protection
- [ ] All API endpoints properly authenticated
- [ ] Error messages don't leak sensitive information

### Performance Testing

- [ ] DOMPurify doesn't significantly impact rendering
- [ ] JWT operations are performant
- [ ] Logging doesn't impact response times

## Success Criteria

- Zero high/critical vulnerabilities in `npm audit`
- No XSS vulnerabilities in rich text rendering
- All webhooks verified with signatures
- CSRF protection on all state-changing operations
- No console.log statements in production code
- Security headers score A+ on securityheaders.com
- All tests passing with security features enabled

## Rollback Plan

If security features cause issues:

1. Temporarily disable CSRF in middleware
2. Revert to previous preview token system
3. Use feature flags for gradual rollout

## Security Monitoring Metrics

Track these metrics post-deployment:

- CSP violations per day
- Failed authentication attempts
- Rate limit violations
- CSRF token failures
- Security event frequency

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
