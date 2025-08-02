import { GET } from '@/app/api/preview/route'
import { GET as exitPreview } from '@/app/api/exit-preview/route'
import { 
  createMockRequest, 
  expectRedirectResponse, 
  expectErrorResponse,
  mockPrismicClient,
  setupTestEnv,
  cleanupTestEnv,
  expectJsonResponse
} from '@/test-utils/api'
import { redirectToPreviewURL } from '@prismicio/next'
import crypto from 'crypto'

// Mock Prismic's redirectToPreviewURL
jest.mock('@prismicio/next', () => ({
  redirectToPreviewURL: jest.fn(),
  exitPreview: jest.fn()
}))

// Mock console methods
const originalConsoleLog = console.log
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

describe('Preview API Routes', () => {
  beforeAll(() => {
    // Silence console output during tests
    console.log = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()
  })

  afterAll(() => {
    // Restore console methods
    console.log = originalConsoleLog
    console.warn = originalConsoleWarn
    console.error = originalConsoleError
  })

  beforeEach(() => {
    setupTestEnv()
    jest.clearAllMocks()
    
    // Mock successful preview redirect by default
    ;(redirectToPreviewURL as jest.Mock).mockResolvedValue(
      new Response(null, {
        status: 307,
        headers: {
          Location: '/preview-path',
          'Set-Cookie': '__prerender_bypass=test; __next_preview_data=test'
        }
      })
    )
  })
  
  afterEach(() => {
    cleanupTestEnv()
  })
  
  describe('GET /api/preview', () => {
    describe('Rate Limiting', () => {
      it('should allow requests within rate limit', async () => {
        const request = createMockRequest({
          url: 'http://localhost:3000/api/preview',
          headers: { 'x-forwarded-for': '1.2.3.4' }
        })
        
        const response = await GET(request)
        expect(response.status).not.toBe(429)
      })
      
      it('should rate limit excessive requests', async () => {
        const ip = '1.2.3.5'
        
        // Make 5 requests (the limit)
        for (let i = 0; i < 5; i++) {
          const request = createMockRequest({
            url: 'http://localhost:3000/api/preview',
            headers: { 'x-forwarded-for': ip }
          })
          await GET(request)
        }
        
        // 6th request should be rate limited
        const request = createMockRequest({
          url: 'http://localhost:3000/api/preview',
          headers: { 'x-forwarded-for': ip }
        })
        
        const response = await GET(request)
        await expectJsonResponse(response, 429, {
          error: 'Too many preview requests. Please try again later.'
        })
      })
    })
    
    describe('Token Validation in Production', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production'
        process.env.PREVIEW_SECRET = 'test-preview-secret'
      })
      
      it('should require token in production', async () => {
        const request = createMockRequest({
          url: 'http://localhost:3000/api/preview',
          searchParams: {
            documentId: 'test-doc'
          }
        })
        
        const response = await GET(request)
        await expectErrorResponse(response, 401, 'Preview token required')
      })
      
      it('should reject invalid token format', async () => {
        const request = createMockRequest({
          url: 'http://localhost:3000/api/preview',
          searchParams: {
            documentId: 'test-doc',
            token: 'invalid-token'
          }
        })
        
        const response = await GET(request)
        await expectErrorResponse(response, 401, 'Invalid or expired preview token')
      })
      
      it('should accept valid token', async () => {
        const documentId = 'test-doc'
        const tokenData = {
          documentId,
          exp: Date.now() + 3600000 // 1 hour from now
        }
        
        const tokenDataBase64 = Buffer.from(JSON.stringify(tokenData)).toString('base64url')
        const signature = crypto
          .createHmac('sha256', 'test-preview-secret')
          .update(tokenDataBase64)
          .digest('base64url')
        
        const token = `${tokenDataBase64}.${signature}`
        
        const request = createMockRequest({
          url: 'http://localhost:3000/api/preview',
          searchParams: {
            documentId,
            token
          }
        })
        
        const response = await GET(request)
        
        expect(redirectToPreviewURL).toHaveBeenCalledWith({
          client: expect.any(Object),
          request: expect.any(Object)
        })
        expect(response.status).toBe(307)
      })
      
      it('should reject expired token', async () => {
        const tokenData = {
          documentId: 'test-doc',
          exp: Date.now() - 1000 // Expired
        }
        
        const tokenDataBase64 = Buffer.from(JSON.stringify(tokenData)).toString('base64url')
        const signature = crypto
          .createHmac('sha256', 'test-preview-secret')
          .update(tokenDataBase64)
          .digest('base64url')
        
        const token = `${tokenDataBase64}.${signature}`
        
        const request = createMockRequest({
          url: 'http://localhost:3000/api/preview',
          searchParams: {
            documentId: 'test-doc',
            token
          }
        })
        
        const response = await GET(request)
        await expectErrorResponse(response, 401, 'Invalid or expired preview token')
      })
      
      it('should reject token with mismatched document ID', async () => {
        const tokenData = {
          documentId: 'different-doc',
          exp: Date.now() + 3600000
        }
        
        const tokenDataBase64 = Buffer.from(JSON.stringify(tokenData)).toString('base64url')
        const signature = crypto
          .createHmac('sha256', 'test-preview-secret')
          .update(tokenDataBase64)
          .digest('base64url')
        
        const token = `${tokenDataBase64}.${signature}`
        
        const request = createMockRequest({
          url: 'http://localhost:3000/api/preview',
          searchParams: {
            documentId: 'test-doc',
            token
          }
        })
        
        const response = await GET(request)
        await expectErrorResponse(response, 401, 'Invalid or expired preview token')
      })
    })
    
    describe('Development Mode', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development'
      })
      
      it('should not require token in development', async () => {
        const request = createMockRequest({
          url: 'http://localhost:3000/api/preview',
          searchParams: {
            documentId: 'test-doc'
          }
        })
        
        const response = await GET(request)
        
        expect(redirectToPreviewURL).toHaveBeenCalled()
        expect(response.status).toBe(307)
      })
    })
    
    describe('Error Handling', () => {
      it('should handle errors from redirectToPreviewURL', async () => {
        ;(redirectToPreviewURL as jest.Mock).mockRejectedValue(new Error('Prismic error'))
        
        const request = createMockRequest({
          url: 'http://localhost:3000/api/preview'
        })
        
        const response = await GET(request)
        await expectErrorResponse(response, 500, 'An error occurred while setting up preview')
      })
    })
    
    describe('Logging', () => {
      it('should log preview access', async () => {
        process.env.NODE_ENV = 'development'
        
        const request = createMockRequest({
          url: 'http://localhost:3000/api/preview',
          headers: {
            'x-forwarded-for': '1.2.3.4',
            'user-agent': 'Test Browser'
          },
          searchParams: {
            documentId: 'test-doc'
          }
        })
        
        await GET(request)
        
        expect(console.log).toHaveBeenCalledWith(
          'Preview access granted',
          expect.objectContaining({
            ip: '1.2.3.4',
            documentId: 'test-doc',
            userAgent: 'Test Browser'
          })
        )
      })
      
      it('should log rate limit warnings', async () => {
        const ip = '1.2.3.6'
        
        // Exceed rate limit
        for (let i = 0; i < 6; i++) {
          const request = createMockRequest({
            url: 'http://localhost:3000/api/preview',
            headers: { 'x-forwarded-for': ip }
          })
          await GET(request)
        }
        
        expect(console.warn).toHaveBeenCalledWith(
          `Preview rate limit exceeded for IP: ${ip}`
        )
      })
    })
  })
})