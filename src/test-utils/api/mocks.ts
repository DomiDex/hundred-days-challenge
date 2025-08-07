import type { PostDocument, CategoryDocument, AuthorDocument } from '../../../prismicio-types'
import * as prismic from '@prismicio/client'
import { createClient } from '@/prismicio'

// Mock Prismic client
jest.mock('@/prismicio', () => ({
  createClient: jest.fn(),
}))

/**
 * Mocks Prismic client with predefined responses
 */
interface MockPrismicResponse {
  getByUID?: Record<string, PostDocument | CategoryDocument | AuthorDocument>
  getAllByType?: Array<PostDocument | CategoryDocument | AuthorDocument>
  getByID?: Record<string, PostDocument | CategoryDocument | AuthorDocument>
  query?: jest.Mock
}

export function mockPrismicClient(responses: MockPrismicResponse = {}) {
  const client = {
    getByUID: jest.fn().mockImplementation((type: string, uid: string) => {
      const key = `${type}:${uid}`
      if (responses.getByUID?.[key] || responses.getByUID?.[uid]) {
        return Promise.resolve(responses.getByUID[key] || responses.getByUID[uid])
      }
      return Promise.reject(new Error('Document not found'))
    }),
    getAllByType: jest.fn().mockImplementation(() => {
      return Promise.resolve(responses.getAllByType || [])
    }),
    getByID: jest.fn().mockImplementation((id: string) => {
      if (responses.getByID?.[id]) {
        return Promise.resolve(responses.getByID[id])
      }
      return Promise.reject(new Error('Document not found'))
    }),
    query:
      responses.query ||
      jest.fn().mockResolvedValue({
        results: [],
        total_results_size: 0,
        page: 1,
        total_pages: 1,
      }),
  }

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
    processWebhook: jest.fn().mockResolvedValue({ processed: true }),
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
      reset: new Date(Date.now() + 3600000),
    }),
  }
}

/**
 * Creates a mock post document
 */
interface PostOverrides {
  id?: string
  uid?: string
  title?: string
  name?: string
  excerpt?: string
  publishedAt?: string
  publication_date?: string
  category?:
    | CategoryDocument
    | {
        id: string
        type: string
        tags: string[]
        slug: string
        lang: string
        uid: string
        data: Record<string, unknown>
        link_type: string
        isBroken: boolean
      }
  author?:
    | AuthorDocument
    | {
        id: string
        type: string
        tags: string[]
        slug: string
        lang: string
        uid: string
        data: Record<string, unknown>
        link_type: string
        isBroken: boolean
      }
  tags?: string[]
  [key: string]: unknown
}

export function createMockPost(overrides: PostOverrides = {}): PostDocument {
  // Extract simplified overrides
  const {
    id,
    title,
    name,
    excerpt,
    publishedAt,
    publication_date,
    category,
    author,
    tags,
    ...restOverrides
  } = overrides
  const defaultPost: PostDocument = {
    id: id || 'test-post-id',
    uid: 'test-post',
    type: 'post',
    href: '/blog/test-post',
    tags: tags || ['blog'],
    url: null,
    first_publication_date: '2024-01-01T00:00:00+0000',
    last_publication_date: '2024-01-01T00:00:00+0000',
    slugs: ['test-post'],
    linked_documents: [],
    lang: 'en-us',
    alternate_languages: [],
    data: {
      name: name || title || 'Test Post Title', // 'name' is the correct field name in Prismic
      excerpt: excerpt || 'Test post excerpt',
      image: {
        url: 'https://example.com/image.jpg',
        alt: 'Test image',
        dimensions: { width: 1200, height: 630 },
        id: 'test-image-id',
        edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
        copyright: null,
        thumbnail: {
          url: 'https://example.com/image-thumb.jpg',
          alt: 'Test image',
          dimensions: { width: 600, height: 315 },
          id: 'test-image-thumb-id',
          edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
          copyright: null,
        },
      },
      publication_date: (publication_date || publishedAt || '2024-01-01') as prismic.DateField,
      author: (author as prismic.ContentRelationshipField<'author'>) || {
        id: 'author-1',
        type: 'author',
        tags: [],
        slug: 'test-author',
        lang: 'en-us',
        uid: 'test-author',
        data: {},
        link_type: 'Document',
        isBroken: false,
      },
      category: (category as prismic.ContentRelationshipField<'category'>) || {
        id: 'category-1',
        type: 'category',
        tags: [],
        slug: 'test-category',
        lang: 'en-us',
        uid: 'test-category',
        data: {},
        link_type: 'Document',
        isBroken: false,
      },
      og_image: {
        url: null,
        alt: null,
        dimensions: null,
        id: null,
        edit: null,
        copyright: null,
      } as PostDocument['data']['og_image'],
      article_text: [],
      demo_link: { link_type: 'Any' },
      github_link: { link_type: 'Any' },
      slices: [],
      meta_title: 'Test Post Meta Title',
      meta_description: 'Test post meta description',
      og_title: 'Test Post OG Title',
      og_description: 'Test post OG description',
      og_type: 'article' as const,
      article_author: 'Test Author',
      twitter_card: 'summary_large_image' as const,
      canonical_url: '',
      robots: 'index,follow' as const,
      keywords: '',
    },
    ...restOverrides,
  }

  return defaultPost
}

/**
 * Creates a mock category document
 */
interface CategoryOverrides {
  id?: string
  uid?: string
  title?: string
  name?: string
  [key: string]: unknown
}

export function createMockCategory(overrides: CategoryOverrides = {}): CategoryDocument {
  const { id, uid, ...restOverrides } = overrides
  const defaultCategory: CategoryDocument = {
    id: id || 'test-category-id',
    uid: uid || 'test-category',
    type: 'category',
    href: '/category/test-category',
    tags: [],
    url: null,
    first_publication_date: '2024-01-01T00:00:00+0000',
    last_publication_date: '2024-01-01T00:00:00+0000',
    slugs: ['test-category'],
    linked_documents: [],
    lang: 'en-us',
    alternate_languages: [],
    data: {
      name: 'Test Category',
      description: 'Test category description',
      image: {
        url: 'https://example.com/category.jpg',
        alt: 'Test category',
        dimensions: { width: 1200, height: 630 },
        id: 'test-category-image-id',
        edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
        copyright: null,
        thumbnail: {
          url: 'https://example.com/category-thumb.jpg',
          alt: 'Test category',
          dimensions: { width: 600, height: 315 },
          id: 'test-category-thumb-id',
          edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
          copyright: null,
        },
      },
      content: [],
      meta_title: 'Test Category Meta Title',
      meta_description: 'Test category meta description',
      og_title: 'Test Category OG Title',
      og_description: 'Test category OG description',
      og_image: {
        url: null,
        alt: null,
        dimensions: null,
        id: null,
        edit: null,
        copyright: null,
      } as CategoryDocument['data']['og_image'],
      twitter_card: 'summary' as const,
      canonical_url: '',
      robots: 'index,follow' as const,
    },
    ...restOverrides,
  }

  return defaultCategory
}

/**
 * Creates a mock author document
 */
interface AuthorOverrides {
  id?: string
  uid?: string
  name?: string
  [key: string]: unknown
}

export function createMockAuthor(overrides: AuthorOverrides = {}): AuthorDocument {
  const { id, uid, name, ...restOverrides } = overrides
  const defaultAuthor: AuthorDocument = {
    id: id || 'test-author-id',
    uid: uid || 'test-author',
    type: 'author',
    href: '/author/test-author',
    tags: [],
    url: null,
    first_publication_date: '2024-01-01T00:00:00+0000',
    last_publication_date: '2024-01-01T00:00:00+0000',
    slugs: ['test-author'],
    linked_documents: [],
    lang: 'en-us',
    alternate_languages: [],
    data: {
      name: name || 'Test Author',
      role: 'Developer',
      bio: [{ type: 'paragraph', text: 'Test author bio', spans: [] }],
      avatar: {
        url: 'https://example.com/avatar.jpg',
        alt: 'Test author',
        dimensions: { width: 200, height: 200 },
        id: 'test-avatar-id',
        edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
        copyright: null,
        thumbnail: {
          url: 'https://example.com/avatar-thumb.jpg',
          alt: 'Test author',
          dimensions: { width: 100, height: 100 },
          id: 'test-avatar-thumb-id',
          edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
          copyright: null,
        },
      },
      linkedin_link: { link_type: 'Web', url: 'https://linkedin.com/in/test' },
      x_link: { link_type: 'Any' },
      github_link: { link_type: 'Any' },
      website_link: { link_type: 'Any' },
      slices: [],
      meta_title: 'Test Author Meta Title',
      meta_description: 'Test author meta description',
      og_title: 'Test Author OG Title',
      og_description: 'Test author OG description',
      og_image: {
        url: null,
        alt: null,
        dimensions: null,
        id: null,
        edit: null,
        copyright: null,
      } as AuthorDocument['data']['og_image'],
      twitter_card: 'summary' as const,
      canonical_url: '',
      robots: 'index,follow' as const,
    },
    ...restOverrides,
  }

  return defaultAuthor
}
