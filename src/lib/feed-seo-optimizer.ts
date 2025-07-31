import { Feed } from 'feed'
import type { Item } from 'feed'

interface FeedSEOOptions {
  enableWebSub?: boolean
  enableMediaRSS?: boolean
  enableITunes?: boolean
  enableDublinCore?: boolean
  earlyAccessHours?: number
}

export function optimizeFeedForSEO(feed: Feed, options: FeedSEOOptions = {}) {
  const { enableWebSub = true } = options

  // Add WebSub hub for real-time updates
  if (enableWebSub) {
    feed.options.hub = 'https://pubsubhubbub.appspot.com/'
  }

  // Add additional feed metadata for better discovery
  feed.options.docs = 'https://www.rssboard.org/rss-specification'
  feed.options.ttl = 60 // Suggest clients check every 60 minutes

  return feed
}

export function optimizeFeedItem(
  item: Partial<Item>,
  options: {
    fullContent: string
    imageUrl?: string
    authorName?: string
    categories?: string[]
    commentCount?: number
    canonicalUrl: string
    earlyAccess?: boolean
    earlyAccessHours?: number
  }
): Partial<Item> {
  const optimizedItem: Partial<Item> = {
    ...item,
    // Ensure unique, permanent GUID
    guid: item.guid || options.canonicalUrl,
    // Add both description (excerpt) and content (full)
    description: item.description,
    content: options.fullContent,
  }

  // Add early access notification for RSS subscribers
  if (options.earlyAccess && options.earlyAccessHours) {
    optimizedItem.content = `
      <div style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
        <strong>🎯 RSS Exclusive:</strong> You're reading this ${options.earlyAccessHours} hours 
        before it's published on the website. Thank you for being a feed subscriber!
      </div>
      ${options.fullContent}
    `
  }

  // Add media content if image is available
  if (options.imageUrl) {
    optimizedItem.image = options.imageUrl
    optimizedItem.enclosure = {
      url: options.imageUrl,
      type: 'image/jpeg',
    }
  }

  // Add enhanced category data
  if (options.categories && options.categories.length > 0) {
    optimizedItem.category = options.categories.map((cat) => ({
      name: cat,
      domain: `${process.env.NEXT_PUBLIC_SITE_URL}/categories`,
    }))
  }

  // Add extended metadata
  const extensions: Array<{
    name: string
    value?: string
    objects: Record<string, unknown>
  }> = []

  // Dublin Core metadata
  if (options.authorName) {
    extensions.push({
      name: 'dc:creator',
      value: options.authorName,
      objects: {},
    })
  }

  if (options.categories) {
    extensions.push({
      name: 'dc:subject',
      value: options.categories.join(', '),
      objects: {},
    })
  }

  // iTunes extensions (some readers support these)
  if (options.authorName) {
    extensions.push({
      name: 'itunes:author',
      value: options.authorName,
      objects: {},
    })
  }

  extensions.push({
    name: 'itunes:explicit',
    value: 'no',
    objects: {},
  })

  if (item.description) {
    extensions.push({
      name: 'itunes:summary',
      value: item.description,
      objects: {},
    })
  }

  // Atom threading for comment count
  if (options.commentCount !== undefined) {
    extensions.push({
      name: 'thr:total',
      value: options.commentCount.toString(),
      objects: {},
    })
  }

  if (extensions.length > 0) {
    optimizedItem.extensions = extensions
  }

  return optimizedItem
}

export function generateFeedStructuredData(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: '100 Days of Craft',
        url: siteUrl,
        potentialAction: {
          '@type': 'SubscribeAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/rss.xml`,
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform',
            ],
          },
          object: {
            '@type': 'DataFeed',
            name: 'RSS Feed',
            description: 'Latest posts from 100 Days of Craft',
            dataFeedElement: [
              {
                '@type': 'DataFeedItem',
                name: 'RSS 2.0 Feed',
                url: `${siteUrl}/rss.xml`,
                encodingFormat: 'application/rss+xml',
              },
              {
                '@type': 'DataFeedItem',
                name: 'Atom 1.0 Feed',
                url: `${siteUrl}/atom.xml`,
                encodingFormat: 'application/atom+xml',
              },
              {
                '@type': 'DataFeedItem',
                name: 'JSON Feed 1.1',
                url: `${siteUrl}/feed.json`,
                encodingFormat: 'application/feed+json',
              },
            ],
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Subscribe',
            item: `${siteUrl}/subscribe`,
          },
        ],
      },
    ],
  }
}
