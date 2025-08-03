import { generateSEOMetadata } from '@/components/SEO'
import { isFilled } from '@prismicio/client'
import { createMockImageField } from '@/test-utils/mock-factories'

// Mock Prismic client
jest.mock('@prismicio/client', () => ({
  isFilled: {
    image: jest.fn((field) => field && field.url),
  },
}))

// Type guards for metadata assertions
interface OpenGraphWithType {
  type?: string
  [key: string]: unknown
}

interface TwitterWithCard {
  card?: string
  [key: string]: unknown
}

describe('generateSEOMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('generates metadata with default values', () => {
    const metadata = generateSEOMetadata({ data: {} })

    expect(metadata.title).toBe('A daily Next.js coding challenge | A dayly Next.js')
    expect(metadata.description).toBe(
      'Practicing Next.js by building a daily coding challenge project every day for 100 days.'
    )
    expect(metadata.robots).toBe('index,follow')
    expect((metadata.openGraph as OpenGraphWithType)?.type).toBe('website')
    expect((metadata.twitter as TwitterWithCard)?.card).toBe('summary_large_image')
  })

  it('uses custom meta title and description', () => {
    const data = {
      meta_title: 'Custom Title',
      meta_description: 'Custom Description',
    }
    const metadata = generateSEOMetadata({ data })

    expect(metadata.title).toBe('Custom Title')
    expect(metadata.description).toBe('Custom Description')
  })

  it('uses fallback values when provided', () => {
    const metadata = generateSEOMetadata({
      data: {},
      fallbackTitle: 'Fallback Title',
      fallbackDescription: 'Fallback Description',
    })

    expect(metadata.title).toBe('Fallback Title')
    expect(metadata.description).toBe('Fallback Description')
  })

  it('generates OpenGraph metadata correctly', () => {
    const data = {
      og_title: 'OG Title',
      og_description: 'OG Description',
      og_image: createMockImageField({
        id: 'test-image',
        url: 'https://example.com/image.jpg',
        alt: 'Image Alt',
        dimensions: { width: 1200, height: 630 },
      }),
    }
    const metadata = generateSEOMetadata({ data })

    expect(metadata.openGraph?.title).toBe('OG Title')
    expect(metadata.openGraph?.description).toBe('OG Description')
    expect(metadata.openGraph?.images).toEqual([
      {
        url: 'https://example.com/image.jpg',
        width: 1200,
        height: 630,
        alt: 'Image Alt',
      },
    ])
  })

  it('falls back to meta title/description for OpenGraph', () => {
    const data = {
      meta_title: 'Meta Title',
      meta_description: 'Meta Description',
    }
    const metadata = generateSEOMetadata({ data })

    expect(metadata.openGraph?.title).toBe('Meta Title')
    expect(metadata.openGraph?.description).toBe('Meta Description')
  })

  it('generates Twitter card metadata', () => {
    const data = {
      twitter_card: 'summary' as const,
      og_title: 'Twitter Title',
      og_description: 'Twitter Description',
      og_image: createMockImageField({
        id: 'test-twitter-image',
        url: 'https://example.com/twitter.jpg',
        alt: 'Twitter Image',
        dimensions: { width: 800, height: 400 },
      }),
    }
    const metadata = generateSEOMetadata({ data })

    expect((metadata.twitter as TwitterWithCard)?.card).toBe('summary')
    expect(metadata.twitter?.title).toBe('Twitter Title')
    expect(metadata.twitter?.description).toBe('Twitter Description')
    expect(metadata.twitter?.images).toEqual(['https://example.com/twitter.jpg'])
  })

  it('handles article-specific metadata', () => {
    const data = {
      og_type: 'article' as const,
      article_author: 'John Doe',
    }
    const metadata = generateSEOMetadata({
      data,
      publishedTime: '2024-01-01T00:00:00Z',
      modifiedTime: '2024-01-02T00:00:00Z',
    })

    expect((metadata.openGraph as OpenGraphWithType)?.type).toBe('article')
    const openGraph = metadata.openGraph as {
      authors?: string[]
      publishedTime?: string
      modifiedTime?: string
    }
    expect(openGraph?.authors).toEqual(['John Doe'])
    expect(openGraph?.publishedTime).toBe('2024-01-01T00:00:00Z')
    expect(openGraph?.modifiedTime).toBe('2024-01-02T00:00:00Z')
  })

  it('sets canonical URL correctly', () => {
    const data = {
      canonical_url: 'https://example.com/page',
    }
    const metadata = generateSEOMetadata({ data })

    expect(metadata.alternates?.canonical).toBe('https://example.com/page')
    expect(metadata.openGraph?.url).toBe('https://example.com/page')
  })

  it('uses fallback URL when canonical_url is not provided', () => {
    const metadata = generateSEOMetadata({
      data: {},
      url: 'https://example.com/fallback',
    })

    expect(metadata.alternates?.canonical).toBe('https://example.com/fallback')
    expect(metadata.openGraph?.url).toBe('https://example.com/fallback')
  })

  it('handles missing image gracefully', () => {
    const data = {
      og_image: null,
    }
    const metadata = generateSEOMetadata({ data })

    expect(metadata.openGraph?.images).toBeUndefined()
    expect(metadata.twitter?.images).toBeUndefined()
  })

  it('handles invalid image data', () => {
    ;(isFilled.image as jest.MockedFunction<typeof isFilled.image>).mockReturnValue(false)

    const data = {
      og_image: createMockImageField({ url: '', alt: '' }),
    }
    const metadata = generateSEOMetadata({ data })

    expect(metadata.openGraph?.images).toBeUndefined()
    expect(metadata.twitter?.images).toBeUndefined()
  })

  it('includes keywords when provided', () => {
    const data = {
      keywords: 'nextjs, react, blog',
    }
    const metadata = generateSEOMetadata({ data })

    expect(metadata.keywords).toBe('nextjs, react, blog')
  })

  it('sets custom robots directive', () => {
    const data = {
      robots: 'noindex,nofollow',
    }
    const metadata = generateSEOMetadata({ data })

    expect(metadata.robots).toBe('noindex,nofollow')
  })

  it('uses custom site name', () => {
    const metadata = generateSEOMetadata({
      data: {},
      siteName: 'Custom Site Name',
    })

    expect(metadata.openGraph?.siteName).toBe('Custom Site Name')
  })

  it('sets locale correctly', () => {
    const metadata = generateSEOMetadata({ data: {} })

    expect(metadata.openGraph?.locale).toBe('en_US')
  })

  it('handles null values correctly', () => {
    const data = {
      meta_title: null,
      meta_description: null,
      og_title: null,
      og_description: null,
      twitter_card: null,
      canonical_url: null,
      robots: null,
      keywords: null,
      article_author: null,
      og_type: null,
    }
    const metadata = generateSEOMetadata({ data })

    expect(metadata.title).toBe('A daily Next.js coding challenge | A dayly Next.js')
    expect(metadata.description).toBe(
      'Practicing Next.js by building a daily coding challenge project every day for 100 days.'
    )
    expect(metadata.robots).toBe('index,follow')
    expect((metadata.openGraph as OpenGraphWithType)?.type).toBe('website')
    expect((metadata.twitter as TwitterWithCard)?.card).toBe('summary_large_image')
  })
})
