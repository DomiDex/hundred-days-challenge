import { Feed } from 'feed'
import { createClient } from '@/prismicio'
import type { PostDocument, AuthorDocument } from '../../prismicio-types'
import { extractCategoryData } from '@/lib/prismic-utils'
import { asHTML, asText } from '@prismicio/client'
import * as prismic from '@prismicio/client'

export async function generateFeeds() {
  const client = createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

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
      email: 'noreply@100daysofcraft.com',
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
    pageSize: 30, // Google recommends 20-30 items
  })

  // Add posts to feed with SEO-optimized content
  for (const post of posts) {
    const categoryData = extractCategoryData(post)
    const postUrl = `${siteUrl}/blog/${categoryData?.uid || 'uncategorized'}/${post.uid}`
    const publicationDate = new Date(post.data.publication_date || post.first_publication_date!)

    // Extract full content with absolute URLs
    const fullContent = await extractFullContent(post, siteUrl)
    const excerpt = post.data.excerpt || generateExcerpt(asText(post.data.article_text), 160)

    // Get author data
    const authorData =
      prismic.isFilled.contentRelationship(post.data.author) && post.data.author.data
        ? (post.data.author.data as unknown as AuthorDocument['data'])
        : null

    feed.addItem({
      title: post.data.name || 'Untitled',
      id: postUrl, // Must be unique and permanent
      link: postUrl,
      guid: postUrl, // Explicit GUID for RSS
      description: excerpt, // Plain text excerpt for compatibility
      content: fullContent, // Full HTML content for readers that support it
      author: [
        {
          name: authorData?.name || 'Anonymous',
          email: 'noreply@100daysofcraft.com', // Privacy-safe email
          link:
            post.data.author && 'uid' in post.data.author && post.data.author.uid
              ? `${siteUrl}/authors/${post.data.author.uid}`
              : undefined,
        },
      ],
      date: publicationDate,
      published: publicationDate, // Explicit publication date
      category: categoryData
        ? [
            {
              name: categoryData.name,
              term: categoryData.uid,
              scheme: `${siteUrl}/categories`, // Category taxonomy URL
            },
          ]
        : undefined,
      image: post.data.image?.url || undefined,
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
async function extractFullContent(post: PostDocument, siteUrl: string): Promise<string> {
  // Convert Prismic rich text to HTML with absolute URLs
  const htmlSerializer: prismic.HTMLRichTextMapSerializer = {
    image: ({ node }) => {
      const src = node.url
      const alt = node.alt || ''
      return `<img src="${src}" alt="${alt}" loading="lazy" />`
    },
    hyperlink: ({ node, children }) => {
      const url = node.data.url || ''
      const absoluteUrl = url.startsWith('http') ? url : `${siteUrl}${url}`
      return `<a href="${absoluteUrl}">${children}</a>`
    },
  }

  const html = asHTML(post.data.article_text, {
    serializer: htmlSerializer,
  })

  return html || ''
}

function generateExcerpt(content: string, maxLength: number): string {
  // Strip HTML tags and create clean excerpt
  const text = content.replace(/<[^>]*>/g, '').trim()
  return text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text
}

// Generate feed for specific category
export async function generateCategoryFeed(categorySlug: string) {
  const client = createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

  // First, find the category by slug
  const categories = await client.getAllByType('category', {
    filters: [prismic.filter.at('my.category.uid', categorySlug)],
  })

  if (!categories.length) {
    throw new Error('Category not found')
  }

  const category = categories[0]

  // Create feed for this category
  const feed = new Feed({
    title: `100 Days of Craft - ${category.data.name}`,
    description: `${category.data.name} posts from 100 Days of Craft`,
    id: `${siteUrl}/categories/${categorySlug}`,
    link: `${siteUrl}/blog/${categorySlug}`,
    language: 'en',
    image: `${siteUrl}/images/logo.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, 100 Days of Craft`,
    updated: new Date(),
    generator: 'Next.js 15',
    feedLinks: {
      rss: `${siteUrl}/feeds/category/${categorySlug}.xml`,
    },
    author: {
      name: '100 Days of Craft Team',
      email: 'noreply@100daysofcraft.com',
      link: siteUrl,
    },
    hub: 'https://pubsubhubbub.appspot.com/',
    ttl: 60,
  })

  // Fetch posts for this category
  const posts = await client.getAllByType('post', {
    filters: [prismic.filter.at('my.post.category', category.id)],
    orderings: [
      { field: 'my.post.publication_date', direction: 'desc' },
      { field: 'document.first_publication_date', direction: 'desc' },
    ],
    fetchLinks: ['author.name'],
    pageSize: 20,
  })

  // Add posts to feed
  for (const post of posts) {
    const postUrl = `${siteUrl}/blog/${categorySlug}/${post.uid}`
    const publicationDate = new Date(post.data.publication_date || post.first_publication_date!)

    const fullContent = await extractFullContent(post, siteUrl)
    const excerpt = post.data.excerpt || generateExcerpt(asText(post.data.article_text), 160)

    const authorData =
      prismic.isFilled.contentRelationship(post.data.author) && post.data.author.data
        ? (post.data.author.data as unknown as AuthorDocument['data'])
        : null

    feed.addItem({
      title: post.data.name || 'Untitled',
      id: postUrl,
      link: postUrl,
      guid: postUrl,
      description: excerpt,
      content: fullContent,
      author: [
        {
          name: authorData?.name || 'Anonymous',
          email: 'noreply@100daysofcraft.com',
          link:
            post.data.author && 'uid' in post.data.author && post.data.author.uid
              ? `${siteUrl}/authors/${post.data.author.uid}`
              : undefined,
        },
      ],
      date: publicationDate,
      published: publicationDate,
      category: [
        {
          name: category.data.name || '',
          term: categorySlug,
          scheme: `${siteUrl}/categories`,
        },
      ],
      image: post.data.image?.url || undefined,
    })
  }

  return {
    rss: feed.rss2(),
    atom: feed.atom1(),
    json: feed.json1(),
  }
}
