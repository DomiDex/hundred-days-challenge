import { FeedAnalytics } from '@/lib/feed-analytics'
import {
  getCachedFeeds,
  handleConditionalGet,
  createFeedResponse,
  getFeedLastModified,
} from '@/lib/feed-cache'

export const revalidate = 3600 // Revalidate every hour

export async function GET(request: Request) {
  try {
    // Track feed access
    await FeedAnalytics.trackFeedAccess(request, 'rss')

    // Get cached feeds
    const { rss } = await getCachedFeeds()
    const lastModified = await getFeedLastModified()

    // Handle conditional GET
    const conditionalResponse = handleConditionalGet(request, rss, lastModified)
    if (conditionalResponse) {
      return conditionalResponse
    }

    // Return full response
    return createFeedResponse(rss, 'application/rss+xml', lastModified)
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating feed', { status: 500 })
  }
}
