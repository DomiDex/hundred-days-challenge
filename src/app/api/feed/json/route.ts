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
    await FeedAnalytics.trackFeedAccess(request, 'json')

    // Get cached feeds
    const { json } = await getCachedFeeds()
    const lastModified = await getFeedLastModified()

    // Handle conditional GET
    const conditionalResponse = handleConditionalGet(request, json, lastModified)
    if (conditionalResponse) {
      return conditionalResponse
    }

    // Create response with CORS headers for JSON feeds
    const response = createFeedResponse(json, 'application/feed+json', lastModified)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET')

    return response
  } catch (error) {
    console.error('Error generating JSON feed:', error)
    return new Response('Error generating feed', { status: 500 })
  }
}
