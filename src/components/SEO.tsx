import { Metadata } from 'next'
import { ImageField, isFilled } from '@prismicio/client'

interface SEOData {
  meta_title?: string | null
  meta_description?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: ImageField | null
  twitter_card?: string | null
  canonical_url?: string | null
  robots?: string | null
  keywords?: string | null
  article_author?: string | null
  og_type?: string | null
}

interface GenerateSEOMetadataProps {
  data: SEOData
  fallbackTitle?: string
  fallbackDescription?: string
  url?: string
  siteName?: string
  publishedTime?: string
  modifiedTime?: string
}

export function generateSEOMetadata({
  data,
  fallbackTitle = 'A daily Next.js coding challenge | A dayly Next.js',
  fallbackDescription = 'Practicing Next.js by building a daily coding challenge project every day for 100 days.',
  url = '',
  siteName = 'A dayly Next.js',
  publishedTime,
  modifiedTime,
}: GenerateSEOMetadataProps): Metadata {
  const title = data.meta_title || fallbackTitle
  const description = data.meta_description || fallbackDescription
  const ogTitle = data.og_title || title
  const ogDescription = data.og_description || description
  const twitterCard =
    (data.twitter_card as 'summary' | 'summary_large_image') || 'summary_large_image'

  const metadata: Metadata = {
    title,
    description,
    keywords: data.keywords || undefined,
    robots: data.robots || 'index,follow',
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: data.canonical_url || url,
      siteName,
      locale: 'en_US',
      type: (data.og_type as 'website' | 'article') || 'website',
      images:
        data.og_image && isFilled.image(data.og_image)
          ? [
              {
                url: data.og_image.url,
                width: 1200,
                height: 630,
                alt: data.og_image.alt || ogTitle,
              },
            ]
          : undefined,
    },
    twitter: {
      card: twitterCard,
      title: ogTitle,
      description: ogDescription,
      images: data.og_image && isFilled.image(data.og_image) ? [data.og_image.url] : undefined,
    },
    alternates: {
      canonical: data.canonical_url || url || undefined,
    },
  }

  // Add article-specific metadata if it's a blog post
  if (data.og_type === 'article' && metadata.openGraph) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      authors: data.article_author ? [data.article_author] : undefined,
      publishedTime,
      modifiedTime,
    }
  }

  return metadata
}
