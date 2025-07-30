# Task 10: SEO and Accessibility Optimization

## Priority: Medium

## Description

Enhance SEO with structured data, sitemap generation, robots.txt, and ensure full accessibility compliance (WCAG 2.1 AA).

## Dependencies

- Task 09: Performance Optimization (better performance improves SEO)

## Implementation Steps

### 1. **Structured Data Implementation**

- Create `src/lib/structured-data.ts`:

```typescript
export function generateArticleSchema(post: PostDocument) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.name,
    description: post.data.excerpt,
    author: {
      '@type': 'Person',
      name: post.data.author.name,
      url: `/authors/${post.data.author.uid}`,
    },
    datePublished: post.data.publication_date,
    dateModified: post.last_publication_date,
    image: post.data.image.url,
    publisher: {
      '@type': 'Organization',
      name: '100 Days of Craft',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      },
    },
  }
}
```

### 2. **Sitemap Generation**

- Create `src/app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next'
import { createClient } from '@/prismicio'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = createClient()

  // Fetch all content
  const posts = await client.getAllByType('post')
  const pages = await client.getAllByType('page')
  const authors = await client.getAllByType('author')

  return [
    {
      url: 'https://yourdomain.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Map all content to sitemap entries
  ]
}
```

### 3. **Robots.txt Configuration**

- Create `src/app/robots.ts`:

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: 'https://yourdomain.com/sitemap.xml',
  }
}
```

### 4. **Accessibility Improvements**

- Update components for ARIA:

```typescript
- Add proper ARIA labels
- Implement skip navigation
- Ensure keyboard navigation
- Add focus indicators
- Implement live regions
```

### 5. **Create Skip Navigation**

- Create `src/components/SkipNavigation.tsx`:

```typescript
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
    >
      Skip to main content
    </a>
  )
}
```

### 6. **Implement Breadcrumb Schema**

- Update `src/components/ui/Breadcrumb.tsx`:

```typescript
- Add structured data
- Proper ARIA attributes
- Schema.org BreadcrumbList
```

### 7. **RSS Feed Generation**

- Create `src/app/feed.xml/route.ts`:

```typescript
export async function GET() {
  const feed = new RSS({
    title: '100 Days of Craft',
    description: 'Blog description',
    feed_url: 'https://yourdomain.com/feed.xml',
    site_url: 'https://yourdomain.com',
  })

  // Add posts to feed
  return new Response(feed.xml(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
```

### 8. **OpenGraph Image Generation**

- Create `src/app/og/route.tsx`:

```typescript
import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  // Generate dynamic OG images
}
```

## SEO Checklist

### Technical SEO

- [ ] Sitemap.xml generated dynamically
- [ ] Robots.txt properly configured
- [ ] Canonical URLs set correctly
- [ ] Structured data implemented
- [ ] Meta tags optimized
- [ ] OpenGraph tags complete
- [ ] Twitter cards configured
- [ ] RSS feed available

### Content SEO

- [ ] Unique meta descriptions
- [ ] Optimized title tags
- [ ] Header hierarchy (H1-H6)
- [ ] Alt text for all images
- [ ] Internal linking strategy
- [ ] URL structure optimized

### Performance SEO

- [ ] Core Web Vitals passing
- [ ] Mobile-friendly design
- [ ] HTTPS enabled
- [ ] No broken links
- [ ] Fast page load times

## Accessibility Checklist

### WCAG 2.1 AA Compliance

- [ ] Color contrast ratios meet standards
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] ARIA labels properly used
- [ ] Skip navigation implemented
- [ ] Form labels associated
- [ ] Error messages clear

### Testing Tools

```bash
# Install accessibility testing
npm install --save-dev axe-core @axe-core/react
```

### Automated Testing

```typescript
// Add to E2E tests
test('should have no accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
```

## Monitoring

### SEO Monitoring

- Set up Google Search Console
- Configure Bing Webmaster Tools
- Monitor Core Web Vitals
- Track organic traffic

### Accessibility Monitoring

- Regular WAVE tool scans
- Axe DevTools checks
- Manual keyboard navigation tests
- Screen reader testing

## Success Criteria

- All pages indexed by search engines
- Rich snippets appearing in search results
- No accessibility violations
- Keyboard navigation works throughout
- Screen readers can navigate content
- Lighthouse SEO score > 95
- Lighthouse Accessibility score > 95
