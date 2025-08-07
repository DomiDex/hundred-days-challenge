import type { PostDocument, AuthorDocument } from '../../prismicio-types'
import { getAuthorData } from './prismic-helpers'
import { extractCategoryData } from './prismic-utils'
import { isFilled } from '@prismicio/client'

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

  // Extract bio text from RichTextField
  const bioText =
    authorData.bio?.reduce((text, node) => {
      if ('text' in node) {
        return text + node.text
      }
      return text
    }, '') || ''

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorData.name,
    description: bioText,
    image: authorData.avatar?.url || '',
    url: `${siteUrl}/authors/${author.uid}`,
    sameAs: [
      isFilled.link(authorData.linkedin_link) ? authorData.linkedin_link.url : null,
      isFilled.link(authorData.x_link) ? authorData.x_link.url : null,
      isFilled.link(authorData.github_link) ? authorData.github_link.url : null,
      isFilled.link(authorData.website_link) ? authorData.website_link.url : null,
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
    sameAs: ['https://twitter.com/100daysofcraft', 'https://github.com/100daysofcraft'],
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
