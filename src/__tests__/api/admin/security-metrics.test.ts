import { GET } from '@/app/api/admin/security-metrics/route'
import {
  createMockRequest,
  expectJsonResponse,
  expectErrorResponse,
  setupTestEnv,
  cleanupTestEnv,
  generateTestToken,
} from '@/test-utils/api'

// Mock security monitoring utilities
jest.mock('@/lib/security-monitoring', () => ({
  getSecurityMetrics: jest.fn(),
  getFailedLoginAttempts: jest.fn(),
  getCSPViolations: jest.fn(),
  getRateLimitHits: jest.fn(),
  getSecurityEvents: jest.fn(),
}))

import {
  getSecurityMetrics,
  getFailedLoginAttempts,
  getCSPViolations,
  getRateLimitHits,
  getSecurityEvents,
} from '@/lib/security-monitoring'

// Mock console
const originalConsoleError = console.error

describe('GET /api/admin/security-metrics', () => {
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
  })

  beforeEach(() => {
    setupTestEnv({
      ADMIN_API_KEY: 'test-admin-key-123',
    })
    jest.clearAllMocks()

    // Setup default mock responses
    ;(getSecurityMetrics as jest.Mock).mockResolvedValue({
      totalEvents: 150,
      criticalEvents: 5,
      warningEvents: 25,
      infoEvents: 120,
    })
    ;(getFailedLoginAttempts as jest.Mock).mockResolvedValue({
      total: 45,
      last24Hours: 12,
      topIPs: [
        { ip: '192.168.1.1', attempts: 5 },
        { ip: '10.0.0.1', attempts: 3 },
      ],
    })
    ;(getCSPViolations as jest.Mock).mockResolvedValue({
      total: 78,
      byDirective: {
        'script-src': 45,
        'style-src': 20,
        'img-src': 13,
      },
    })
    ;(getRateLimitHits as jest.Mock).mockResolvedValue({
      total: 234,
      byEndpoint: {
        '/api/newsletter/subscribe': 150,
        '/api/preview': 84,
      },
    })
    ;(getSecurityEvents as jest.Mock).mockResolvedValue([
      {
        id: '1',
        type: 'failed_login',
        severity: 'warning',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        details: { ip: '192.168.1.1', email: 'test@example.com' },
      },
    ])
  })

  afterEach(() => {
    cleanupTestEnv()
  })

  describe('Authentication', () => {
    it('should require admin API key', async () => {
      const request = createMockRequest({
        method: 'GET',
        headers: {},
      })

      const response = await GET(request)

      await expectErrorResponse(response, 401, 'Unauthorized')
    })

    it('should reject invalid API key', async () => {
      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'wrong-key',
        },
      })

      const response = await GET(request)

      await expectErrorResponse(response, 401, 'Unauthorized')
    })

    it('should accept valid API key', async () => {
      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('should accept Bearer token authentication', async () => {
      const token = generateTestToken({ role: 'admin' })

      const request = createMockRequest({
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('should reject non-admin Bearer tokens', async () => {
      const token = generateTestToken({ role: 'user' })

      const request = createMockRequest({
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const response = await GET(request)

      await expectErrorResponse(response, 403, 'Forbidden')
    })
  })

  describe('Metrics Response', () => {
    it('should return comprehensive security metrics', async () => {
      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)

      await expectJsonResponse(response, 200, {
        overview: {
          totalEvents: 150,
          criticalEvents: 5,
          warningEvents: 25,
          infoEvents: 120,
          healthScore: expect.any(Number),
        },
        failedLogins: {
          total: 45,
          last24Hours: 12,
          topIPs: expect.arrayContaining([
            { ip: '192.168.1.1', attempts: 5 },
            { ip: '10.0.0.1', attempts: 3 },
          ]),
        },
        cspViolations: {
          total: 78,
          byDirective: {
            'script-src': 45,
            'style-src': 20,
            'img-src': 13,
          },
        },
        rateLimiting: {
          total: 234,
          byEndpoint: {
            '/api/newsletter/subscribe': 150,
            '/api/preview': 84,
          },
        },
        recentEvents: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            type: 'failed_login',
            severity: 'warning',
          }),
        ]),
        timestamp: expect.any(String),
      })
    })

    it('should calculate health score based on metrics', async () => {
      // High number of critical events should lower health score
      ;(getSecurityMetrics as jest.Mock).mockResolvedValue({
        totalEvents: 1000,
        criticalEvents: 100,
        warningEvents: 200,
        infoEvents: 700,
      })

      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)
      const json = await response.json()

      // Health score should be low due to high critical events
      expect(json.overview.healthScore).toBeLessThan(50)
    })

    it('should include metadata about metrics collection', async () => {
      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.metadata).toMatchObject({
        collectionPeriod: '24h',
        lastUpdated: expect.any(String),
        dataRetention: '30d',
        version: '1.0',
      })
    })
  })

  describe('Time-based Filtering', () => {
    it('should filter metrics by time range', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/admin/security-metrics?timeRange=7d',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)

      expect(response.status).toBe(200)

      expect(getSecurityMetrics).toHaveBeenCalledWith({ timeRange: '7d' })
      expect(getFailedLoginAttempts).toHaveBeenCalledWith({ timeRange: '7d' })
      expect(getCSPViolations).toHaveBeenCalledWith({ timeRange: '7d' })
      expect(getRateLimitHits).toHaveBeenCalledWith({ timeRange: '7d' })
    })

    it('should support multiple time ranges', async () => {
      const timeRanges = ['1h', '24h', '7d', '30d']

      for (const timeRange of timeRanges) {
        const request = createMockRequest({
          method: 'GET',
          url: `http://localhost:3000/api/admin/security-metrics?timeRange=${timeRange}`,
          headers: {
            'X-Admin-API-Key': 'test-admin-key-123',
          },
        })

        const response = await GET(request)
        expect(response.status).toBe(200)
      }
    })

    it('should default to 24h if no time range specified', async () => {
      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      await GET(request)

      expect(getSecurityMetrics).toHaveBeenCalledWith({ timeRange: '24h' })
    })
  })

  describe('Severity Filtering', () => {
    it('should filter events by severity', async () => {
      ;(getSecurityEvents as jest.Mock).mockResolvedValue([
        { id: '1', severity: 'critical', type: 'auth_bypass' },
        { id: '2', severity: 'warning', type: 'failed_login' },
        { id: '3', severity: 'info', type: 'successful_login' },
      ])

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/admin/security-metrics?severity=critical,warning',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.recentEvents).toHaveLength(2)
      expect(json.recentEvents).not.toContainEqual(expect.objectContaining({ severity: 'info' }))
    })
  })

  describe('Error Handling', () => {
    it('should handle metrics service errors gracefully', async () => {
      ;(getSecurityMetrics as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)

      await expectErrorResponse(response, 500, 'Failed to fetch security metrics')

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching security metrics:',
        expect.any(Error)
      )
    })

    it('should handle partial service failures', async () => {
      // One service fails, others succeed
      ;(getCSPViolations as jest.Mock).mockRejectedValue(new Error('Service unavailable'))

      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)
      const json = await response.json()

      expect(response.status).toBe(200)

      // Should include partial data
      expect(json.overview).toBeDefined()
      expect(json.failedLogins).toBeDefined()
      expect(json.rateLimiting).toBeDefined()

      // CSP violations should show error state
      expect(json.cspViolations).toMatchObject({
        error: 'Unable to fetch CSP violations',
        total: 0,
      })
    })
  })

  describe('Rate Limiting', () => {
    it('should apply rate limiting to admin endpoints', async () => {
      // Simulate multiple rapid requests
      const requests = Array.from({ length: 15 }, () =>
        createMockRequest({
          method: 'GET',
          headers: {
            'X-Admin-API-Key': 'test-admin-key-123',
            'X-Forwarded-For': '192.168.1.100',
          },
        })
      )

      const responses = await Promise.all(requests.map((req) => GET(req)))

      // First 10 should succeed
      const successCount = responses.filter((r) => r.status === 200).length
      expect(successCount).toBe(10)

      // Remaining should be rate limited
      const rateLimitedCount = responses.filter((r) => r.status === 429).length
      expect(rateLimitedCount).toBe(5)
    })
  })

  describe('Alerting Thresholds', () => {
    it('should include alert recommendations for high severity events', async () => {
      ;(getSecurityMetrics as jest.Mock).mockResolvedValue({
        totalEvents: 1000,
        criticalEvents: 50,
        warningEvents: 200,
        infoEvents: 750,
      })

      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.alerts).toContainEqual(
        expect.objectContaining({
          type: 'critical_events_high',
          severity: 'critical',
          message: expect.stringContaining('Critical events'),
        })
      )
    })

    it('should alert on high failed login attempts', async () => {
      ;(getFailedLoginAttempts as jest.Mock).mockResolvedValue({
        total: 500,
        last24Hours: 200,
        topIPs: [{ ip: '192.168.1.1', attempts: 100 }],
      })

      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.alerts).toContainEqual(
        expect.objectContaining({
          type: 'failed_logins_high',
          severity: 'warning',
        })
      )
    })
  })

  describe('Export Functionality', () => {
    it('should support CSV export format', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/admin/security-metrics?format=csv',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/csv')
      expect(response.headers.get('Content-Disposition')).toMatch(
        /attachment.*security-metrics.*\.csv/
      )
    })

    it('should support JSON export with download headers', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/admin/security-metrics?format=json&download=true',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Disposition')).toMatch(
        /attachment.*security-metrics.*\.json/
      )
    })
  })

  describe('Caching', () => {
    it('should not cache admin security endpoints', async () => {
      const request = createMockRequest({
        method: 'GET',
        headers: {
          'X-Admin-API-Key': 'test-admin-key-123',
        },
      })

      const response = await GET(request)

      expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate')
      expect(response.headers.get('Pragma')).toBe('no-cache')
    })
  })
})
