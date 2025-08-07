import { describe, it, expect, jest, afterEach } from '@jest/globals'
import { notifyWebSubHub, testWebSubHub } from '@/lib/websub-notifier'

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>

describe('WebSub Notifier', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('notifyWebSubHub', () => {
    it('should send notification to hub successfully', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce(new Response('', { status: 204 }))

      const feedUrls = ['https://example.com/rss.xml']
      const results = await notifyWebSubHub(feedUrls)

      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        feedUrl: 'https://example.com/rss.xml',
        success: true,
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('pubsubhubbub.appspot.com'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: expect.stringContaining('hub.mode=publish'),
        })
      )
    })

    it('should handle hub notification failure', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce(new Response('Server Error', { status: 500 }))

      const feedUrls = ['https://example.com/rss.xml']
      const results = await notifyWebSubHub(feedUrls)

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(false)
      expect(results[0].error).toContain('HTTP 500')
    })

    it('should handle network errors', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const feedUrls = ['https://example.com/rss.xml']
      const results = await notifyWebSubHub(feedUrls)

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(false)
      expect(results[0].error).toBe('Network error')
    })

    it('should notify multiple feeds', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch
        .mockResolvedValueOnce(new Response('', { status: 204 }))
        .mockResolvedValueOnce(new Response('', { status: 204 }))

      const feedUrls = ['https://example.com/rss.xml', 'https://example.com/atom.xml']
      const results = await notifyWebSubHub(feedUrls)

      expect(results).toHaveLength(2)
      expect(results.every((r) => r.success)).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('testWebSubHub', () => {
    it('should return true when hub is accessible', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce(new Response('', { status: 200 }))

      const result = await testWebSubHub()

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('pubsubhubbub.appspot.com'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'User-Agent': '100DaysOfCraft/1.0',
          },
        })
      )
    })

    it('should return false when hub is not accessible', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce(new Response('', { status: 503 }))

      const result = await testWebSubHub()

      expect(result).toBe(false) // 503 response means hub is not ok
    })

    it('should return false on network error', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await testWebSubHub()

      expect(result).toBe(false)
    })
  })
})
