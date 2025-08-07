/**
 * WebSub (PubSubHubbub) notification system for real-time feed updates
 */

interface WebSubNotificationResult {
  feedUrl: string
  success: boolean
  error?: string
}

export async function notifyWebSubHub(feedUrls: string[]): Promise<WebSubNotificationResult[]> {
  const hubUrl = process.env.WEBSUB_HUB_URL || 'https://pubsubhubbub.appspot.com/'

  const notifications = feedUrls.map(async (feedUrl) => {
    const params = new URLSearchParams({
      'hub.mode': 'publish',
      'hub.url': feedUrl,
    })

    try {
      const response = await fetch(hubUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`WebSub notification failed for ${feedUrl}:`, response.status, errorText)
        return { feedUrl, success: false, error: `HTTP ${response.status}: ${errorText}` }
      }

      console.log(`WebSub notification sent successfully for ${feedUrl}`)
      return { feedUrl, success: true }
    } catch (error) {
      console.error(`WebSub notification error for ${feedUrl}:`, error)
      return {
        feedUrl,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  return Promise.all(notifications)
}

/**
 * Notify all feed formats when content is published
 */
export async function onContentPublished(): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

  const feeds = [`${siteUrl}/rss.xml`, `${siteUrl}/atom.xml`, `${siteUrl}/feed.json`]

  const results = await notifyWebSubHub(feeds)

  // Log results for monitoring
  results.forEach((result) => {
    if (!result.success) {
      console.error(`Failed to notify hub for ${result.feedUrl}:`, result.error)
    }
  })
}

/**
 * Notify hub for a specific category feed
 */
export async function onCategoryContentPublished(categorySlug: string): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'
  const feedUrl = `${siteUrl}/feeds/category/${categorySlug}.xml`

  const results = await notifyWebSubHub([feedUrl])

  if (!results[0].success) {
    console.error(`Failed to notify hub for category ${categorySlug}:`, results[0].error)
  }
}

/**
 * Batch notify multiple category feeds
 */
export async function notifyCategoryFeeds(categorySlugs: string[]): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

  const feedUrls = categorySlugs.map((slug) => `${siteUrl}/feeds/category/${slug}.xml`)

  await notifyWebSubHub(feedUrls)
}

/**
 * Test WebSub hub connectivity
 */
export async function testWebSubHub(): Promise<boolean> {
  const hubUrl = process.env.WEBSUB_HUB_URL || 'https://pubsubhubbub.appspot.com/'

  try {
    // Send a test request to the hub
    const response = await fetch(hubUrl, {
      method: 'GET',
      headers: {
        'User-Agent': '100DaysOfCraft/1.0',
      },
    })

    return response.ok
  } catch (error) {
    console.error('WebSub hub test failed:', error)
    return false
  }
}
