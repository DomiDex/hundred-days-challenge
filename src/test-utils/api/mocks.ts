import type { PostDocument, CategoryDocument, AuthorDocument } from '../../../../prismicio-types'

// Mock Prismic client
jest.mock('@/prismicio', () => ({
  createClient: jest.fn()
}))

/**
 * Mocks Prismic client with predefined responses
 */
export function mockPrismicClient(responses: {
  getByUID?: Record<string, any>
  getAllByType?: any[]
  getByID?: Record<string, any>
  query?: jest.Mock
} = {}) {
  const client = {
    getByUID: jest.fn().mockImplementation((type: string, uid: string) => {
      const key = `${type}:${uid}`
      if (responses.getByUID?.[key] || responses.getByUID?.[uid]) {
        return Promise.resolve(responses.getByUID[key] || responses.getByUID[uid])
      }
      return Promise.reject(new Error('Document not found'))
    }),
    getAllByType: jest.fn().mockImplementation((type: string) => {
      return Promise.resolve(responses.getAllByType || [])
    }),
    getByID: jest.fn().mockImplementation((id: string) => {
      if (responses.getByID?.[id]) {
        return Promise.resolve(responses.getByID[id])
      }
      return Promise.reject(new Error('Document not found'))
    }),
    query: responses.query || jest.fn().mockResolvedValue({ 
      results: [], 
      total_results_size: 0,
      page: 1,
      total_pages: 1
    })
  }
  
  const { createClient } = require('@/prismicio')
  ;(createClient as jest.Mock).mockReturnValue(client)
  return client
}

/**
 * Mocks newsletter service
 */
export function mockNewsletterService() {
  return {
    subscribe: jest.fn().mockResolvedValue({ id: 'sub_123', status: 'pending' }),
    unsubscribe: jest.fn().mockResolvedValue({ success: true }),
    verifyWebhook: jest.fn().mockReturnValue(true),
    processWebhook: jest.fn().mockResolvedValue({ processed: true })
  }
}

/**
 * Mocks rate limiter
 */
export function mockRateLimiter(allowed: boolean = true) {
  return {
    check: jest.fn().mockResolvedValue({
      success: allowed,
      limit: 100,
      remaining: allowed ? 99 : 0,
      reset: new Date(Date.now() + 3600000)
    })
  }
}

/**
 * Creates a mock post document
 */
export function createMockPost(overrides: Partial<PostDocument> = {}): PostDocument {
  const defaultPost: PostDocument = {
    id: 'test-post-id',
    uid: 'test-post',
    type: 'post',
    href: '/blog/test-post',
    tags: ['blog'],
    first_publication_date: '2024-01-01T00:00:00+0000',
    last_publication_date: '2024-01-01T00:00:00+0000',
    slugs: ['test-post'],
    linked_documents: [],
    lang: 'en-us',
    alternate_languages: [],
    data: {
      title: 'Test Post Title',
      excerpt: 'Test post excerpt',
      content: [],
      featuredImage: {
        url: 'https://example.com/image.jpg',
        alt: 'Test image',
        dimensions: { width: 1200, height: 630 },
        id: null,
        edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
        copyright: null
      },
      publishDate: '2024-01-01',
      author: {
        id: 'author-1',
        type: 'author',
        tags: [],
        slug: 'test-author',
        lang: 'en-us',
        uid: 'test-author',
        data: {},
        link_type: 'Document',
        isBroken: false
      },
      category: {
        id: 'category-1',
        type: 'category',
        tags: [],
        slug: 'test-category',
        lang: 'en-us',
        uid: 'test-category',
        data: {},
        link_type: 'Document',
        isBroken: false
      },
      meta_title: 'Test Post Meta Title',
      meta_description: 'Test post meta description',
      og_image: null
    },
    ...overrides
  }
  
  return defaultPost
}

/**
 * Creates a mock category document
 */
export function createMockCategory(overrides: Partial<CategoryDocument> = {}): CategoryDocument {
  const defaultCategory: CategoryDocument = {
    id: 'test-category-id',
    uid: 'test-category',
    type: 'category',
    href: '/category/test-category',
    tags: [],
    first_publication_date: '2024-01-01T00:00:00+0000',
    last_publication_date: '2024-01-01T00:00:00+0000',
    slugs: ['test-category'],
    linked_documents: [],
    lang: 'en-us',
    alternate_languages: [],
    data: {
      name: 'Test Category',
      description: [{ type: 'paragraph', text: 'Test category description', spans: [] }],
      color: '#000000'
    },
    ...overrides
  }
  
  return defaultCategory
}

/**
 * Creates a mock author document
 */
export function createMockAuthor(overrides: Partial<AuthorDocument> = {}): AuthorDocument {
  const defaultAuthor: AuthorDocument = {
    id: 'test-author-id',
    uid: 'test-author',
    type: 'author',
    href: '/author/test-author',
    tags: [],
    first_publication_date: '2024-01-01T00:00:00+0000',
    last_publication_date: '2024-01-01T00:00:00+0000',
    slugs: ['test-author'],
    linked_documents: [],
    lang: 'en-us',
    alternate_languages: [],
    data: {
      name: 'Test Author',
      bio: [{ type: 'paragraph', text: 'Test author bio', spans: [] }],
      avatar: {
        url: 'https://example.com/avatar.jpg',
        alt: 'Test author',
        dimensions: { width: 200, height: 200 },
        id: null,
        edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
        copyright: null,
        thumbnail: {
          url: 'https://example.com/avatar-thumb.jpg',
          alt: 'Test author',
          dimensions: { width: 100, height: 100 },
          id: null,
          edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
          copyright: null
        }
      },
      role: 'Developer',
      linkedin_link: { link_type: 'Web', url: 'https://linkedin.com/in/test' },
      x_link: null,
      github_link: null,
      website_link: null
    },
    ...overrides
  }
  
  return defaultAuthor
}