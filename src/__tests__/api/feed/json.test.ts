import { GET } from '@/app/api/feed/json/route'
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

describe('GET /api/feed/json', () => {
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
      reader: 'generic-reader',
      subscriberId: 'test-subscriber',
      isConditionalRequest: false
    })
    
    // Mock generateFeeds with default JSON Feed content
    const defaultJsonFeed = JSON.stringify({
      version: 'https://jsonfeed.org/version/1.1',
      title: '100 Days of Craft',
      home_page_url: 'https://100daysofcraft.com',
      feed_url: 'https://100daysofcraft.com/feed.json',
      items: []
    })
    
    ;(generateFeeds as jest.Mock).mockResolvedValue({
      rss: '',
      atom: '',
      json: defaultJsonFeed
    })
  })
  
  describe('Basic Response', () => {
    it('should generate valid JSON feed', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      const content = await expectFeedResponse(response, 'json')
      const parsed = JSON.parse(content)
      
      expect(parsed.version).toBe('https://jsonfeed.org/version/1.1')
      expect(parsed.title).toBe('100 Days of Craft')
      expect(parsed.home_page_url).toBeTruthy()
      expect(parsed.feed_url).toBeTruthy()
    })
    
    it('should set correct headers', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/feed+json; charset=utf-8')
      expect(response.headers.get('X-Robots-Tag')).toBe('noindex')
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('Last-Modified')).toBeTruthy()
      expect(response.headers.get('ETag')).toBeTruthy()
    })
    
    it('should set CORS headers for JSON feeds', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET')
    })
    
    it('should set cache headers', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=600, s-maxage=3600, stale-while-revalidate=7200')
    })
    
    it('should set content length', async () => {
      const mockContent = '{"version":"1.1","title":"Test"}'
      ;(generateFeeds as jest.Mock).mockResolvedValue({ json: mockContent })
      
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.headers.get('Content-Length')).toBe(mockContent.length.toString())
    })
  })
  
  describe('Conditional Requests', () => {
    it('should handle If-None-Match header (ETag)', async () => {
      const mockContent = '{"version":"1.1","title":"Test"}'
      ;(generateFeeds as jest.Mock).mockResolvedValue({ json: mockContent })
      
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
      expect(JSON.parse(content)).toHaveProperty('version')
    })
  })
  
  describe('Analytics Tracking', () => {
    it('should track feed access as json', async () => {
      const request = createMockRequest({
        headers: {
          'User-Agent': 'Some Feed Reader/1.0'
        }
      })
      
      await GET(request)
      
      expect(FeedAnalytics.trackFeedAccess).toHaveBeenCalledWith(request, 'json')
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
        'Error generating JSON feed:',
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
      expect(JSON.parse(content)).toHaveProperty('version')
    })
  })
  
  describe('Feed Content', () => {
    it('should use json content from generateFeeds', async () => {
      const customJson = JSON.stringify({
        version: 'https://jsonfeed.org/version/1.1',
        title: 'Custom JSON Feed',
        items: [
          {
            id: '1',
            title: 'Test Post',
            content_text: 'Test content'
          }
        ]
      })
      
      ;(generateFeeds as jest.Mock).mockResolvedValue({
        rss: '',
        atom: '',
        json: customJson
      })
      
      const request = createMockRequest()
      const response = await GET(request)
      
      const content = await response.text()
      expect(content).toBe(customJson)
      
      const parsed = JSON.parse(content)
      expect(parsed.title).toBe('Custom JSON Feed')
      expect(parsed.items).toHaveLength(1)
    })
  })
  
  describe('JSON Feed Format', () => {
    it('should return valid JSON', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      const content = await response.text()
      
      // Should not throw
      expect(() => JSON.parse(content)).not.toThrow()
    })
    
    it('should include required JSON Feed fields', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      const content = await response.text()
      const parsed = JSON.parse(content)
      
      // Required fields per JSON Feed spec
      expect(parsed).toHaveProperty('version')
      expect(parsed).toHaveProperty('title')
    })
  })
})