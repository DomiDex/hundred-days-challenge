import { GET } from '@/app/api/feed/atom/route'
import { 
  createMockRequest, 
  expectFeedResponse
} from '@/test-utils/api'
import { generateFeeds } from '@/lib/feed-generator'
import { FeedAnalytics } from '@/lib/feed-analytics'
import crypto from 'crypto'

// Mock dependencies
jest.mock('@/lib/feed-generator')
jest.mock('@/lib/feed-analytics')

// Mock console
const originalConsoleError = console.error
const originalConsoleLog = console.log

describe('GET /api/feed/atom', () => {
  beforeAll(() => {
    console.error = jest.fn()
    console.log = jest.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
    console.log = originalConsoleLog
  })

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock FeedAnalytics
    ;(FeedAnalytics.trackFeedAccess as jest.Mock) = jest.fn().mockResolvedValue({
      reader: 'NetNewsWire',
      subscriberId: 'test-subscriber',
      isConditionalRequest: false
    })
    
    // Mock generateFeeds with default Atom content
    ;(generateFeeds as jest.Mock).mockResolvedValue({
      rss: '',
      atom: '<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>100 Days of Craft</title></feed>',
      json: ''
    })
  })
  
  describe('Basic Response', () => {
    it('should generate valid Atom feed', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      const content = await expectFeedResponse(response, 'atom')
      expect(content).toContain('<?xml version="1.0"')
      expect(content).toContain('<feed xmlns="http://www.w3.org/2005/Atom">')
      expect(content).toContain('100 Days of Craft')
    })
    
    it('should set correct headers', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/atom+xml; charset=utf-8')
      expect(response.headers.get('X-Robots-Tag')).toBe('noindex')
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('Last-Modified')).toBeTruthy()
      expect(response.headers.get('ETag')).toBeTruthy()
    })
    
    it('should set cache headers', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=600, s-maxage=3600, stale-while-revalidate=7200')
    })
    
    it('should set content length', async () => {
      const mockContent = '<?xml version="1.0"?><feed></feed>'
      ;(generateFeeds as jest.Mock).mockResolvedValue({ atom: mockContent })
      
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.headers.get('Content-Length')).toBe(mockContent.length.toString())
    })
  })
  
  describe('Conditional Requests', () => {
    it('should handle If-None-Match header (ETag)', async () => {
      const mockContent = '<?xml version="1.0"?><feed></feed>'
      ;(generateFeeds as jest.Mock).mockResolvedValue({ atom: mockContent })
      
      // Calculate expected ETag
      const expectedETag = `"${crypto.createHash('md5').update(mockContent).digest('hex')}"`
      
      const request = createMockRequest({
        headers: {
          'If-None-Match': expectedETag
        }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(304)
      expect(response.headers.get('ETag')).toBe(expectedETag)
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=600, s-maxage=3600, stale-while-revalidate=7200')
      
      // Body should be empty for 304
      const text = await response.text()
      expect(text).toBe('')
    })
    
    it('should handle If-Modified-Since header', async () => {
      const futureDate = new Date(Date.now() + 10000).toUTCString()
      
      const request = createMockRequest({
        headers: {
          'If-Modified-Since': futureDate
        }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(304)
    })
    
    it('should return full content for outdated If-Modified-Since', async () => {
      const pastDate = new Date(Date.now() - 10000).toUTCString()
      
      const request = createMockRequest({
        headers: {
          'If-Modified-Since': pastDate
        }
      })
      
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const content = await response.text()
      expect(content).toContain('<?xml')
    })
  })
  
  describe('Analytics Tracking', () => {
    it('should track feed access as atom', async () => {
      const request = createMockRequest({
        headers: {
          'User-Agent': 'NetNewsWire/6.0'
        }
      })
      
      await GET(request)
      
      expect(FeedAnalytics.trackFeedAccess).toHaveBeenCalledWith(request, 'atom')
    })
  })
  
  describe('Error Handling', () => {
    it('should handle feed generation errors', async () => {
      ;(generateFeeds as jest.Mock).mockRejectedValue(new Error('Feed generation failed'))
      
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.status).toBe(500)
      const text = await response.text()
      expect(text).toBe('Error generating feed')
      
      expect(console.error).toHaveBeenCalledWith(
        'Error generating Atom feed:',
        expect.any(Error)
      )
    })
    
    it('should handle analytics errors gracefully', async () => {
      ;(FeedAnalytics.trackFeedAccess as jest.Mock).mockRejectedValue(new Error('Analytics failed'))
      
      const request = createMockRequest()
      const response = await GET(request)
      
      // Should still generate feed successfully
      expect(response.status).toBe(200)
      const content = await response.text()
      expect(content).toContain('<?xml')
    })
  })
  
  describe('Feed Content', () => {
    it('should use atom content from generateFeeds', async () => {
      const customAtom = '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Custom Atom Feed</title></feed>'
      ;(generateFeeds as jest.Mock).mockResolvedValue({
        rss: '',
        atom: customAtom,
        json: ''
      })
      
      const request = createMockRequest()
      const response = await GET(request)
      
      const content = await response.text()
      expect(content).toBe(customAtom)
    })
  })
})