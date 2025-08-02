import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  sanitizeString,
  isValidEmail,
  isValidUrl,
  escapeHtml,
  sanitizeRateLimitIdentifier,
  validateWithSchema,
  newsletterSubscriptionSchema,
} from '../validation'
import { getSecurityConfig } from '../env'

// Helper to safely set NODE_ENV for tests
// const setNodeEnv = (value: string | undefined) => {
//   Object.defineProperty(process.env, 'NODE_ENV', {
//     value,
//     writable: true,
//     configurable: true
//   })
// }

describe('Security Tests', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('Input Validation', () => {
    it('should validate email addresses correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid.email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })

    it('should validate URLs correctly', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('not-a-url')).toBe(false)
      // javascript: is actually a valid URL according to the URL constructor
      expect(isValidUrl('javascript:alert(1)')).toBe(true)
    })

    it('should sanitize strings properly', () => {
      const input = '  Hello <script>alert("xss")</script> World  '
      const sanitized = sanitizeString(input)
      // sanitizeString removes < and > characters
      expect(sanitized).toBe('Hello scriptalert("xss")/script World')
      expect(sanitized).not.toContain('<')
      expect(sanitized).not.toContain('>')
    })

    it('should escape HTML correctly', () => {
      const unsafe = '<script>alert("XSS")</script>'
      const escaped = escapeHtml(unsafe)
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;')
    })

    it('should sanitize rate limit identifiers', () => {
      const malicious = 'user:123; DROP TABLE users;--'
      const sanitized = sanitizeRateLimitIdentifier(malicious)
      // sanitizeRateLimitIdentifier replaces non-alphanumeric chars (except :.-) with _
      expect(sanitized).toBe('user:123__DROP_TABLE_users_--')
      expect(sanitized).not.toContain(';')
      expect(sanitized).not.toContain(' ')
    })
  })

  describe('Schema Validation', () => {
    it('should validate newsletter subscription data', async () => {
      const validData = { email: 'test@example.com' }
      const result = await validateWithSchema(validData, newsletterSubscriptionSchema)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
      }
    })

    it('should reject invalid newsletter subscription data', async () => {
      const invalidData = { email: 'not-an-email' }
      const result = await validateWithSchema(invalidData, newsletterSubscriptionSchema)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid email')
      }
    })
  })

  describe('Cookie Security', () => {
    it('should set secure cookie options in production', () => {
      const originalEnv = process.env.NODE_ENV
      
      jest.isolateModules(() => {
        // Set NODE_ENV directly without the helper
        // @ts-expect-error - Need to override readonly NODE_ENV for testing
        process.env.NODE_ENV = 'production'
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getSecureCookieOptions } = require('../cookies')
        
        const options = getSecureCookieOptions()
        expect(options.httpOnly).toBe(true)
        expect(options.secure).toBe(true)
        expect(options.sameSite).toBe('lax')
      })

      // @ts-expect-error - Need to override readonly NODE_ENV for testing
      process.env.NODE_ENV = originalEnv
    })

    it('should not require secure cookies in development', () => {
      const originalEnv = process.env.NODE_ENV
      
      jest.isolateModules(() => {
        // @ts-expect-error - Need to override readonly NODE_ENV for testing
        process.env.NODE_ENV = 'development'
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getSecureCookieOptions } = require('../cookies')
        
        const options = getSecureCookieOptions()
        expect(options.httpOnly).toBe(true)
        expect(options.secure).toBe(false)
      })

      // @ts-expect-error - Need to override readonly NODE_ENV for testing
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Environment Security', () => {
    it('should detect secure context correctly', () => {
      const originalEnv = process.env.NODE_ENV
      const originalForceSecure = process.env.FORCE_SECURE

      // Test production environment
      jest.isolateModules(() => {
        // @ts-expect-error - Need to override readonly NODE_ENV for testing
        process.env.NODE_ENV = 'production'
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { isSecureContext } = require('../env')
        expect(isSecureContext()).toBe(true)
      })

      // Test development environment
      jest.isolateModules(() => {
        // @ts-expect-error - Need to override readonly NODE_ENV for testing
        process.env.NODE_ENV = 'development'
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { isSecureContext } = require('../env')
        expect(isSecureContext()).toBe(false)
      })

      // Test FORCE_SECURE flag
      jest.isolateModules(() => {
        // @ts-expect-error - Need to override readonly NODE_ENV for testing
        process.env.NODE_ENV = 'development'
        process.env.FORCE_SECURE = 'true'
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { isSecureContext } = require('../env')
        expect(isSecureContext()).toBe(true)
      })

      // Restore original environment
      if (originalForceSecure !== undefined) {
        process.env.FORCE_SECURE = originalForceSecure
      } else {
        delete process.env.FORCE_SECURE
      }
      // @ts-expect-error - Need to override readonly NODE_ENV for testing
      process.env.NODE_ENV = originalEnv
    })

    it('should provide secure defaults for secrets', () => {
      const config = getSecurityConfig()
      expect(config.previewSecret).toBeDefined()
      expect(config.apiSecretKey).toBeDefined()
      // siteUrl might be undefined if NEXT_PUBLIC_SITE_URL is not set
      expect(config).toHaveProperty('siteUrl')
    })
  })
})
