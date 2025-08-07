import { POST } from '@/app/api/csp-report/route'
import {
  createMockRequest,
  expectJsonResponse,
  setupTestEnv,
  cleanupTestEnv,
} from '@/test-utils/api'

// Mock console
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

describe('POST /api/csp-report', () => {
  beforeAll(() => {
    console.warn = jest.fn()
    console.log = jest.fn()
  })

  afterAll(() => {
    console.warn = originalConsoleWarn
    console.log = originalConsoleLog
  })

  beforeEach(() => {
    setupTestEnv()
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanupTestEnv()
  })

  describe('CSP Violation Reporting', () => {
    it('should accept valid CSP violation report', async () => {
      const cspReport = {
        'csp-report': {
          'document-uri': 'https://example.com/page',
          referrer: 'https://example.com/',
          'blocked-uri': 'https://evil.com/script.js',
          'violated-directive': 'script-src',
          'original-policy': "default-src 'self'; script-src 'self'",
          disposition: 'enforce',
          'status-code': 0,
          'line-number': 123,
          'column-number': 45,
          'source-file': 'https://example.com/app.js',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: cspReport,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, { received: true })

      expect(console.warn).toHaveBeenCalledWith(
        'CSP Violation:',
        expect.objectContaining({
          'blocked-uri': 'https://evil.com/script.js',
          'violated-directive': 'script-src',
          'document-uri': 'https://example.com/page',
        })
      )
    })

    it('should handle report-only CSP violations', async () => {
      const cspReport = {
        'csp-report': {
          'document-uri': 'https://example.com/page',
          'blocked-uri': 'inline',
          'violated-directive': 'style-src',
          'original-policy': "style-src 'self'",
          disposition: 'report',
          'status-code': 0,
        },
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: cspReport,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 200, { received: true })

      expect(console.warn).toHaveBeenCalledWith(
        'CSP Violation:',
        expect.objectContaining({
          disposition: 'report',
        })
      )
    })

    it('should handle inline script violations', async () => {
      const cspReport = {
        'csp-report': {
          'document-uri': 'https://example.com/page',
          'blocked-uri': 'inline',
          'violated-directive': 'script-src',
          'original-policy': "script-src 'self'",
          disposition: 'enforce',
          'script-sample': 'alert("XSS")',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: cspReport,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      expect(console.warn).toHaveBeenCalledWith(
        'CSP Violation:',
        expect.objectContaining({
          'blocked-uri': 'inline',
          'script-sample': 'alert("XSS")',
        })
      )
    })

    it('should handle eval violations', async () => {
      const cspReport = {
        'csp-report': {
          'document-uri': 'https://example.com/page',
          'blocked-uri': 'eval',
          'violated-directive': 'script-src',
          'original-policy': "script-src 'self'",
          'line-number': 42,
        },
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: cspReport,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      expect(console.warn).toHaveBeenCalledWith(
        'CSP Violation:',
        expect.objectContaining({
          'blocked-uri': 'eval',
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle missing csp-report field', async () => {
      const invalidReport = {
        'document-uri': 'https://example.com/page',
        'blocked-uri': 'https://evil.com/script.js',
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: invalidReport,
      })

      const response = await POST(request)

      await expectJsonResponse(response, 400, { error: 'Invalid CSP report' })
    })

    it('should handle invalid JSON', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/csp-report',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: 'invalid-json{]',
      })

      const response = await POST(request)

      await expectJsonResponse(response, 400, { error: 'Invalid CSP report' })
    })

    it('should handle empty request body', async () => {
      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: {},
      })

      const response = await POST(request)

      await expectJsonResponse(response, 400, { error: 'Invalid CSP report' })
    })
  })

  describe('Report Content Validation', () => {
    it('should accept reports with minimal required fields', async () => {
      const minimalReport = {
        'csp-report': {
          'document-uri': 'https://example.com/',
          'violated-directive': 'default-src',
          'blocked-uri': 'https://external.com/resource',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: minimalReport,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should handle reports with all standard fields', async () => {
      const fullReport = {
        'csp-report': {
          'document-uri': 'https://example.com/page',
          referrer: 'https://example.com/',
          'blocked-uri': 'https://external.com/script.js',
          'violated-directive': 'script-src',
          'effective-directive': 'script-src',
          'original-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
          disposition: 'enforce',
          'status-code': 200,
          'line-number': 123,
          'column-number': 45,
          'source-file': 'https://example.com/app.js',
          'script-sample': 'console.log("test")',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: fullReport,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      expect(console.warn).toHaveBeenCalledWith('CSP Violation:', fullReport['csp-report'])
    })

    it('should handle reports with non-standard fields', async () => {
      const reportWithExtras = {
        'csp-report': {
          'document-uri': 'https://example.com/',
          'violated-directive': 'default-src',
          'blocked-uri': 'https://external.com/resource',
          'custom-field': 'custom-value',
          timestamp: Date.now(),
        },
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: reportWithExtras,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Production Environment', () => {
    const originalEnv = process.env.NODE_ENV

    beforeEach(() => {
      process.env = { ...process.env, NODE_ENV: 'production' }
    })

    afterEach(() => {
      process.env = { ...process.env, NODE_ENV: originalEnv }
    })

    it('should log CSP violations in production', async () => {
      const cspReport = {
        'csp-report': {
          'document-uri': 'https://example.com/page',
          'blocked-uri': 'https://tracking.com/pixel.gif',
          'violated-directive': 'img-src',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: cspReport,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      // In production, you might want to send to monitoring service
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('Rate Limiting', () => {
    it('should handle multiple reports from same source', async () => {
      const cspReport = {
        'csp-report': {
          'document-uri': 'https://example.com/page',
          'blocked-uri': 'https://evil.com/script.js',
          'violated-directive': 'script-src',
        },
      }

      // Send multiple reports
      for (let i = 0; i < 5; i++) {
        const request = createMockRequest({
          method: 'POST',
          headers: {
            'Content-Type': 'application/csp-report',
            'X-Forwarded-For': '192.168.1.1',
          },
          body: cspReport,
        })

        const response = await POST(request)
        expect(response.status).toBe(200)
      }

      // All reports should be accepted (no rate limiting for CSP reports)
      expect(console.warn).toHaveBeenCalledTimes(5)
    })
  })

  describe('Security Considerations', () => {
    it('should not expose internal information in responses', async () => {
      const cspReport = {
        'csp-report': {
          'document-uri': 'https://example.com/admin/secret',
          'blocked-uri': 'https://evil.com/steal-data.js',
          'violated-directive': 'script-src',
          'source-file': 'https://example.com/internal/config.js',
        },
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: cspReport,
      })

      const response = await POST(request)
      const json = await response.json()

      // Response should not include any sensitive information
      expect(json).toEqual({ received: true })
      expect(json).not.toHaveProperty('document-uri')
      expect(json).not.toHaveProperty('source-file')
    })

    it('should handle very large reports gracefully', async () => {
      const largeReport = {
        'csp-report': {
          'document-uri': 'https://example.com/page',
          'blocked-uri': 'https://evil.com/script.js',
          'violated-directive': 'script-src',
          'script-sample': 'x'.repeat(10000), // Very long sample
        },
      }

      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/csp-report',
        },
        body: largeReport,
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })
})
