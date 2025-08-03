import { MetadataRoute } from 'next'
import { createClient } from '@/prismicio'
import { extractCategoryData } from '@/lib/prismic-utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'

  try {
    // Fetch all content
    const [posts, pages, authors, categories] = await Promise.all([
      client.getAllByType('post', {
        fetchLinks: ['category.uid'],
      }),
      client.getAllByType('page'),
      client.getAllByType('author'),
      client.getAllByType('category'),
    ])

    // Base routes
    const routes: MetadataRoute.Sitemap = [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${siteUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${siteUrl}/authors`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${siteUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ]

    // Add blog posts
    const postRoutes = posts.map((post) => {
      const categoryData = extractCategoryData(post)
      return {
        url: `${siteUrl}/blog/${categoryData?.uid || 'uncategorized'}/${post.uid}`,
        lastModified: new Date(post.last_publication_date),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    })

    // Add pages
    const pageRoutes = pages.map((page) => ({
      url: `${siteUrl}/${page.uid}`,
      lastModified: new Date(page.last_publication_date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    // Add author pages
    const authorRoutes = authors.map((author) => ({
      url: `${siteUrl}/authors/${author.uid}`,
      lastModified: new Date(author.last_publication_date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    // Add category pages
    const categoryRoutes = categories.map((category) => ({
      url: `${siteUrl}/blog/${category.uid}`,
      lastModified: new Date(category.last_publication_date),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Add RSS/Atom feeds
    const feedRoutes = [
      {
        url: `${siteUrl}/rss.xml`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.5,
      },
      {
        url: `${siteUrl}/atom.xml`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.5,
      },
      {
        url: `${siteUrl}/feed.json`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.5,
      },
    ]

    return [...routes, ...postRoutes, ...pageRoutes, ...authorRoutes, ...categoryRoutes, ...feedRoutes]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return minimal sitemap on error
    return [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}