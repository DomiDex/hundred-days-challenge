# SEO Implementation Guide for Prismic + Next.js

## Overview

This guide explains how to use the SEO fields added to your Prismic custom types with the Next.js SEO component.

## SEO Fields Added to Custom Types

All custom types now include comprehensive SEO fields in a dedicated "SEO" tab:

### Basic SEO Fields

- **meta_title**: Page title for search engines (max 60 characters)
- **meta_description**: Page description for search engines (max 160 characters)

### OpenGraph Fields

- **og_title**: Title for social media sharing (defaults to meta_title if empty)
- **og_description**: Description for social media sharing (defaults to meta_description if empty)
- **og_image**: Image for social media sharing (1200x630px recommended)
- **og_type**: Content type (article for blog posts)

### Twitter Card Fields

- **twitter_card**: Card type (summary or summary_large_image)

### Additional SEO Fields

- **canonical_url**: Custom canonical URL (optional)
- **robots**: Search engine indexing directives (index,follow by default)
- **keywords**: Comma-separated keywords (post type only)
- **article_author**: Author name for structured data (post type only)

## Using the SEO Component

### 1. Import the SEO Component

```typescript
import { generateSEOMetadata } from '@/components/SEO'
```

### 2. Homepage Example

```typescript
import { Metadata } from 'next'
import { createClient } from '@/prismicio'
import { generateSEOMetadata } from '@/components/SEO'

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient()
  const home = await client.getSingle('homepage')

  return generateSEOMetadata({
    data: home.data,
    url: process.env.NEXT_PUBLIC_SITE_URL || '',
  })
}
```

### 3. Regular Page Example

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params
  const client = createClient()
  const page = await client.getByUID('page', uid)

  return generateSEOMetadata({
    data: page.data,
    fallbackTitle: page.data.title || 'Page',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${uid}`,
  })
}
```

### 4. Blog Post Example (Already Implemented)

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const client = createClient()
  const post = await client.getByUID('post', slug)

  return generateSEOMetadata({
    data: post.data,
    fallbackTitle: post.data.name || 'Blog Post',
    fallbackDescription: post.data.excerpt || '',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${category}/${slug}`,
    publishedTime: post.data.publication_date || post.first_publication_date,
    modifiedTime: post.last_publication_date,
  })
}
```

### 5. Category Page Example

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params
  const client = createClient()
  const category = await client.getByUID('category', uid)

  return generateSEOMetadata({
    data: category.data,
    fallbackTitle: category.data.name || 'Category',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${uid}`,
  })
}
```

## Environment Variables

Add this to your `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Testing Your SEO Implementation

### 1. Facebook Debugger

Test OpenGraph tags: https://developers.facebook.com/tools/debug/

### 2. Twitter Card Validator

Test Twitter cards: https://cards-dev.twitter.com/validator

### 3. Google Rich Results Test

Test structured data: https://search.google.com/test/rich-results

### 4. LinkedIn Post Inspector

Test LinkedIn sharing: https://www.linkedin.com/post-inspector/

## Best Practices

1. **Keep titles under 60 characters** to prevent truncation in search results
2. **Keep descriptions between 150-160 characters** for optimal display
3. **Use 1200x630px images** for OpenGraph to ensure proper display across all platforms
4. **Test your pages** using the debugging tools above before going live
5. **Use fallback values** to ensure SEO data is always present
6. **Add alt text** to OpenGraph images for accessibility

## Prismic Content Entry Tips

When entering content in Prismic:

1. If you leave og_title empty, it will use meta_title
2. If you leave og_description empty, it will use meta_description
3. For blog posts, the featured image can be reused as the og_image
4. Always fill in meta_title and meta_description as minimum requirements
5. Use the robots field carefully - most pages should be "index,follow"

## Next Steps

1. Update all your page components to use the SEO component
2. Set the NEXT_PUBLIC_SITE_URL environment variable
3. Test your pages with the debugging tools
4. Monitor your SEO performance with Google Search Console
