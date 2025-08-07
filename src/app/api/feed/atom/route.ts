import { FeedAnalytics } from '@/lib/feed-analytics'
import {
  getCachedFeeds,
  handleConditionalGet,
  createFeedResponse,
  getFeedLastModified,
} from '@/lib/feed-cache'

export const revalidate = 3600

export async function GET(request: Request) {
  try {
    // Track feed access
    await FeedAnalytics.trackFeedAccess(request, 'atom')

    // Get cached feeds
    const { atom } = await getCachedFeeds()
    const lastModified = await getFeedLastModified()

    // Handle conditional GET
    const conditionalResponse = handleConditionalGet(request, atom, lastModified)
    if (conditionalResponse) {
      return conditionalResponse
    }

    // Return full response
    return createFeedResponse(atom, 'application/atom+xml', lastModified)
  } catch (error) {
    console.error('Error generating Atom feed:', error)
    return new Response('Error generating feed', { status: 500 })
  }
}
