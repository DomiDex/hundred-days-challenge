# Task 25: RSS Technical Optimization - WebSub & Autodiscovery

## Overview

Implement advanced RSS technical optimizations including WebSub (PubSubHubbub) for real-time push notifications, enhanced autodiscovery, and browser integration improvements. These optimizations will significantly improve feed performance and discoverability.

## Prerequisites

- RSS, Atom, and JSON feeds already implemented
- Next.js 15 app with API routes
- Basic RSS feeds functional at /rss.xml, /atom.xml, /feed.json

## Goals

- Enable real-time push notifications via WebSub
- Implement comprehensive RSS autodiscovery
- Optimize feed performance and caching
- Add browser and app integration features
- Ensure maximum compatibility with feed readers

## Implementation Steps

### Phase 1: WebSub (PubSubHubbub) Implementation

#### 1.1 Add WebSub Hub Declaration

Update all feed routes to include WebSub hub links:

```typescript
// src/app/api/feed/rss/route.ts
import { Feed } from 'feed'

export async function GET() {
  const feed = new Feed({
    // ... existing feed config
    hub: 'https://pubsubhubbub.appspot.com/', // Google's public hub
    // Alternative hubs:
    // hub: 'https://pubsubhubbub.superfeedr.com/',
    // hub: 'https://websubhub.com/',
  })

  // Ensure hub link is added to RSS output
  const rss = feed.rss2()

  // Manually inject hub link if feed library doesn't support it
  const rssWithHub = rss.replace(
    '</channel>',
    '<atom:link rel="hub" href="https://pubsubhubbub.appspot.com/" xmlns:atom="http://www.w3.org/2005/Atom"/>\n</channel>'
  )

  return new Response(rssWithHub, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

#### 1.2 Implement Hub Notification System

Create a webhook to notify hub when content is published:

```typescript
// src/lib/websub-notifier.ts
export async function notifyWebSubHub(feedUrls: string[]) {
  const hubUrl = 'https://pubsubhubbub.appspot.com/'

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
        console.error(`WebSub notification failed for ${feedUrl}:`, response.status)
      }

      return { feedUrl, success: response.ok }
    } catch (error) {
      console.error(`WebSub notification error for ${feedUrl}:`, error)
      return { feedUrl, success: false }
    }
  })

  return Promise.all(notifications)
}

// Hook into Prismic webhook or content update
export async function onContentPublished() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

  const feeds = [`${siteUrl}/rss.xml`, `${siteUrl}/atom.xml`, `${siteUrl}/feed.json`]

  await notifyWebSubHub(feeds)
}
```

#### 1.3 Add WebSub Subscription Endpoint (Optional)

For receiving WebSub notifications:

```typescript
// src/app/api/websub/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const challenge = searchParams.get('hub.challenge')

  // Verify subscription request
  if (mode === 'subscribe' || mode === 'unsubscribe') {
    // Validate the request (implement your validation logic)
    return new Response(challenge, { status: 200 })
  }

  return new Response('Invalid request', { status: 400 })
}

export async function POST(request: Request) {
  // Handle incoming WebSub notifications
  const body = await request.text()

  // Process the feed update notification
  console.log('Received WebSub notification:', body)

  return new Response('OK', { status: 200 })
}
```

### Phase 2: Enhanced RSS Autodiscovery

#### 2.1 Update Layout with Comprehensive Autodiscovery

```typescript
// src/app/layout.tsx
export default function RootLayout() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

  return (
    <html>
      <head>
        {/* RSS Autodiscovery Links */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="100 Days of Craft - RSS Feed"
          href={`${siteUrl}/rss.xml`}
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          title="100 Days of Craft - Atom Feed"
          href={`${siteUrl}/atom.xml`}
        />
        <link
          rel="alternate"
          type="application/feed+json"
          title="100 Days of Craft - JSON Feed"
          href={`${siteUrl}/feed.json`}
        />

        {/* OpenSearch for feed discovery */}
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title="100 Days of Craft"
          href="/opensearch.xml"
        />

        {/* Additional metadata for feed readers */}
        <meta name="feed:rss" content={`${siteUrl}/rss.xml`} />
        <meta name="feed:atom" content={`${siteUrl}/atom.xml`} />
        <meta name="feed:json" content={`${siteUrl}/feed.json`} />
      </head>
    </html>
  )
}
```

#### 2.2 Create OpenSearch Description

```typescript
// src/app/opensearch.xml/route.ts
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

  const opensearch = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>100 Days of Craft</ShortName>
  <Description>Search 100 Days of Craft blog posts</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/x-icon">${siteUrl}/favicon.ico</Image>
  <Url type="text/html" template="${siteUrl}/search?q={searchTerms}"/>
  <Url type="application/rss+xml" 
       rel="results" 
       template="${siteUrl}/rss.xml"/>
  <moz:SearchForm>${siteUrl}/search</moz:SearchForm>
</OpenSearchDescription>`

  return new Response(opensearch, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml',
    },
  })
}
```

### Phase 3: Feed Performance Optimization

#### 3.1 Implement Conditional GET Support

```typescript
// src/lib/feed-utils.ts
import { createHash } from 'crypto'

export function generateETag(content: string): string {
  return `"${createHash('md5').update(content).digest('hex')}"`
}

export function handleConditionalGet(
  request: Request,
  content: string,
  lastModified: Date
): Response | null {
  const etag = generateETag(content)
  const ifNoneMatch = request.headers.get('if-none-match')
  const ifModifiedSince = request.headers.get('if-modified-since')

  // Check ETag
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new Response(null, { status: 304 })
  }

  // Check Last-Modified
  if (ifModifiedSince) {
    const clientDate = new Date(ifModifiedSince)
    if (lastModified <= clientDate) {
      return new Response(null, { status: 304 })
    }
  }

  return null
}

// Update feed routes
export async function GET(request: Request) {
  const feed = await generateFeed()
  const content = feed.rss2()
  const lastModified = await getLastPostDate()

  // Handle conditional requests
  const conditionalResponse = handleConditionalGet(request, content, lastModified)
  if (conditionalResponse) return conditionalResponse

  return new Response(content, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      ETag: generateETag(content),
      'Last-Modified': lastModified.toUTCString(),
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  })
}
```

#### 3.2 Add Feed Compression

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if this is a feed request
  if (request.nextUrl.pathname.match(/\/(rss|atom|feed)\.xml|feed\.json/)) {
    const response = NextResponse.next()

    // Add compression hint
    response.headers.set('Content-Encoding', 'gzip')
    response.headers.set('Vary', 'Accept-Encoding')

    return response
  }
}

export const config = {
  matcher: ['/rss.xml', '/atom.xml', '/feed.json', '/feeds/:path*'],
}
```

### Phase 4: Enhanced Feed Features

#### 4.1 Add Media Enclosures

```typescript
// src/lib/feed-generator.ts
export async function generateEnhancedFeed(posts: Post[]) {
  const feed = new Feed({
    // ... base config
  })

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      description: post.excerpt,
      content: post.content,
      date: new Date(post.publishedAt),
      link: post.url,
      guid: post.id,

      // Add media enclosures for featured images
      enclosure: post.featuredImage
        ? {
            url: post.featuredImage.url,
            type: 'image/jpeg',
            length: post.featuredImage.size || 0,
          }
        : undefined,

      // Add custom fields
      custom: [
        {
          'content:encoded': {
            _cdata: post.htmlContent,
          },
        },
        {
          'reading-time': post.readingTime,
        },
        {
          'word-count': post.wordCount,
        },
      ],
    })
  })

  return feed
}
```

#### 4.2 Implement Feed Pagination

```typescript
// src/app/api/feed/rss/[page]/route.ts
export async function GET(request: Request, { params }: { params: { page: string } }) {
  const page = parseInt(params.page) || 1
  const limit = 20
  const offset = (page - 1) * limit

  const { posts, total } = await getPaginatedPosts(offset, limit)
  const totalPages = Math.ceil(total / limit)

  const feed = new Feed({
    // ... config
    link: `${siteUrl}/rss/${page}.xml`,
  })

  // Add pagination links
  if (page > 1) {
    feed.addContributor({
      name: 'prev',
      link: `${siteUrl}/rss/${page - 1}.xml`,
    })
  }

  if (page < totalPages) {
    feed.addContributor({
      name: 'next',
      link: `${siteUrl}/rss/${page + 1}.xml`,
    })
  }

  // Add posts
  posts.forEach((post) => feed.addItem(formatPost(post)))

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml',
    },
  })
}
```

### Phase 5: Browser Extension Support

#### 5.1 Create Browser Extension Manifest

```json
// browser-extension/manifest.json
{
  "manifest_version": 3,
  "name": "100 Days of Craft RSS Helper",
  "version": "1.0.0",
  "description": "Easily subscribe to 100 Days of Craft RSS feeds",
  "permissions": ["activeTab"],
  "content_scripts": [
    {
      "matches": ["*://100daysofcraft.com/*"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  }
}
```

#### 5.2 Add Feed Detection API

```typescript
// src/app/api/feed-detection/route.ts
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

  const feeds = {
    feeds: [
      {
        title: 'All Posts (RSS)',
        url: `${siteUrl}/rss.xml`,
        type: 'application/rss+xml',
      },
      {
        title: 'All Posts (Atom)',
        url: `${siteUrl}/atom.xml`,
        type: 'application/atom+xml',
      },
      {
        title: 'All Posts (JSON)',
        url: `${siteUrl}/feed.json`,
        type: 'application/feed+json',
      },
    ],
    categories: await getCategoryFeeds(),
  }

  return Response.json(feeds)
}
```

### Phase 6: Feed Validation & Testing

#### 6.1 Automated Feed Validation

```typescript
// src/__tests__/feed-validation.test.ts
import { validateRSS, validateAtom, validateJSON } from '@/lib/feed-validators'

describe('Feed Validation', () => {
  it('should generate valid RSS 2.0 feed', async () => {
    const response = await fetch('/rss.xml')
    const content = await response.text()

    const validation = await validateRSS(content)
    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('should include WebSub hub link', async () => {
    const response = await fetch('/rss.xml')
    const content = await response.text()

    expect(content).toContain('rel="hub"')
    expect(content).toContain('pubsubhubbub.appspot.com')
  })

  it('should handle conditional GET requests', async () => {
    const response1 = await fetch('/rss.xml')
    const etag = response1.headers.get('etag')

    const response2 = await fetch('/rss.xml', {
      headers: { 'if-none-match': etag! },
    })

    expect(response2.status).toBe(304)
  })
})
```

### Phase 7: Monitoring & Debugging

#### 7.1 Feed Health Dashboard

```typescript
// src/app/api/admin/feed-health/route.ts
export async function GET() {
  const health = {
    feeds: await checkFeedHealth(),
    websubStatus: await checkWebSubStatus(),
    lastUpdate: await getLastFeedUpdate(),
    subscriberEstimate: await estimateSubscribers(),
    validationStatus: await validateAllFeeds(),
  }

  return Response.json(health)
}

async function checkFeedHealth() {
  const feeds = ['/rss.xml', '/atom.xml', '/feed.json']

  return Promise.all(
    feeds.map(async (feed) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}${feed}`)
        return {
          feed,
          status: response.status,
          contentType: response.headers.get('content-type'),
          size: response.headers.get('content-length'),
          cached: response.headers.get('x-cache') === 'HIT',
        }
      } catch (error) {
        return { feed, error: error.message }
      }
    })
  )
}
```

## Performance Optimizations

### Caching Strategy

```typescript
// src/lib/feed-cache.ts
import { unstable_cache } from 'next/cache'

export const getCachedFeed = unstable_cache(
  async (feedType: string) => {
    return generateFeed(feedType)
  },
  ['feed'],
  {
    revalidate: 3600, // 1 hour
    tags: ['feed', 'posts'],
  }
)
```

### CDN Configuration

```nginx
# Example Nginx configuration
location ~* \.(xml|json)$ {
    add_header Cache-Control "public, max-age=3600";
    add_header X-Content-Type-Options "nosniff";
    gzip on;
    gzip_types application/xml application/json application/rss+xml application/atom+xml;
}
```

## Success Metrics

- WebSub notifications sent successfully
- Feed response time < 200ms
- 304 Not Modified responses > 50%
- Feed validation passing 100%
- Browser extension adoption rate

## Dependencies

- `feed` npm package with WebSub support
- Feed validation libraries
- Compression middleware
- Cache infrastructure

## Testing Checklist

- [ ] WebSub hub notifications working
- [ ] Autodiscovery detected by browsers/extensions
- [ ] Conditional GET returns 304 properly
- [ ] Feeds validate against W3C validators
- [ ] Compression enabled and working
- [ ] Cache headers set correctly
- [ ] Media enclosures display properly
- [ ] Feed pagination works
- [ ] All feed formats include hub links

## Resources

- [WebSub W3C Spec](https://www.w3.org/TR/websub/)
- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [Atom Syndication Format](https://tools.ietf.org/html/rfc4287)
- [JSON Feed Version 1.1](https://www.jsonfeed.org/version/1.1/)
- [Feed Validator](https://validator.w3.org/feed/)
