import { GET } from '@/app/api/posts/route'
import {
  createMockRequest,
  expectJsonResponse,
  expectErrorResponse,
  setupTestEnv,
  cleanupTestEnv,
  mockPrismicClient,
  createMockPost,
  createMockCategory,
  createMockAuthor,
} from '@/test-utils/api'
import { createClient } from '@/prismicio'

// Mock Prismic client
jest.mock('@/prismicio', () => ({
  createClient: jest.fn(),
}))

// Mock console
const originalConsoleError = console.error

describe('GET /api/posts', () => {
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
  })

  beforeEach(() => {
    setupTestEnv()
    jest.clearAllMocks()

    // Setup default mock client
    const mockClient = mockPrismicClient()
    ;(createClient as jest.Mock).mockReturnValue(mockClient)
  })

  afterEach(() => {
    cleanupTestEnv()
  })

  describe('Basic Functionality', () => {
    it('should return all published posts', async () => {
      const mockPosts = [
        createMockPost({ id: '1', data: { ...createMockPost().data, name: 'Post 1' } }),
        createMockPost({ id: '2', data: { ...createMockPost().data, name: 'Post 2' } }),
        createMockPost({ id: '3', data: { ...createMockPost().data, name: 'Post 3' } }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(mockPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
      })

      const response = await GET(request)

      await expectJsonResponse(response, 200, {
        posts: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            title: 'Post 1',
            slug: expect.any(String),
            excerpt: expect.any(String),
            publishedAt: expect.any(String),
          }),
          expect.objectContaining({
            id: '2',
            title: 'Post 2',
          }),
          expect.objectContaining({
            id: '3',
            title: 'Post 3',
          }),
        ]),
        total: 3,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      })

      expect(mockClient.getAllByType).toHaveBeenCalledWith('post', {
        orderings: {
          field: 'document.first_publication_date',
          direction: 'desc',
        },
        fetchLinks: ['category.title', 'author.name', 'author.picture'],
      })
    })

    it('should return empty array when no posts exist', async () => {
      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue([])
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
      })

      const response = await GET(request)

      await expectJsonResponse(response, 200, {
        posts: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      })
    })
  })

  describe('Pagination', () => {
    it('should paginate results', async () => {
      const allPosts = Array.from({ length: 25 }, (_, i) =>
        createMockPost({ id: `${i + 1}`, title: `Post ${i + 1}` })
      )

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      // Page 1
      const request1 = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?page=1&pageSize=10',
      })

      const response1 = await GET(request1)
      const json1 = await response1.json()

      expect(json1.posts).toHaveLength(10)
      expect(json1.page).toBe(1)
      expect(json1.totalPages).toBe(3)
      expect(json1.posts[0].id).toBe('1')
      expect(json1.posts[9].id).toBe('10')

      // Page 2
      const request2 = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?page=2&pageSize=10',
      })

      const response2 = await GET(request2)
      const json2 = await response2.json()

      expect(json2.posts).toHaveLength(10)
      expect(json2.page).toBe(2)
      expect(json2.posts[0].id).toBe('11')
      expect(json2.posts[9].id).toBe('20')

      // Page 3 (partial)
      const request3 = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?page=3&pageSize=10',
      })

      const response3 = await GET(request3)
      const json3 = await response3.json()

      expect(json3.posts).toHaveLength(5)
      expect(json3.page).toBe(3)
      expect(json3.posts[0].id).toBe('21')
      expect(json3.posts[4].id).toBe('25')
    })

    it('should handle custom page sizes', async () => {
      const allPosts = Array.from({ length: 30 }, (_, i) => createMockPost({ id: `${i + 1}` }))

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?pageSize=5',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts).toHaveLength(5)
      expect(json.pageSize).toBe(5)
      expect(json.totalPages).toBe(6)
    })

    it('should limit maximum page size', async () => {
      const allPosts = Array.from({ length: 200 }, (_, i) => createMockPost({ id: `${i + 1}` }))

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?pageSize=200',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts).toHaveLength(100) // Max page size
      expect(json.pageSize).toBe(100)
    })

    it('should handle out of range page numbers', async () => {
      const allPosts = Array.from({ length: 5 }, (_, i) => createMockPost({ id: `${i + 1}` }))

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?page=10',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts).toHaveLength(0)
      expect(json.page).toBe(10)
      expect(json.total).toBe(5)
    })
  })

  describe('Filtering', () => {
    it('should filter by category', async () => {
      const techCategory = createMockCategory({ uid: 'technology' })
      const designCategory = createMockCategory({ uid: 'design' })

      const allPosts = [
        createMockPost({ id: '1', category: techCategory }),
        createMockPost({ id: '2', category: designCategory }),
        createMockPost({ id: '3', category: techCategory }),
        createMockPost({ id: '4', category: designCategory }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?category=technology',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts).toHaveLength(2)
      expect(json.posts[0].id).toBe('1')
      expect(json.posts[1].id).toBe('3')
      expect(json.total).toBe(2)
    })

    it('should filter by author', async () => {
      const author1 = createMockAuthor({ uid: 'john-doe' })
      const author2 = createMockAuthor({ uid: 'jane-smith' })

      const allPosts = [
        createMockPost({ id: '1', author: author1 }),
        createMockPost({ id: '2', author: author2 }),
        createMockPost({ id: '3', author: author1 }),
        createMockPost({ id: '4', author: author2 }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?author=john-doe',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts).toHaveLength(2)
      expect(json.posts[0].id).toBe('1')
      expect(json.posts[1].id).toBe('3')
    })

    it('should filter by tags', async () => {
      const allPosts = [
        createMockPost({ id: '1', tags: ['javascript', 'react'] }),
        createMockPost({ id: '2', tags: ['python', 'django'] }),
        createMockPost({ id: '3', tags: ['javascript', 'vue'] }),
        createMockPost({ id: '4', tags: ['typescript', 'react'] }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?tags=javascript',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts).toHaveLength(2)
      expect(json.posts[0].id).toBe('1')
      expect(json.posts[1].id).toBe('3')
    })

    it('should filter by multiple tags', async () => {
      const allPosts = [
        createMockPost({ id: '1', tags: ['javascript', 'react'] }),
        createMockPost({ id: '2', tags: ['javascript', 'vue'] }),
        createMockPost({ id: '3', tags: ['typescript', 'react'] }),
        createMockPost({ id: '4', tags: ['python', 'django'] }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?tags=javascript,react',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts).toHaveLength(1)
      expect(json.posts[0].id).toBe('1') // Only post with both tags
    })

    it('should combine multiple filters', async () => {
      const techCategory = createMockCategory({ uid: 'technology' })
      const author = createMockAuthor({ uid: 'john-doe' })

      const allPosts = [
        createMockPost({ id: '1', category: techCategory, author, tags: ['javascript'] }),
        createMockPost({ id: '2', category: techCategory, author, tags: ['python'] }),
        createMockPost({ id: '3', category: techCategory, tags: ['javascript'] }),
        createMockPost({ id: '4', author, tags: ['javascript'] }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?category=technology&author=john-doe&tags=javascript',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts).toHaveLength(1)
      expect(json.posts[0].id).toBe('1')
    })
  })

  describe('Searching', () => {
    it('should search by title', async () => {
      const allPosts = [
        createMockPost({ id: '1', title: 'Getting Started with React' }),
        createMockPost({ id: '2', title: 'Advanced TypeScript Patterns' }),
        createMockPost({ id: '3', title: 'React Performance Tips' }),
        createMockPost({ id: '4', title: 'Python for Beginners' }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?search=react',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts).toHaveLength(2)
      expect(json.posts[0].id).toBe('1')
      expect(json.posts[1].id).toBe('3')
    })

    it('should search by excerpt', async () => {
      const allPosts = [
        createMockPost({ id: '1', excerpt: 'Learn the basics of React hooks' }),
        createMockPost({ id: '2', excerpt: 'Deep dive into TypeScript generics' }),
        createMockPost({ id: '3', excerpt: 'Understanding React context API' }),
        createMockPost({ id: '4', excerpt: 'Python data structures explained' }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?search=react',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts).toHaveLength(2)
    })

    it('should handle case-insensitive search', async () => {
      const allPosts = [
        createMockPost({ id: '1', title: 'REACT Best Practices' }),
        createMockPost({ id: '2', title: 'react hooks guide' }),
        createMockPost({ id: '3', title: 'React Native Tutorial' }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?search=ReAcT',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts).toHaveLength(3)
    })
  })

  describe('Sorting', () => {
    it('should sort by publication date (default)', async () => {
      const allPosts = [
        createMockPost({ id: '1', publishedAt: '2024-01-01' }),
        createMockPost({ id: '2', publishedAt: '2024-03-01' }),
        createMockPost({ id: '3', publishedAt: '2024-02-01' }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
      })

      const response = await GET(request)
      const json = await response.json()

      // Should be sorted newest first
      expect(json.posts[0].publishedAt).toBe('2024-03-01')
      expect(json.posts[1].publishedAt).toBe('2024-02-01')
      expect(json.posts[2].publishedAt).toBe('2024-01-01')
    })

    it('should sort by title', async () => {
      const allPosts = [
        createMockPost({ id: '1', title: 'Charlie' }),
        createMockPost({ id: '2', title: 'Alpha' }),
        createMockPost({ id: '3', title: 'Bravo' }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?sort=title',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts[0].title).toBe('Alpha')
      expect(json.posts[1].title).toBe('Bravo')
      expect(json.posts[2].title).toBe('Charlie')
    })

    it('should handle sort direction', async () => {
      const allPosts = [
        createMockPost({ id: '1', title: 'Alpha' }),
        createMockPost({ id: '2', title: 'Bravo' }),
        createMockPost({ id: '3', title: 'Charlie' }),
      ]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?sort=title&order=desc',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts[0].title).toBe('Charlie')
      expect(json.posts[1].title).toBe('Bravo')
      expect(json.posts[2].title).toBe('Alpha')
    })
  })

  describe('Field Selection', () => {
    it('should return only requested fields', async () => {
      const allPosts = [createMockPost({ id: '1', title: 'Test Post' })]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?fields=id,title,slug',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts[0]).toEqual({
        id: '1',
        title: 'Test Post',
        slug: expect.any(String),
      })

      // Should not include other fields
      expect(json.posts[0]).not.toHaveProperty('excerpt')
      expect(json.posts[0]).not.toHaveProperty('author')
      expect(json.posts[0]).not.toHaveProperty('category')
    })

    it('should handle nested field selection', async () => {
      const author = createMockAuthor({ uid: 'john-doe', name: 'John Doe' })
      const category = createMockCategory({ uid: 'tech', title: 'Technology' })

      const allPosts = [createMockPost({ id: '1', author, category })]

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(allPosts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?fields=id,author.name,category.title',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts[0]).toEqual({
        id: '1',
        author: {
          name: 'John Doe',
        },
        category: {
          title: 'Technology',
        },
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle Prismic API errors', async () => {
      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockRejectedValue(new Error('Prismic API Error'))
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
      })

      const response = await GET(request)

      await expectErrorResponse(response, 500, 'Failed to fetch posts')

      expect(console.error).toHaveBeenCalledWith('Error fetching posts:', expect.any(Error))
    })

    it('should handle invalid query parameters', async () => {
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?page=invalid',
      })

      const response = await GET(request)
      const json = await response.json()

      // Should use default page value
      expect(json.page).toBe(1)
    })
  })

  describe('Caching', () => {
    it('should set appropriate cache headers', async () => {
      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue([])
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
      })

      const response = await GET(request)

      expect(response.headers.get('Cache-Control')).toBe(
        'public, s-maxage=60, stale-while-revalidate=300'
      )
    })

    it('should support conditional requests with ETags', async () => {
      const posts = [createMockPost({ id: '1' })]
      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(posts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      // First request
      const request1 = createMockRequest({
        method: 'GET',
      })

      const response1 = await GET(request1)
      const etag = response1.headers.get('ETag')

      expect(etag).toBeTruthy()

      // Second request with If-None-Match
      const request2 = createMockRequest({
        method: 'GET',
        headers: {
          'If-None-Match': etag!,
        },
      })

      const response2 = await GET(request2)

      expect(response2.status).toBe(304)
      expect(response2.body).toBeNull()
    })
  })

  describe('Response Format', () => {
    it('should include metadata in response', async () => {
      const posts = Array.from({ length: 25 }, (_, i) => createMockPost({ id: `${i + 1}` }))

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue(posts)
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?page=2&pageSize=10',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json).toMatchObject({
        posts: expect.any(Array),
        total: 25,
        page: 2,
        pageSize: 10,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
        nextPage: 3,
        previousPage: 1,
      })
    })

    it('should format post data correctly', async () => {
      const author = createMockAuthor({
        uid: 'john-doe',
        name: 'John Doe',
        bio: 'A great author',
      })

      const category = createMockCategory({
        uid: 'tech',
        title: 'Technology',
        description: 'Tech posts',
      })

      const post = createMockPost({
        id: '1',
        title: 'Test Post',
        excerpt: 'This is a test',
        author,
        category,
        tags: ['javascript', 'react'],
        publishedAt: '2024-01-15',
      })

      const mockClient = mockPrismicClient()
      mockClient.getAllByType.mockResolvedValue([post])
      ;(createClient as jest.Mock).mockReturnValue(mockClient)

      const request = createMockRequest({
        method: 'GET',
      })

      const response = await GET(request)
      const json = await response.json()

      expect(json.posts[0]).toMatchObject({
        id: '1',
        title: 'Test Post',
        slug: expect.any(String),
        excerpt: 'This is a test',
        author: {
          uid: 'john-doe',
          name: 'John Doe',
          slug: 'john-doe',
          picture: expect.any(Object),
        },
        category: {
          uid: 'tech',
          title: 'Technology',
          slug: 'tech',
        },
        tags: ['javascript', 'react'],
        publishedAt: '2024-01-15',
        readingTime: expect.any(Number),
        featuredImage: expect.any(Object),
      })
    })
  })
})
