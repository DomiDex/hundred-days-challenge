import type { 
  PostDocument, 
  CategoryDocument,
  HomepageDocument,
  PageDocument,
  AuthorDocument
} from '../../prismicio-types'
import type * as prismic from '@prismicio/client'

// Mock rich text field
export const mockRichTextField: prismic.RichTextField = [
  {
    type: 'paragraph',
    text: 'Test paragraph content',
    spans: [],
  },
]

// Mock Post document
export const mockPost: PostDocument = {
  url: 'https://example.com/blog/test-category/test-post',
  id: 'test-post-1',
  uid: 'test-post',
  type: 'post',
  href: '/blog/test-category/test-post',
  tags: [],
  first_publication_date: '2024-01-01T00:00:00+0000',
  last_publication_date: '2024-01-01T00:00:00+0000',
  slugs: ['test-post'],
  linked_documents: [],
  lang: 'en-us',
  alternate_languages: [],
  data: {
    name: 'Test Post Title',
    excerpt: 'Test post excerpt for testing purposes',
    image: {
      id: 'test-image',
      edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
      url: 'https://images.prismic.io/test/test-image.jpg',
      alt: 'Test image alt text',
      copyright: null,
      dimensions: { width: 1200, height: 630 },
      thumbnail: {
        id: 'test-image',
        edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
        url: 'https://images.prismic.io/test/test-image.jpg',
        alt: 'Test image alt text',
        copyright: null,
        dimensions: { width: 400, height: 210 },
      },
    },
    publication_date: '2024-01-01',
    article_text: mockRichTextField,
    slices: [],
    demo_link: { link_type: 'Any' },
    github_link: { link_type: 'Any' },
    category: {
      id: 'test-category-1',
      type: 'category',
      tags: [],
      lang: 'en-us',
      uid: 'test-category',
      link_type: 'Document',
      isBroken: false,
    },
    author: {
      id: 'test-author-1',
      type: 'author',
      tags: [],
      lang: 'en-us',
      uid: 'test-author',
      link_type: 'Document',
      isBroken: false,
    },
    meta_title: 'Test Post Title | SEO',
    meta_description: 'Test post meta description for SEO',
    og_title: 'Test Post Title | OG',
    og_description: 'Test post OG description',
    og_type: 'article',
    og_image: {
      id: '',
      edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
      url: '',
      alt: null,
      copyright: null,
      dimensions: { width: 0, height: 0 },
    },
    twitter_card: 'summary_large_image',
    article_author: 'Test Author',
    keywords: 'test, blog, post',
    canonical_url: 'https://example.com/blog/test-category/test-post',
    robots: 'index,follow',
  },
}

// Mock Author document
export const mockAuthor: AuthorDocument = {
  url: 'https://example.com/authors/test-author',
  id: 'test-author-1',
  uid: 'test-author',
  type: 'author',
  href: '/authors/test-author',
  tags: [],
  first_publication_date: '2024-01-01T00:00:00+0000',
  last_publication_date: '2024-01-01T00:00:00+0000',
  slugs: ['test-author'],
  linked_documents: [],
  lang: 'en-us',
  alternate_languages: [],
  data: {
    name: 'Test Author',
    role: 'Senior Developer',
    bio: mockRichTextField,
    linkedin_link: { link_type: 'Any' },
    x_link: { link_type: 'Any' },
    github_link: { link_type: 'Any' },
    website_link: { link_type: 'Any' },
    meta_title: 'Test Author | SEO',
    meta_description: 'Test author meta description',
    og_title: 'Test Author | OG',
    og_description: 'Test author OG description',
    og_image: {
      id: '',
      edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
      url: '',
      alt: null,
      copyright: null,
      dimensions: { width: 0, height: 0 },
    },
    twitter_card: 'summary',
    canonical_url: 'https://example.com/authors/test-author',
    robots: 'index,follow',
    slices: [],
    avatar: {
      id: 'test-avatar',
      edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
      url: 'https://images.prismic.io/test/test-avatar.jpg',
      alt: 'Test Author Avatar',
      copyright: null,
      dimensions: { width: 200, height: 200 },
      thumbnail: {
        id: 'test-avatar',
        edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
        url: 'https://images.prismic.io/test/test-avatar.jpg',
        alt: 'Test Author Avatar',
        copyright: null,
        dimensions: { width: 100, height: 100 },
      },
    },
  },
}

// Mock Category document
export const mockCategory: CategoryDocument = {
  url: 'https://example.com/blog/test-category',
  id: 'test-category-1',
  uid: 'test-category',
  type: 'category',
  href: '/blog/test-category',
  tags: [],
  first_publication_date: '2024-01-01T00:00:00+0000',
  last_publication_date: '2024-01-01T00:00:00+0000',
  slugs: ['test-category'],
  linked_documents: [],
  lang: 'en-us',
  alternate_languages: [],
  data: {
    name: 'Technology',
    description: 'Test category description',
    image: {
      id: 'test-cat-image',
      edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
      url: 'https://images.prismic.io/test/test-cat-image.jpg',
      alt: 'Test category image',
      copyright: null,
      dimensions: { width: 800, height: 600 },
      thumbnail: {
        id: 'test-cat-image',
        edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
        url: 'https://images.prismic.io/test/test-cat-image.jpg',
        alt: 'Test category image',
        copyright: null,
        dimensions: { width: 200, height: 150 },
      },
    },
    content: mockRichTextField,
    meta_title: 'Test Category | SEO',
    meta_description: 'Test category meta description',
    og_title: 'Test Category OG',
    og_description: 'Test category OG description',
    og_image: {
      id: 'test-og-image',
      edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
      url: 'https://images.prismic.io/test/test-og-image.jpg',
      alt: 'Test OG image',
      copyright: null,
      dimensions: { width: 1200, height: 630 },
    },
    twitter_card: 'summary',
    canonical_url: 'https://example.com/blog/test-category',
    robots: 'index,follow',
  },
}

// Mock Homepage document
export const mockHomepage: HomepageDocument = {
  url: 'https://example.com',
  id: 'test-homepage',
  uid: null,
  type: 'homepage',
  href: '/',
  tags: [],
  first_publication_date: '2024-01-01T00:00:00+0000',
  last_publication_date: '2024-01-01T00:00:00+0000',
  slugs: ['homepage'],
  linked_documents: [],
  lang: 'en-us',
  alternate_languages: [],
  data: {
    title: 'Test Homepage Title',
    slices: [],
    meta_title: 'Test Homepage | SEO',
    meta_description: 'Test homepage meta description',
    og_title: 'Test Homepage | OG',
    og_description: 'Test homepage description',
    og_image: {
      id: '',
      edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
      url: '',
      alt: null,
      copyright: null,
      dimensions: { width: 0, height: 0 },
    },
    twitter_card: 'summary',
    canonical_url: 'https://example.com',
    robots: 'index,follow',
  },
}

// Mock Page document
export const mockPage: PageDocument = {
  url: 'https://example.com/test-page',
  id: 'test-page',
  uid: 'test-page',
  type: 'page',
  href: '/test-page',
  tags: [],
  first_publication_date: '2024-01-01T00:00:00+0000',
  last_publication_date: '2024-01-01T00:00:00+0000',
  slugs: ['test-page'],
  linked_documents: [],
  lang: 'en-us',
  alternate_languages: [],
  data: {
    title: 'Test Page Title',
    description: 'Test page description',
    content: mockRichTextField,
    slices: [],
    meta_title: 'Test Page | SEO',
    meta_description: 'Test page meta description',
    og_title: 'Test Page | OG',
    og_description: 'Test page OG description',
    og_image: {
      id: '',
      edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
      url: '',
      alt: null,
      copyright: null,
      dimensions: { width: 0, height: 0 },
    },
    twitter_card: 'summary',
    canonical_url: 'https://example.com/test-page',
    robots: 'index,follow',
  },
}

// Factory functions for creating custom mocks
export const createMockPost = (overrides: Partial<PostDocument> = {}): PostDocument => ({
  ...mockPost,
  ...overrides,
  data: {
    ...mockPost.data,
    ...(overrides.data || {}),
  },
})

export const createMockAuthor = (overrides: Partial<AuthorDocument> = {}): AuthorDocument => {
  const base = {
    ...mockAuthor,
    ...overrides,
  }
  if (overrides.data) {
    base.data = {
      ...mockAuthor.data,
      ...overrides.data,
    }
  }
  return base as AuthorDocument
}

export const createMockCategory = (overrides: Partial<CategoryDocument> = {}): CategoryDocument => ({
  ...mockCategory,
  ...overrides,
  data: {
    ...mockCategory.data,
    ...(overrides.data || {}),
  },
})

// Mock Prismic client responses
export const mockPrismicClient = {
  getByUID: jest.fn(),
  getSingle: jest.fn(),
  getAllByType: jest.fn(),
  getByID: jest.fn(),
  query: jest.fn(),
}

// Mock next/navigation
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

export const mockSearchParams = new URLSearchParams()
export const mockPathname = '/'

// Mock Zustand store
export const mockThemeStore = {
  theme: 'light' as const,
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
}