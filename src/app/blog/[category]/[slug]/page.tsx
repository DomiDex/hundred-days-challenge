import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import * as prismic from '@prismicio/client'
import { createClient } from '@/prismicio'
import { PrismicNextImage } from '@prismicio/next'
import { SliceZone } from '@prismicio/react'
import { components } from '@/slices'
import { RichTextRenderer } from '@/components/blog/RichTextRenderer'
import { TableOfContents } from '@/components/blog/TableOfContents'
import Link from 'next/link'
import { PrismLoader } from '@/components/PrismLoader'
import { generateSEOMetadata } from '@/components/SEO'
import ProjectLinks from '@/components/blog/ProjectLinks'
import { AuthorCard } from '@/components/blog/AuthorCard'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { CategoryChip } from '@/components/blog/CategoryChip'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import type { PostDocument, AuthorDocument } from '../../../../../prismicio-types'
import { filterPostsByCategory, extractCategoryData } from '@/lib/prismic-utils'
import { getAuthorData } from '@/lib/prismic-helpers'
import { extractHeadingsFromRichText } from '@/lib/toc-utils'
import { generateArticleSchema } from '@/lib/structured-data'
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema'

// Revalidate every 2 hours for blog posts
export const revalidate = 7200

// Temporary type extension until Prismic types are regenerated
interface ExtendedPostData {
  demo_link?: prismic.LinkField
  github_link?: prismic.LinkField
  author?: prismic.ContentRelationshipField<'author'>
}

type ExtendedPost = PostDocument & {
  data: PostDocument['data'] & ExtendedPostData
}

// AuthorDocument already includes all fields we need
type ExtendedAuthor = AuthorDocument

type Props = {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const client = createClient()

  try {
    const post = await client.getByUID('post', slug)
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${category}/${slug}`

    return generateSEOMetadata({
      data: post.data,
      fallbackTitle: post.data.name || 'Blog Post',
      fallbackDescription: post.data.excerpt || '',
      url,
      publishedTime: post.data.publication_date || post.first_publication_date,
      modifiedTime: post.last_publication_date,
    })
  } catch {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found',
    }
  }
}

export async function generateStaticParams() {
  const client = createClient()
  const posts = await client.getAllByType('post', {
    fetchLinks: ['category.uid'],
  })

  return posts.map((post) => {
    const categoryData = extractCategoryData(post)

    return {
      category: categoryData?.uid || '',
      slug: post.uid,
    }
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { category, slug } = await params
  const client = createClient()

  // Fetch the post
  let post: ExtendedPost
  try {
    post = (await client.getByUID('post', slug, {
      fetchLinks: [
        'category.name',
        'category.uid',
        'author.name',
        'author.role',
        'author.avatar',
        'author.bio',
        'author.linkedin_link',
        'author.x_link',
        'author.github_link',
        'author.website_link',
      ],
    })) as ExtendedPost
  } catch (error) {
    console.error(`Error fetching post with slug "${slug}":`, error)
    console.error('Error details:', {
      slug,
      category,
      repositoryName: process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || 'hundred-days-challenge',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    notFound()
  }

  // Verify the category matches
  const categoryData = extractCategoryData(post)

  if (!categoryData?.uid || categoryData.uid !== category) {
    notFound()
  }
  const publicationDate = new Date(
    post.data.publication_date || post.first_publication_date
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Fetch full author data if linked
  let author: ExtendedAuthor | null = null
  if (prismic.isFilled.contentRelationship(post.data.author)) {
    try {
      const authorResponse = await client.getByID(post.data.author.id)
      // Force cast to our known author type structure
      author = {
        ...authorResponse,
        data: authorResponse.data,
      } as unknown as ExtendedAuthor
    } catch {
      // Author not found, continue without it
    }
  }

  // Fetch related posts
  const categoryId = prismic.isFilled.contentRelationship(post.data.category)
    ? post.data.category.id
    : null

  // Fetch all posts and filter client-side due to Prismic API limitations
  const allPosts = await client.getAllByType('post', {
    orderings: [{ field: 'document.first_publication_date', direction: 'desc' }],
    fetchLinks: ['category.name', 'category.uid'],
  })

  // Filter posts from the same category (excluding current post)
  const relatedPosts = categoryId
    ? filterPostsByCategory(allPosts, categoryId)
        .filter((p) => p.id !== post.id)
        .slice(0, 3) // Take only the first 3 related posts
    : []

  // Extract headings for table of contents
  const headings = extractHeadingsFromRichText(post.data.article_text)

  // Generate structured data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'
  const articleSchema = generateArticleSchema(post, author, siteUrl)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: categoryData?.name || 'Category', href: `/blog/${category}` },
    { label: post.data.name || '' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <PrismLoader />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="mx-auto max-w-7xl px-8 py-16 md:px-12 lg:px-16">
        <Breadcrumb items={breadcrumbItems} className="mb-16" />
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-[300px_1fr]">
          {/* Table of Contents */}
          <aside className="hidden xl:block">
            <TableOfContents headings={headings} />
          </aside>

          {/* Main Content */}
          <article className="min-w-0">
            {/* Post Header */}
            <header className="mb-12">
              {categoryData && (
                <div className="mb-4">
                  <CategoryChip name={categoryData.name} uid={category} />
                </div>
              )}

              <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
                {post.data.name}
              </h1>

              {post.data.excerpt && (
                <p className="mb-6 text-xl text-muted-foreground">{post.data.excerpt}</p>
              )}

              <div className="mb-6 flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
                <time dateTime={post.data.publication_date || post.first_publication_date}>
                  {publicationDate}
                </time>
                {author && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-2">
                      <span>By </span>
                      <Link
                        href={`/authors/${author.uid}`}
                        className="text-primary transition-colors hover:text-primary/80"
                      >
                        {getAuthorData(author)?.name || ''}
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Project Links and Share Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <ProjectLinks demoLink={post.data.demo_link} githubLink={post.data.github_link} />
                <ShareButtons
                  url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${category}/${slug}`}
                  title={post.data.name || ''}
                />
              </div>
            </header>

            {/* Featured Image */}
            {post.data.image.url && (
              <div className="relative mb-12 h-96 w-full overflow-hidden rounded-lg">
                <PrismicNextImage field={post.data.image} fill className="object-cover" priority />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <RichTextRenderer field={post.data.article_text} />
            </div>

            {/* Slices */}
            {post.data.slices && post.data.slices.length > 0 && (
              <div className="mt-12">
                <SliceZone slices={post.data.slices} components={components} />
              </div>
            )}

            {/* Author Info */}
            {author && (
              <section className="mt-16 border-t border-border pt-16">
                <h2 className="mb-6 text-2xl font-bold text-foreground">About the Author</h2>
                <div className="rounded-lg bg-card p-6">
                  <AuthorCard author={author} variant="full" />
                </div>
              </section>
            )}

            {/* Related Posts */}
            <RelatedPosts posts={relatedPosts} currentCategoryUid={category} />
          </article>
        </div>
      </div>
    </div>
  )
}
