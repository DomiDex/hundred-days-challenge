# Task 03: Implement Security Headers and CSP

## Priority: Critical

## Description
Implement comprehensive security headers including Content Security Policy (CSP), HSTS, and other essential headers to protect the application from common web vulnerabilities.

## Dependencies
- None (can be started immediately)

## Implementation Steps

### 1. **Create Security Middleware**
   - Create `src/middleware.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   
   export function middleware(request: NextRequest) {
     // Generate nonce for CSP
     const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
     
     // Define CSP policy
     const cspHeader = `
       default-src 'self';
       script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
       style-src 'self' 'nonce-${nonce}';
       img-src 'self' blob: data: https://images.prismic.io;
       font-src 'self';
       object-src 'none';
       base-uri 'self';
       form-action 'self';
       frame-ancestors 'none';
       upgrade-insecure-requests;
     `
     
     // Add security headers
     const headers = new Headers(request.headers)
     headers.set('x-nonce', nonce)
     headers.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim())
     
     return NextResponse.next({ headers })
   }
   
   export const config = {
     matcher: [
       '/((?!api|_next/static|_next/image|favicon.ico).*)',
     ],
   }
   ```

### 2. **Configure Security Headers in next.config.ts**
   - Update `next.config.ts`:
   ```typescript
   headers: async () => [
     {
       source: '/:path*',
       headers: [
         {
           key: 'X-DNS-Prefetch-Control',
           value: 'on'
         },
         {
           key: 'Strict-Transport-Security',
           value: 'max-age=63072000; includeSubDomains; preload'
         },
         {
           key: 'X-Content-Type-Options',
           value: 'nosniff'
         },
         {
           key: 'X-Frame-Options',
           value: 'DENY'
         },
         {
           key: 'X-XSS-Protection',
           value: '1; mode=block'
         },
         {
           key: 'Referrer-Policy',
           value: 'strict-origin-when-cross-origin'
         },
         {
           key: 'Permissions-Policy',
           value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
         }
       ]
     }
   ]
   ```

### 3. **Update Script Tags for Nonce Support**
   - Create `src/components/providers/NonceProvider.tsx`:
   ```typescript
   - Create context for nonce value
   - Provide nonce to child components
   ```

### 4. **Update Layout for Nonce**
   - Modify `src/app/layout.tsx`:
   ```typescript
   - Read nonce from headers
   - Pass to NonceProvider
   - Apply to inline scripts
   ```

### 5. **Create CSP Report Handler**
   - Create `src/app/api/csp-report/route.ts`:
   ```typescript
   - Handle CSP violation reports
   - Log violations for monitoring
   - Implement rate limiting
   ```

### 6. **Environment-Specific Configuration**
   - Create `src/lib/security-config.ts`:
   ```typescript
   - Different CSP policies for dev/staging/prod
   - Allow localhost sources in development
   - Stricter policies for production
   ```

### 7. **Update External Resource Loading**
   - Review and update all external resources:
     - Prismic images
     - Google Fonts (if used)
     - Analytics scripts
     - Third-party embeds

## Security Checklist
- [ ] CSP header is properly set with nonce
- [ ] HSTS is enabled with proper max-age
- [ ] X-Frame-Options prevents clickjacking
- [ ] X-Content-Type-Options prevents MIME sniffing
- [ ] Permissions-Policy restricts browser features
- [ ] CSP violations are logged and monitored
- [ ] No inline scripts without nonce
- [ ] All external resources are whitelisted
- [ ] Security headers work in all environments

## Testing Tools
- Use CSP Evaluator: https://csp-evaluator.withgoogle.com/
- Test with Security Headers: https://securityheaders.com/
- Monitor CSP violations in browser console
- Use Lighthouse security audit

## Success Criteria
- A+ rating on securityheaders.com
- No CSP violations in production
- All functionality works with strict CSP
- Proper nonce generation for dynamic content
- Headers don't break any existing features
- Clear documentation for future updates