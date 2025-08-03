import type { PostDocument, AuthorDocument } from '../../prismicio-types'
import { getAuthorData } from './prismic-helpers'
import { extractCategoryData } from './prismic-utils'

export function generateArticleSchema(
  post: PostDocument,
  author: AuthorDocument | null,
  siteUrl: string
) {
  const authorData = author ? getAuthorData(author) : null
  const categoryData = extractCategoryData(post)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.name || '',
    description: post.data.excerpt || '',
    author: authorData
      ? {
          '@type': 'Person',
          name: authorData.name,
          url: `${siteUrl}/authors/${author?.uid}`,
        }
      : undefined,
    datePublished: post.data.publication_date || post.first_publication_date,
    dateModified: post.last_publication_date,
    image: post.data.image?.url ? [post.data.image.url] : undefined,
    publisher: {
      '@type': 'Organization',
      name: '100 Days of Craft',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${categoryData?.uid}/${post.uid}`,
    },
    articleSection: categoryData?.name || 'Blog',
    keywords: post.tags?.join(', ') || '',
  }
}

export function generatePersonSchema(author: AuthorDocument, siteUrl: string) {
  const authorData = getAuthorData(author)
  if (!authorData) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorData.name,
    description: authorData.bio?.[0]?.text || '',
    image: authorData.avatar?.url || '',
    url: `${siteUrl}/authors/${author.uid}`,
    sameAs: [
      authorData.linkedin_link?.url,
      authorData.x_link?.url,
      authorData.github_link?.url,
      authorData.website_link?.url,
    ].filter(Boolean),
  }
}

export function generateBreadcrumbSchema(
  items: Array<{ label: string; href?: string }>,
  siteUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteUrl}${item.href}` : undefined,
    })),
  }
}

export function generateOrganizationSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '100 Days of Craft',
    description: 'A daily Next.js coding challenge project',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      'https://twitter.com/100daysofcraft',
      'https://github.com/100daysofcraft',
    ],
  }
}

export function generateWebSiteSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '100 Days of Craft',
    description: 'A daily Next.js coding challenge project',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}