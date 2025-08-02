import { GET } from '@/app/api/feed/category/[slug]/route'
import { 
  createMockRequest, 
  expectFeedResponse,
  mockPrismicClient,
  createMockCategory
} from '@/test-utils/api'
import { generateCategoryFeed } from '@/lib/feed-generator'
import { FeedAnalytics } from '@/lib/feed-analytics'
import crypto from 'crypto'

// Mock dependencies
jest.mock('@/lib/feed-generator')
jest.mock('@/lib/feed-analytics')

// Mock console
const originalConsoleError = console.error
const originalConsoleLog = console.log

describe('GET /api/feed/category/[slug]', () => {
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
      reader: 'Feedly',
      subscriberId: 'test-subscriber',
      isConditionalRequest: false
    })
    
    // Mock generateCategoryFeed with default content
    ;(generateCategoryFeed as jest.Mock).mockResolvedValue({
      rss: '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>100 Days of Craft - Technology</title></channel></rss>',
      atom: '',
      json: ''
    })
  })
  
  describe('Basic Response', () => {
    it('should generate valid category RSS feed', async () => {
      const request = createMockRequest()
      const params = Promise.resolve({ slug: 'technology' })
      
      const response = await GET(request, { params })
      
      const content = await expectFeedResponse(response, 'rss')
      expect(content).toContain('<?xml version="1.0"')
      expect(content).toContain('<rss version="2.0">')
      expect(content).toContain('Technology')
    })
    
    it('should set correct headers', async () => {
      const request = createMockRequest()
      const params = Promise.resolve({ slug: 'technology' })
      
      const response = await GET(request, { params })
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/rss+xml; charset=utf-8')
      expect(response.headers.get('X-Robots-Tag')).toBe('noindex')
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Feed-Category')).toBe('technology')
      expect(response.headers.get('Last-Modified')).toBeTruthy()
      expect(response.headers.get('ETag')).toBeTruthy()
    })
    
    it('should set cache headers', async () => {
      const request = createMockRequest()
      const params = Promise.resolve({ slug: 'technology' })
      
      const response = await GET(request, { params })
      
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=600, s-maxage=3600, stale-while-revalidate=7200')
    })
  })
  
  describe('Category Handling', () => {
    it('should call generateCategoryFeed with slug', async () => {
      const request = createMockRequest()
      const params = Promise.resolve({ slug: 'design' })
      
      await GET(request, { params })
      
      expect(generateCategoryFeed).toHaveBeenCalledWith('design')
    })
    
    it('should track feed access with category slug', async () => {
      const request = createMockRequest()
      const params = Promise.resolve({ slug: 'development' })
      
      await GET(request, { params })
      
      expect(FeedAnalytics.trackFeedAccess).toHaveBeenCalledWith(request, 'category-development')
    })
  })
  
  describe('Conditional Requests', () => {
    it('should handle If-None-Match header (ETag)', async () => {
      const mockContent = '<?xml version="1.0"?><rss></rss>'
      ;(generateCategoryFeed as jest.Mock).mockResolvedValue({ rss: mockContent })
      
      // Calculate expected ETag
      const expectedETag = `"${crypto.createHash('md5').update(mockContent).digest('hex')}"`
      
      const request = createMockRequest({
        headers: {
          'If-None-Match': expectedETag
        }
      })
      const params = Promise.resolve({ slug: 'technology' })
      
      const response = await GET(request, { params })
      
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
      const params = Promise.resolve({ slug: 'technology' })
      
      const response = await GET(request, { params })
      
      expect(response.status).toBe(304)
    })
  })
  
  describe('Error Handling', () => {
    it('should handle category not found error', async () => {
      ;(generateCategoryFeed as jest.Mock).mockRejectedValue(new Error('Category not found'))
      
      const request = createMockRequest()
      const params = Promise.resolve({ slug: 'non-existent' })
      
      const response = await GET(request, { params })
      
      expect(response.status).toBe(500)
      expect(response.headers.get('Content-Type')).toBe('application/rss+xml; charset=utf-8')
      expect(response.headers.get('Cache-Control')).toBe('no-cache')
      
      const content = await response.text()
      expect(content).toContain('<?xml version="1.0"')
      expect(content).toContain('<title>Feed Error</title>')
      expect(content).toContain('Unable to generate feed for category: non-existent')
      
      expect(console.error).toHaveBeenCalledWith(
        'Error generating category feed:',
        expect.any(Error)
      )
    })
    
    it('should handle feed generation errors', async () => {
      ;(generateCategoryFeed as jest.Mock).mockRejectedValue(new Error('Feed generation failed'))
      
      const request = createMockRequest()
      const params = Promise.resolve({ slug: 'technology' })
      
      const response = await GET(request, { params })
      
      expect(response.status).toBe(500)
      const content = await response.text()
      expect(content).toContain('Feed Error')
    })
  })
  
  describe('Special Characters in Slug', () => {
    const testCases = [
      { slug: 'web-development', expected: 'web-development' },
      { slug: 'ui-ux', expected: 'ui-ux' },
      { slug: 'machine_learning', expected: 'machine_learning' }
    ]
    
    testCases.forEach(({ slug, expected }) => {
      it(`should handle slug: ${slug}`, async () => {
        const request = createMockRequest()
        const params = Promise.resolve({ slug })
        
        await GET(request, { params })
        
        expect(generateCategoryFeed).toHaveBeenCalledWith(expected)
        expect(FeedAnalytics.trackFeedAccess).toHaveBeenCalledWith(request, `category-${expected}`)
      })
    })
  })
  
  describe('Content Length', () => {
    it('should set content length header', async () => {
      const mockContent = '<?xml version="1.0"?><rss><channel><title>Test</title></channel></rss>'
      ;(generateCategoryFeed as jest.Mock).mockResolvedValue({ rss: mockContent })
      
      const request = createMockRequest()
      const params = Promise.resolve({ slug: 'test' })
      
      const response = await GET(request, { params })
      
      expect(response.headers.get('Content-Length')).toBe(mockContent.length.toString())
    })
  })
})