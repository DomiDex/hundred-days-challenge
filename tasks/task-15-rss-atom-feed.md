# Task 15: Implement RSS/Atom Feed

## Priority: Medium

## Description

Create comprehensive RSS, Atom, and JSON feed implementations for the blog, enabling users to subscribe to content updates through their preferred feed readers.

## Dependencies

- Prismic CMS integration (must be working)
- Blog functionality (posts, categories, authors)

## Implementation Steps

### 1. **Install Feed Package**

```bash
npm install feed
npm install --save-dev @types/feed
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

  // Create feed instance
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

  // Add posts to feed
  for (const post of posts) {
    const categoryData = extractCategoryData(post)
    const postUrl = `${siteUrl}/blog/${categoryData?.uid || 'uncategorized'}/${post.uid}`
    const publicationDate = new Date(post.data.publication_date || post.first_publication_date)

    feed.addItem({
      title: post.data.name || 'Untitled',
      id: postUrl,
      link: postUrl,
      description: post.data.excerpt || '',
      content: post.data.excerpt || '', // Could parse article_text for full content
      author: [
        {
          name: post.data.author?.data?.name || 'Anonymous',
          link: post.data.author?.uid ? `${siteUrl}/authors/${post.data.author.uid}` : undefined,
        },
      ],
      date: publicationDate,
      category: categoryData
        ? [
            {
              name: categoryData.name,
              term: categoryData.uid,
            },
          ]
        : undefined,
      image: post.data.image?.url || undefined,
    })
  }

  return {
    rss: feed.rss2(),
    atom: feed.atom1(),
    json: feed.json1(),
  }
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
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
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
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
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
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch (error) {
    console.error('Error generating JSON feed:', error)
    return new Response('Error generating feed', { status: 500 })
  }
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

### 5. **Add Feed Discovery Meta Tags**

- Update `src/app/layout.tsx`:

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="100 Days of Craft - RSS Feed"
          href="/rss.xml"
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          title="100 Days of Craft - Atom Feed"
          href="/atom.xml"
        />
        <link
          rel="alternate"
          type="application/feed+json"
          title="100 Days of Craft - JSON Feed"
          href="/feed.json"
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

### 8. **Add Category-Specific Feeds (Optional)**

- Create `src/app/api/feed/category/[slug]/route.ts`:

```typescript
export async function GET({ params }: { params: { slug: string } }) {
  // Generate feed for specific category
  // Similar to main feed but filtered by category
}
```

### 9. **Implement Feed Validation**

- Create `src/lib/feed-validator.ts`:

```typescript
export async function validateFeed(feedContent: string, type: 'rss' | 'atom' | 'json') {
  // Implement basic validation
  // Check for required elements
  // Validate XML/JSON structure
}
```

## Performance Optimizations

### Caching Strategy

- Use ISR with 1-hour revalidation
- Implement stale-while-revalidate headers
- Cache feed generation results

### Content Optimization

- Limit feed to 50 most recent posts
- Include excerpts by default, full content optional
- Optimize image URLs for feed readers

## Testing Checklist

- [ ] RSS feed generates valid XML
- [ ] Atom feed generates valid XML
- [ ] JSON feed generates valid JSON
- [ ] All feed formats accessible via clean URLs
- [ ] Feed discovery meta tags present in HTML
- [ ] RSS icon visible and linked in footer
- [ ] Feeds update when new content is published
- [ ] Category-specific feeds work (if implemented)
- [ ] Feed validation passes
- [ ] Performance: feeds load in < 1 second
- [ ] Caching headers properly set

## Validation Tools

- W3C Feed Validator: https://validator.w3.org/feed/
- FeedValidator.org: http://feedvalidator.org/
- JSON Feed Validator: https://validator.jsonfeed.org/

## Success Criteria

- All three feed formats (RSS, Atom, JSON) are generated
- Feeds are discoverable via meta tags
- Feed content is properly formatted and valid
- Performance is optimized with caching
- Feeds automatically update with new content
- RSS icon provides easy access to feeds
- Implementation follows Next.js 15 best practices
