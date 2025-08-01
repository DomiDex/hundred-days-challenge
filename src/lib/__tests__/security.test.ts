import { describe, it, expect } from '@jest/globals'
import {
  sanitizeString,
  isValidEmail,
  isValidUrl,
  escapeHtml,
  sanitizeRateLimitIdentifier,
  validateWithSchema,
  newsletterSubscriptionSchema,
} from '../validation'
import { getSecurityConfig, isSecureContext } from '../env'
import { getSecureCookieOptions } from '../cookies'

describe('Security Tests', () => {
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
      expect(isValidUrl('javascript:alert(1)')).toBe(false)
    })

    it('should sanitize strings properly', () => {
      const input = '  Hello <script>alert("xss")</script> World  '
      const sanitized = sanitizeString(input)
      expect(sanitized).toBe('Hello script>alert("xss")/script> World')
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
      expect(sanitized).toBe('user:123__DROP_TABLE_users___')
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
      process.env.NODE_ENV = 'production'

      const options = getSecureCookieOptions()
      expect(options.httpOnly).toBe(true)
      expect(options.secure).toBe(true)
      expect(options.sameSite).toBe('lax')

      process.env.NODE_ENV = originalEnv
    })

    it('should not require secure cookies in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const options = getSecureCookieOptions()
      expect(options.httpOnly).toBe(true)
      expect(options.secure).toBe(false)

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Environment Security', () => {
    it('should detect secure context correctly', () => {
      const originalEnv = process.env.NODE_ENV

      process.env.NODE_ENV = 'production'
      expect(isSecureContext()).toBe(true)

      process.env.NODE_ENV = 'development'
      expect(isSecureContext()).toBe(false)

      process.env.FORCE_SECURE = 'true'
      expect(isSecureContext()).toBe(true)

      delete process.env.FORCE_SECURE
      process.env.NODE_ENV = originalEnv
    })

    it('should provide secure defaults for secrets', () => {
      const config = getSecurityConfig()
      expect(config.previewSecret).toBeDefined()
      expect(config.apiSecretKey).toBeDefined()
      expect(config.siteUrl).toBeDefined()
    })
  })
})
