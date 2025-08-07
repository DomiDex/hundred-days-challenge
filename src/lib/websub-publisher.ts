export async function notifyHub(feedUrl: string) {
  const hubUrl = 'https://pubsubhubbub.appspot.com/'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

  try {
    const fullFeedUrl = feedUrl.startsWith('http') ? feedUrl : `${siteUrl}${feedUrl}`

    const response = await fetch(hubUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'hub.mode': 'publish',
        'hub.url': fullFeedUrl,
      }),
    })

    if (response.ok) {
      console.log('Successfully notified WebSub hub for:', fullFeedUrl)
    } else {
      console.error('WebSub hub notification failed:', response.status, await response.text())
    }
  } catch (error) {
    console.error('Failed to notify WebSub hub:', error)
  }
}

// Helper to notify all feed formats
export async function notifyAllFeeds() {
  const feeds = ['/rss.xml', '/atom.xml', '/feed.json']

  await Promise.all(feeds.map((feed) => notifyHub(feed)))
}
