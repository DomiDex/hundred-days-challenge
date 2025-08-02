import { GET } from '@/app/api/exit-preview/route'
import { createMockRequest } from '@/test-utils/api'
import { exitPreview } from '@prismicio/next'

// Mock Prismic's exitPreview
jest.mock('@prismicio/next', () => ({
  exitPreview: jest.fn()
}))

// Mock console.log
const originalConsoleLog = console.log
console.log = jest.fn()

describe('GET /api/exit-preview', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock exitPreview response
    ;(exitPreview as jest.Mock).mockReturnValue(
      new Response(null, {
        status: 307,
        headers: {
          Location: '/',
          'Set-Cookie': '__prerender_bypass=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure, __next_preview_data=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure'
        }
      })
    )
  })
  
  afterAll(() => {
    console.log = originalConsoleLog
  })
  
  it('should clear preview cookies and redirect to home', async () => {
    const request = createMockRequest()
    const response = await GET(request)
    
    expect(exitPreview).toHaveBeenCalled()
    expect(response.status).toBe(307)
    expect(response.headers.get('Location')).toBe('/')
    
    // Check cookies are cleared
    const setCookie = response.headers.get('Set-Cookie')
    expect(setCookie).toContain('__prerender_bypass=; Max-Age=0')
    expect(setCookie).toContain('__next_preview_data=; Max-Age=0')
  })
  
  it('should log preview exit with IP and user agent', async () => {
    const request = createMockRequest({
      headers: {
        'x-forwarded-for': '1.2.3.4',
        'user-agent': 'Test Browser'
      }
    })
    
    await GET(request)
    
    expect(console.log).toHaveBeenCalledWith(
      'Preview mode exited',
      expect.objectContaining({
        ip: '1.2.3.4',
        userAgent: 'Test Browser'
      })
    )
  })
  
  it('should use x-real-ip when x-forwarded-for is not available', async () => {
    const request = createMockRequest({
      headers: {
        'x-real-ip': '5.6.7.8',
        'user-agent': 'Test Browser'
      }
    })
    
    await GET(request)
    
    expect(console.log).toHaveBeenCalledWith(
      'Preview mode exited',
      expect.objectContaining({
        ip: '5.6.7.8'
      })
    )
  })
  
  it('should use "unknown" when no IP headers are available', async () => {
    const request = createMockRequest({
      headers: {
        'user-agent': 'Test Browser'
      }
    })
    
    await GET(request)
    
    expect(console.log).toHaveBeenCalledWith(
      'Preview mode exited',
      expect.objectContaining({
        ip: 'unknown'
      })
    )
  })
  
  it('should handle multiple IPs in x-forwarded-for', async () => {
    const request = createMockRequest({
      headers: {
        'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12'
      }
    })
    
    await GET(request)
    
    expect(console.log).toHaveBeenCalledWith(
      'Preview mode exited',
      expect.objectContaining({
        ip: '1.2.3.4' // Should use the first IP
      })
    )
  })
})