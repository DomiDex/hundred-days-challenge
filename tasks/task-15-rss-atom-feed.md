# Task 15: Implement RSS/Atom Feed with SEO Best Practices

## Priority: Medium

## Description

Create comprehensive RSS, Atom, and JSON feed implementations for the blog following W3C WebSub and Google's syndication best practices, enabling users to subscribe to content updates through their preferred feed readers while maximizing content discoverability.

## Dependencies

- Prismic CMS integration (must be working)
- Blog functionality (posts, categories, authors)
- Valid sitemap.xml (for cross-referencing)
- Canonical URLs properly configured

## Implementation Steps

### 1. **Install Required Packages**

```bash
npm install feed
npm install --save-dev @types/feed
# For WebSub support (optional but recommended)
npm install crypto
```

### 2. **Create Feed Generation Utility**

- Create `src/lib/feed-generator.ts`:

```typescript
import { Feed } from 'feed'
import { createClient } from '@/prismicio'
import type { PostDocument } from '@/prismicio-types'
import { extractCategoryData } from '@/lib/prismic-utils'

export async function generateFeeds() {
  const client = createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'

  // Create feed instance with SEO best practices
  const feed = new Feed({
    title: '100 Days of Craft',
    description: 'A journey through web development, design, and digital craftsmanship',
    id: siteUrl,
    link: siteUrl,
    language: 'en',
    image: `${siteUrl}/images/logo.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, 100 Days of Craft`,
    updated: new Date(),
    generator: 'Next.js 15',
    feedLinks: {
      rss: `${siteUrl}/rss.xml`,
      atom: `${siteUrl}/atom.xml`,
      json: `${siteUrl}/feed.json`,
    },
    author: {
      name: '100 Days of Craft Team',
      email: 'hello@yourdomain.com',
      link: siteUrl,
    },
    // WebSub hub for real-time updates
    hub: 'https://pubsubhubbub.appspot.com/',
    // Additional metadata for better discovery
    ttl: 60, // Time to live in minutes
    docs: 'https://www.rssboard.org/rss-specification',
  })

  // Fetch all posts
  const posts = await client.getAllByType('post', {
    orderings: [
      { field: 'my.post.publication_date', direction: 'desc' },
      { field: 'document.first_publication_date', direction: 'desc' },
    ],
    fetchLinks: ['category.name', 'category.uid', 'author.name'],
    pageSize: 50, // Limit feed size
  })

  // Add posts to feed with SEO-optimized content
  for (const post of posts) {
    const categoryData = extractCategoryData(post)
    const postUrl = `${siteUrl}/blog/${categoryData?.uid || 'uncategorized'}/${post.uid}`
    const publicationDate = new Date(post.data.publication_date || post.first_publication_date)
    const lastModified = new Date(post.last_publication_date || publicationDate)

    // Extract full content or use excerpt with proper HTML
    const fullContent = await extractFullContent(post) // Helper to extract rich text content
    const excerpt = post.data.excerpt || generateExcerpt(fullContent, 160)

    feed.addItem({
      title: post.data.name || 'Untitled',
      id: postUrl, // Must be unique and permanent
      link: postUrl,
      guid: postUrl, // Explicit GUID for RSS
      description: excerpt, // Plain text excerpt for compatibility
      content: fullContent, // Full HTML content for readers that support it
      author: [
        {
          name: post.data.author?.data?.name || 'Anonymous',
          email: 'noreply@yourdomain.com', // Privacy-safe email
          link: post.data.author?.uid ? `${siteUrl}/authors/${post.data.author.uid}` : undefined,
        },
      ],
      date: publicationDate,
      published: publicationDate, // Explicit publication date
      updated: lastModified, // Important for update detection
      category: categoryData
        ? [
            {
              name: categoryData.name,
              term: categoryData.uid,
              scheme: `${siteUrl}/categories`, // Category taxonomy URL
              label: categoryData.name,
            },
          ]
        : undefined,
      image: post.data.image?.url ? {
        url: post.data.image.url,
        title: post.data.image.alt || post.data.name,
        link: postUrl,
      } : undefined,
      // Additional SEO fields
      extensions: [
        {
          name: '_prismic',
          objects: {
            id: post.id,
            type: post.type,
            tags: post.tags,
          },
        },
      ],
    })
  }

  return {
    rss: feed.rss2(),
    atom: feed.atom1(),
    json: feed.json1(),
  }
}

// Helper functions for content extraction
async function extractFullContent(post: PostDocument): Promise<string> {
  // Convert Prismic rich text to HTML
  // Include proper image URLs and formatting
  // Ensure all links are absolute
  return ''
}

function generateExcerpt(content: string, maxLength: number): string {
  // Strip HTML tags and create clean excerpt
  const text = content.replace(/<[^>]*>/g, '')
  return text.length > maxLength 
    ? text.substring(0, maxLength).trim() + '...'
    : text
}
```

### 3. **Create Feed API Routes**

- Create `src/app/api/feed/rss/route.ts`:

```typescript
import { generateFeeds } from '@/lib/feed-generator'

export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  try {
    const { rss } = await generateFeeds()

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
        // SEO best practices headers
        'X-Robots-Tag': 'noindex', // Prevent feed URLs from appearing in search results
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${generateETag(rss)}"`, // For efficient caching
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating feed', { status: 500 })
  }
}
```

- Create `src/app/api/feed/atom/route.ts`:

```typescript
import { generateFeeds } from '@/lib/feed-generator'

export const revalidate = 3600

export async function GET() {
  try {
    const { atom } = await generateFeeds()

    return new Response(atom, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
        'X-Robots-Tag': 'noindex',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${generateETag(atom)}"`,
      },
    })
  } catch (error) {
    console.error('Error generating Atom feed:', error)
    return new Response('Error generating feed', { status: 500 })
  }
}
```

- Create `src/app/api/feed/json/route.ts`:

```typescript
import { generateFeeds } from '@/lib/feed-generator'

export const revalidate = 3600

export async function GET() {
  try {
    const { json } = await generateFeeds()

    return new Response(json, {
      headers: {
        'Content-Type': 'application/feed+json; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
        'X-Robots-Tag': 'noindex',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${generateETag(json)}"`,
        // CORS headers for JSON feeds
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    })
  } catch (error) {
    console.error('Error generating JSON feed:', error)
    return new Response('Error generating feed', { status: 500 })
  }
}

// Helper function for ETag generation
function generateETag(content: string): string {
  const crypto = require('crypto')
  return crypto.createHash('md5').update(content).digest('hex')
}
```

### 4. **Configure URL Rewrites**

- Update `next.config.ts`:

```typescript
async rewrites() {
  return [
    {
      source: '/rss.xml',
      destination: '/api/feed/rss',
    },
    {
      source: '/atom.xml',
      destination: '/api/feed/atom',
    },
    {
      source: '/feed.json',
      destination: '/api/feed/json',
    },
  ]
}
```

### 5. **Add Feed Discovery Meta Tags and WebSub Support**

- Update `src/app/layout.tsx`:

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  
  return (
    <html>
      <head>
        {/* Primary RSS feed - most compatible */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="100 Days of Craft - RSS Feed"
          href="/rss.xml"
        />
        {/* Atom feed - modern standard */}
        <link
          rel="alternate"
          type="application/atom+xml"
          title="100 Days of Craft - Atom Feed"
          href="/atom.xml"
        />
        {/* JSON feed - developer-friendly */}
        <link
          rel="alternate"
          type="application/feed+json"
          title="100 Days of Craft - JSON Feed"
          href="/feed.json"
        />
        {/* WebSub hub discovery */}
        <link
          rel="hub"
          href="https://pubsubhubbub.appspot.com/"
        />
        {/* Self reference for WebSub */}
        <link
          rel="self"
          type="application/rss+xml"
          href={`${siteUrl}/rss.xml`}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 6. **Create RSS Icon Component**

- Create `src/components/svg/RSSIcon.tsx`:

```typescript
export function RSSIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3.429 5.1v2.4c7.248 0 13.114 5.864 13.114 13.1h2.4C18.943 12.654 11.389 5.1 3.429 5.1z" />
      <path d="M3.429 10.5v2.4c4.104 0 7.714 3.61 7.714 7.7h2.4c0-5.59-4.524-10.1-10.114-10.1z" />
      <circle cx="4.629" cy="19.4" r="1.8" />
    </svg>
  )
}
```

### 7. **Add RSS Links to Footer**

- Update `src/components/layout/Footer.tsx`:

```typescript
import { RSSIcon } from '@/components/svg/RSSIcon'

// In footer links section
<div className="flex items-center gap-4">
  <a
    href="/rss.xml"
    className="text-muted-foreground hover:text-foreground transition-colors"
    aria-label="RSS Feed"
  >
    <RSSIcon />
  </a>
  {/* Existing social links */}
</div>
```

### 8. **Add Category-Specific Feeds (Recommended for SEO)**

- Create `src/app/api/feed/category/[slug]/route.ts`:

```typescript
import { generateCategoryFeed } from '@/lib/feed-generator'

export const revalidate = 3600

export async function GET({ params }: { params: { slug: string } }) {
  try {
    const { rss } = await generateCategoryFeed(params.slug)
    
    return new Response(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=7200',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch (error) {
    return new Response('Category not found', { status: 404 })
  }
}
```

### 9. **Implement WebSub Publisher (Real-time Updates)**

- Create `src/lib/websub-publisher.ts`:

```typescript
export async function notifyHub(feedUrl: string) {
  const hubUrl = 'https://pubsubhubbub.appspot.com/'
  
  try {
    const response = await fetch(hubUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'hub.mode': 'publish',
        'hub.url': feedUrl,
      }),
    })
    
    if (response.ok) {
      console.log('Successfully notified WebSub hub')
    }
  } catch (error) {
    console.error('Failed to notify WebSub hub:', error)
  }
}
```

### 10. **Implement Feed Validation and Monitoring**

- Create `src/lib/feed-validator.ts`:

```typescript
import { parseString } from 'xml2js'

export async function validateFeed(feedContent: string, type: 'rss' | 'atom' | 'json') {
  switch (type) {
    case 'rss':
    case 'atom':
      return validateXMLFeed(feedContent, type)
    case 'json':
      return validateJSONFeed(feedContent)
  }
}

async function validateXMLFeed(content: string, type: 'rss' | 'atom'): Promise<ValidationResult> {
  try {
    const result = await parseString(content)
    
    // Check required elements based on type
    const requiredElements = type === 'rss' 
      ? ['channel', 'title', 'link', 'description']
      : ['feed', 'title', 'id', 'updated']
    
    // Validate structure and content
    return {
      valid: true,
      errors: [],
      warnings: [],
    }
  } catch (error) {
    return {
      valid: false,
      errors: [`XML parsing failed: ${error.message}`],
      warnings: [],
    }
  }
}

function validateJSONFeed(content: string): ValidationResult {
  try {
    const feed = JSON.parse(content)
    
    // Validate against JSON Feed spec
    const requiredFields = ['version', 'title', 'items']
    const errors = []
    
    for (const field of requiredFields) {
      if (!feed[field]) {
        errors.push(`Missing required field: ${field}`)
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
    }
  } catch (error) {
    return {
      valid: false,
      errors: [`JSON parsing failed: ${error.message}`],
      warnings: [],
    }
  }
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}
```

### 11. **Add Feed Analytics and Monitoring**

- Create middleware to track feed access:

```typescript
// src/middleware/feed-analytics.ts
export async function trackFeedAccess(request: Request, feedType: string) {
  // Log feed access for monitoring
  // Track user agents to understand feed reader usage
  // Monitor response times and errors
}
```

## Performance Optimizations

### Caching Strategy

- Use ISR with smart revalidation based on content updates
- Implement stale-while-revalidate headers (7200s)
- Cache feed generation results with ETags
- Use CDN for feed distribution
- Implement conditional GET support (If-None-Match, If-Modified-Since)

### Content Optimization

- Limit main feed to 20-30 most recent posts (Google recommendation)
- Include full content for better user experience
- Optimize and validate all image URLs
- Ensure all links are absolute URLs
- Remove tracking parameters from URLs
- Implement proper content encoding (UTF-8)

### SEO Best Practices

- Ensure unique and persistent GUIDs
- Include both publication and update dates
- Use proper content encoding in item descriptions
- Implement category taxonomies with scheme URLs
- Add author information with safe email addresses
- Include feed icon and branding
- Support feed pagination for large archives

## Testing Checklist

### Feed Validation
- [ ] RSS feed validates at W3C Feed Validator
- [ ] Atom feed validates at W3C Feed Validator
- [ ] JSON feed validates at validator.jsonfeed.org
- [ ] All GUIDs are unique and permanent
- [ ] Publication dates are in correct format (RFC-822 for RSS, RFC-3339 for Atom)
- [ ] All URLs are absolute (no relative paths)
- [ ] Character encoding is properly declared and consistent

### SEO & Discovery
- [ ] Feed discovery meta tags present in HTML head
- [ ] WebSub hub discovery links included
- [ ] X-Robots-Tag: noindex header present on feed URLs
- [ ] Category-specific feeds available and linked
- [ ] Feed URLs included in robots.txt (Allow: but with crawl-delay)
- [ ] Feed URLs NOT included in sitemap.xml

### Performance & Reliability
- [ ] Feeds load in < 500ms (cached)
- [ ] ETags generated and working
- [ ] Conditional GET (304 responses) working
- [ ] Stale-while-revalidate functioning
- [ ] CDN caching configured
- [ ] WebSub notifications sent on updates

### Content Quality
- [ ] Full content included (not just excerpts)
- [ ] Images have proper URLs and alt text
- [ ] HTML content is well-formed
- [ ] Special characters properly escaped
- [ ] Categories include scheme URLs
- [ ] Author information complete but privacy-safe

## Validation Tools

- W3C Feed Validator: https://validator.w3.org/feed/
- FeedValidator.org: http://feedvalidator.org/
- JSON Feed Validator: https://validator.jsonfeed.org/
- Google's Structured Data Testing Tool: https://search.google.com/test/rich-results
- Feed Reader Testing: Feedly, Inoreader, NewsBlur
- WebSub Testing: https://websub.rocks/

## Success Criteria

- All three feed formats (RSS, Atom, JSON) are generated and valid
- Feeds are discoverable via meta tags and WebSub
- Feed content follows SEO best practices:
  - Unique, permanent GUIDs
  - Full content with proper encoding
  - Absolute URLs throughout
  - Proper date formatting
  - Category taxonomies with schemes
- Performance optimized:
  - Sub-500ms response times
  - ETags and conditional GET support
  - CDN integration
  - Smart caching strategy
- Real-time updates via WebSub
- Monitoring and analytics in place
- Implementation follows Next.js 15 and W3C/Google best practices
- Feed readers can successfully parse and display content
- Search engines properly ignore feed URLs while discovering content
