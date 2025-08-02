import { POST } from '@/app/api/revalidate/route'
import { 
  createMockRequest, 
  expectJsonResponse,
  expectErrorResponse,
  generateWebhookSignature,
  setupTestEnv,
  cleanupTestEnv
} from '@/test-utils/api'
import { revalidatePath, revalidateTag } from 'next/cache'

// Mock Next.js cache functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn()
}))

// Mock console
const originalConsoleLog = console.log
const originalConsoleError = console.error

describe('POST /api/revalidate', () => {
  beforeAll(() => {
    console.log = jest.fn()
    console.error = jest.fn()
  })

  afterAll(() => {
    console.log = originalConsoleLog
    console.error = originalConsoleError
  })

  beforeEach(() => {
    setupTestEnv({
      PRISMIC_WEBHOOK_SECRET: 'test-webhook-secret'
    })
    jest.clearAllMocks()
  })
  
  afterEach(() => {
    cleanupTestEnv()
  })
  
  describe('Webhook Authentication', () => {
    it('should accept valid webhook signature', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['doc123'],
        secret: 'test-webhook-secret'
      }
      
      const body = JSON.stringify(webhookData)
      const signature = generateWebhookSignature(body, 'test-webhook-secret')
      
      const request = createMockRequest({
        method: 'POST',
        headers: {
          'x-prismic-signature': signature,
          'Content-Type': 'application/json'
        },
        body: webhookData
      })
      
      const response = await POST(request)
      
      await expectJsonResponse(response, 200, { 
        revalidated: true,
        paths: expect.any(Array),
        tags: expect.any(Array)
      })
    })
    
    it('should reject invalid webhook signature', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['doc123']
      }
      
      const request = createMockRequest({
        method: 'POST',
        headers: {
          'x-prismic-signature': 'invalid-signature',
          'Content-Type': 'application/json'
        },
        body: webhookData
      })
      
      const response = await POST(request)
      
      await expectErrorResponse(response, 401, 'Invalid webhook signature')
    })
    
    it('should reject missing webhook signature', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['doc123']
      }
      
      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: webhookData
      })
      
      const response = await POST(request)
      
      await expectErrorResponse(response, 401, 'Missing webhook signature')
    })
    
    it('should handle webhook secret in request body', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['doc123'],
        secret: 'test-webhook-secret'
      }
      
      const request = createMockRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: webhookData
      })
      
      const response = await POST(request)
      
      await expectJsonResponse(response, 200, { 
        revalidated: true,
        paths: expect.any(Array),
        tags: expect.any(Array)
      })
    })
  })
  
  describe('Content Type Revalidation', () => {
    beforeEach(() => {
      // Mock successful auth for these tests
      process.env.PRISMIC_WEBHOOK_SECRET = ''
    })
    
    it('should revalidate homepage updates', async () => {
      const webhookData = {
        type: 'api-update',
        masterRef: 'new-ref',
        documents: ['homepage-doc-id'],
        tags: ['homepage']
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      expect(revalidatePath).toHaveBeenCalledWith('/')
      expect(revalidatePath).toHaveBeenCalledWith('/en-us')
      expect(revalidateTag).toHaveBeenCalledWith('homepage')
      expect(revalidateTag).toHaveBeenCalledWith('prismic')
    })
    
    it('should revalidate blog post updates', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['post-doc-id'],
        tags: ['post', 'blog'],
        slugs: {
          'post-doc-id': 'my-blog-post'
        }
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      expect(revalidatePath).toHaveBeenCalledWith('/blog')
      expect(revalidatePath).toHaveBeenCalledWith('/blog/[category]/[slug]', 'page')
      expect(revalidateTag).toHaveBeenCalledWith('post')
      expect(revalidateTag).toHaveBeenCalledWith('blog')
      expect(revalidateTag).toHaveBeenCalledWith('prismic')
    })
    
    it('should revalidate category updates', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['category-doc-id'],
        tags: ['category'],
        slugs: {
          'category-doc-id': 'technology'
        }
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      expect(revalidatePath).toHaveBeenCalledWith('/blog')
      expect(revalidatePath).toHaveBeenCalledWith('/blog/technology')
      expect(revalidateTag).toHaveBeenCalledWith('category')
      expect(revalidateTag).toHaveBeenCalledWith('prismic')
    })
    
    it('should revalidate author updates', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['author-doc-id'],
        tags: ['author'],
        slugs: {
          'author-doc-id': 'john-doe'
        }
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      expect(revalidatePath).toHaveBeenCalledWith('/authors')
      expect(revalidatePath).toHaveBeenCalledWith('/authors/john-doe')
      expect(revalidateTag).toHaveBeenCalledWith('author')
      expect(revalidateTag).toHaveBeenCalledWith('prismic')
    })
    
    it('should revalidate page updates', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['page-doc-id'],
        tags: ['page'],
        slugs: {
          'page-doc-id': 'about-us'
        }
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      expect(revalidatePath).toHaveBeenCalledWith('/about-us')
      expect(revalidateTag).toHaveBeenCalledWith('page')
      expect(revalidateTag).toHaveBeenCalledWith('prismic')
    })
  })
  
  describe('Batch Updates', () => {
    beforeEach(() => {
      process.env.PRISMIC_WEBHOOK_SECRET = ''
    })
    
    it('should handle multiple document updates', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['post1', 'post2', 'post3'],
        tags: ['post'],
        slugs: {
          'post1': 'first-post',
          'post2': 'second-post',
          'post3': 'third-post'
        }
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      // Should revalidate blog list page once
      expect(revalidatePath).toHaveBeenCalledWith('/blog')
      
      // Should revalidate all post pages
      expect(revalidatePath).toHaveBeenCalledTimes(2) // blog + dynamic route
      
      // Should revalidate tags once each
      expect(revalidateTag).toHaveBeenCalledWith('post')
      expect(revalidateTag).toHaveBeenCalledWith('prismic')
    })
    
    it('should handle mixed content type updates', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['post1', 'category1', 'author1', 'page1'],
        tags: ['post', 'category', 'author', 'page']
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      const json = await response.json()
      expect(json.revalidated).toBe(true)
      expect(json.paths.length).toBeGreaterThan(0)
      expect(json.tags.length).toBeGreaterThan(0)
    })
  })
  
  describe('Error Handling', () => {
    it('should handle missing webhook secret env var', async () => {
      delete process.env.PRISMIC_WEBHOOK_SECRET
      
      const webhookData = {
        type: 'api-update',
        documents: ['doc123']
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      // Should still process without auth when secret not configured
      expect(response.status).toBe(200)
    })
    
    it('should handle invalid JSON payload', async () => {
      const request = new Request('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid-json{]'
      })
      
      const response = await POST(request)
      
      await expectErrorResponse(response, 400, 'Invalid request body')
    })
    
    it('should handle revalidation errors gracefully', async () => {
      process.env.PRISMIC_WEBHOOK_SECRET = ''
      
      // Mock revalidation failure
      ;(revalidatePath as jest.Mock).mockRejectedValue(new Error('Revalidation failed'))
      
      const webhookData = {
        type: 'api-update',
        documents: ['doc123'],
        tags: ['test']
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      // Should still return success but log error
      expect(response.status).toBe(200)
      expect(console.error).toHaveBeenCalledWith(
        'Revalidation error:',
        expect.any(Error)
      )
    })
  })
  
  describe('Webhook Event Types', () => {
    beforeEach(() => {
      process.env.PRISMIC_WEBHOOK_SECRET = ''
    })
    
    it('should handle test-trigger events', async () => {
      const webhookData = {
        type: 'test-trigger',
        domain: 'test-repo'
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      await expectJsonResponse(response, 200, { 
        message: 'Test webhook received' 
      })
      
      expect(revalidatePath).not.toHaveBeenCalled()
      expect(revalidateTag).not.toHaveBeenCalled()
    })
    
    it('should handle release events', async () => {
      const webhookData = {
        type: 'release',
        releases: {
          'addition': [{ id: 'doc1' }, { id: 'doc2' }],
          'deletion': [{ id: 'doc3' }]
        }
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      // Should trigger full revalidation
      expect(revalidateTag).toHaveBeenCalledWith('prismic')
    })
    
    it('should ignore unknown event types', async () => {
      const webhookData = {
        type: 'unknown-event',
        data: 'some data'
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      expect(revalidatePath).not.toHaveBeenCalled()
      expect(revalidateTag).not.toHaveBeenCalled()
    })
  })
  
  describe('Performance', () => {
    beforeEach(() => {
      process.env.PRISMIC_WEBHOOK_SECRET = ''
    })
    
    it('should handle large batch updates efficiently', async () => {
      const documents = Array.from({ length: 100 }, (_, i) => `doc${i}`)
      const tags = Array.from({ length: 20 }, (_, i) => `tag${i}`)
      
      const webhookData = {
        type: 'api-update',
        documents,
        tags
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const startTime = Date.now()
      const response = await POST(request)
      const endTime = Date.now()
      
      expect(response.status).toBe(200)
      
      // Should complete within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000)
    })
    
    it('should deduplicate revalidation calls', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['post1', 'post2', 'post3'],
        tags: ['post', 'post', 'blog', 'blog'] // Duplicate tags
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      
      expect(response.status).toBe(200)
      
      // Should only call revalidateTag once per unique tag
      const revalidateTagCalls = (revalidateTag as jest.Mock).mock.calls
      const uniqueTags = new Set(revalidateTagCalls.map(call => call[0]))
      expect(uniqueTags.size).toBe(revalidateTagCalls.length)
    })
  })
  
  describe('Response Format', () => {
    beforeEach(() => {
      process.env.PRISMIC_WEBHOOK_SECRET = ''
    })
    
    it('should return detailed revalidation info', async () => {
      const webhookData = {
        type: 'api-update',
        documents: ['post1', 'category1'],
        tags: ['post', 'category']
      }
      
      const request = createMockRequest({
        method: 'POST',
        body: webhookData
      })
      
      const response = await POST(request)
      const json = await response.json()
      
      expect(json).toEqual({
        revalidated: true,
        paths: expect.arrayContaining(['/blog']),
        tags: expect.arrayContaining(['post', 'category', 'prismic']),
        timestamp: expect.any(Number)
      })
    })
  })
})