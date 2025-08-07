# RSS/Atom Feed Documentation

## Overview

The 100 Days of Craft blog provides multiple feed formats for content syndication, following W3C WebSub specifications and Google's best practices for RSS/Atom feeds.

## Available Feed Formats

### 1. RSS 2.0 Feed

- **URL**: `https://yourdomain.com/rss.xml`
- **Content-Type**: `application/rss+xml`
- **Description**: Most widely supported format, compatible with all major feed readers

### 2. Atom 1.0 Feed

- **URL**: `https://yourdomain.com/atom.xml`
- **Content-Type**: `application/atom+xml`
- **Description**: Modern feed standard with better namespace support

### 3. JSON Feed 1.1

- **URL**: `https://yourdomain.com/feed.json`
- **Content-Type**: `application/feed+json`
- **Description**: Developer-friendly format, easy to parse programmatically

### 4. Category-Specific Feeds

- **URL Pattern**: `https://yourdomain.com/feeds/category/{category-slug}.xml`
- **Example**: `https://yourdomain.com/feeds/category/tutorials.xml`
- **Description**: Subscribe to specific content categories

## Features

### SEO Optimizations

- ✅ Unique, permanent GUIDs for each post
- ✅ Full article content (not just excerpts)
- ✅ Absolute URLs throughout
- ✅ Proper date formatting (RFC-822 for RSS, RFC-3339 for Atom)
- ✅ Category taxonomies with scheme URLs
- ✅ Author information with privacy-safe emails

### Performance Features

- ✅ ETags for efficient caching
- ✅ Conditional GET support (If-None-Match, If-Modified-Since)
- ✅ 1-hour cache revalidation
- ✅ Limited to 30 most recent posts
- ✅ Stale-while-revalidate caching strategy

### Real-time Updates

- ✅ WebSub (PubSubHubbub) support
- ✅ Hub URL: `https://pubsubhubbub.appspot.com/`
- ✅ Instant notifications on new content

## Implementation Details

### Feed Generation

Feeds are generated dynamically using the `feed` npm package with data from Prismic CMS:

```typescript
// src/lib/feed-generator.ts
- Fetches posts from Prismic
- Converts rich text to HTML
- Ensures absolute URLs
- Adds WebSub hub configuration
```

### API Routes

```
/api/feed/rss                → RSS 2.0 feed
/api/feed/atom               → Atom 1.0 feed
/api/feed/json               → JSON feed
/api/feed/category/[slug]    → Category-specific RSS
```

### URL Rewrites

Clean URLs are provided through Next.js rewrites:

```javascript
// next.config.ts
{
  source: '/rss.xml',
  destination: '/api/feed/rss',
}
```

## How to Subscribe

### Using Feed Readers

#### Feedly

1. Click the Feedly button or visit: `https://feedly.com/i/subscription/feed/https://yourdomain.com/rss.xml`
2. Choose your subscription folder
3. Start reading!

#### Inoreader

1. Add subscription: `https://yourdomain.com/rss.xml`
2. Optionally set up rules and filters
3. Enjoy full-text content

#### Other Popular Readers

- **NewsBlur**: `https://newsblur.com/?url=https://yourdomain.com/rss.xml`
- **The Old Reader**: Add via their interface
- **NetNewsWire**: Native macOS/iOS app
- **Miniflux**: Self-hosted option

### Browser Extensions

Many browsers support RSS feed discovery automatically through our meta tags.

### Email Delivery

Use services like Blogtrottr or FeedRabbit to receive RSS updates via email.

## Feed Discovery

### Auto-Discovery Tags

The following tags are included in the HTML `<head>`:

```html
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
```

### WebSub Discovery

```html
<link rel="hub" href="https://pubsubhubbub.appspot.com/" />
<link rel="self" type="application/rss+xml" href="https://yourdomain.com/rss.xml" />
```

## Feed Content Structure

### RSS Item Example

```xml
<item>
  <title>Post Title</title>
  <link>https://yourdomain.com/blog/category/post-slug</link>
  <guid isPermaLink="true">https://yourdomain.com/blog/category/post-slug</guid>
  <description>Post excerpt...</description>
  <content:encoded><![CDATA[Full HTML content]]></content:encoded>
  <pubDate>Mon, 31 Jul 2024 12:00:00 GMT</pubDate>
  <author>noreply@yourdomain.com (Author Name)</author>
  <category domain="https://yourdomain.com/categories">Category Name</category>
  <enclosure url="https://image-url.jpg" type="image/jpeg" />
</item>
```

### Atom Entry Example

```xml
<entry>
  <title>Post Title</title>
  <id>https://yourdomain.com/blog/category/post-slug</id>
  <link href="https://yourdomain.com/blog/category/post-slug" />
  <updated>2024-07-31T12:00:00Z</updated>
  <published>2024-07-31T12:00:00Z</published>
  <author>
    <name>Author Name</name>
    <email>noreply@yourdomain.com</email>
  </author>
  <summary>Post excerpt...</summary>
  <content type="html">Full HTML content</content>
  <category term="category-slug" scheme="https://yourdomain.com/categories" />
</entry>
```

### JSON Feed Item Example

```json
{
  "id": "https://yourdomain.com/blog/category/post-slug",
  "url": "https://yourdomain.com/blog/category/post-slug",
  "title": "Post Title",
  "content_html": "Full HTML content",
  "summary": "Post excerpt...",
  "date_published": "2024-07-31T12:00:00Z",
  "author": {
    "name": "Author Name"
  },
  "tags": ["category-name"]
}
```

## Technical Specifications

### Cache Headers

```
Cache-Control: public, max-age=600, s-maxage=3600, stale-while-revalidate=7200
X-Robots-Tag: noindex
Last-Modified: {current-date}
ETag: "{content-hash}"
```

### Content Guidelines

- Full article content included
- Images use absolute URLs
- HTML is properly escaped
- Special characters handled correctly
- UTF-8 encoding throughout

### Limits

- Maximum 30 posts per feed
- 1-hour cache revalidation
- No pagination (latest posts only)

## Validation

Feeds can be validated using:

- **W3C Feed Validator**: https://validator.w3.org/feed/
- **FeedValidator.org**: http://feedvalidator.org/
- **JSON Feed Validator**: https://validator.jsonfeed.org/

## robots.txt Configuration

```
User-agent: *
Allow: /rss.xml
Allow: /atom.xml
Allow: /feed.json
Allow: /feeds/
Crawl-delay: 10
```

## API Usage

### Programmatic Access

```javascript
// Fetch RSS feed
const response = await fetch('https://yourdomain.com/rss.xml')
const rssText = await response.text()

// Fetch JSON feed
const jsonResponse = await fetch('https://yourdomain.com/feed.json')
const jsonFeed = await jsonResponse.json()
```

### Conditional Requests

```javascript
// Use ETags for efficient polling
const response = await fetch('https://yourdomain.com/rss.xml', {
  headers: {
    'If-None-Match': previousETag,
  },
})

if (response.status === 304) {
  // Content hasn't changed
}
```

## Troubleshooting

### Feed Not Updating?

1. Check cache headers (1-hour TTL)
2. Verify WebSub notifications are working
3. Clear feed reader cache

### Validation Errors?

1. Use feed validators listed above
2. Check for special characters
3. Verify all URLs are absolute

### Missing Content?

1. Ensure posts are published in Prismic
2. Check post publication dates
3. Verify category relationships

## Future Enhancements

- [ ] Podcast RSS support
- [ ] Author-specific feeds
- [ ] Custom feed filters
- [ ] OPML export
- [ ] Feed analytics dashboard

## Support

For issues or questions about RSS feeds:

1. Check feed validators
2. Test with multiple readers
3. Review server logs
4. Contact support with specific error messages
