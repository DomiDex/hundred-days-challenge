import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/prismicio'
import { PrismicNextImage } from '@prismicio/next'
import { RichTextRenderer } from '@/components/blog/RichTextRenderer'
import { AuthorSocialLinks } from '@/components/blog/AuthorSocialLinks'
import { generateSEOMetadata } from '@/components/SEO'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import Link from 'next/link'
import * as prismic from '@prismicio/client'
import type { AuthorDocument } from '../../../../prismicio-types'
import { extractCategoryData } from '@/lib/prismic-utils'
import { getAuthorData } from '@/lib/prismic-helpers'
import { BlogCard } from '@/components/blog/BlogCard'

// Temporary type extension for posts with author field
type ExtendedPost = {
  data: {
    author?: prismic.ContentRelationshipField
    [key: string]: unknown
  }
  [key: string]: unknown
}

type Props = {
  params: Promise<{ uid: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params
  const client = createClient()

  try {
    const author = await client.getByUID('author' as 'page', uid)
    const authorData = getAuthorData(author)
    if (!authorData) {
      throw new Error('Author data not found')
    }
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/authors/${uid}`

    return generateSEOMetadata({
      data: {
        meta_title: authorData.meta_title,
        meta_description: authorData.meta_description,
        og_title: authorData.og_title,
        og_description: authorData.og_description,
        og_image: authorData.og_image,
        twitter_card: authorData.twitter_card,
        canonical_url: authorData.canonical_url,
        robots: authorData.robots,
      },
      fallbackTitle: authorData.name || 'Author',
      fallbackDescription: authorData.role || '',
      url,
    })
  } catch {
    return {
      title: 'Author Not Found',
      description: 'The requested author could not be found',
    }
  }
}

export async function generateStaticParams() {
  const client = createClient()
  const authors = (await client.getAllByType('author' as 'page')) as unknown as AuthorDocument[]

  return authors.map((author) => ({
    uid: author.uid,
  }))
}

export default async function AuthorPage({ params }: Props) {
  const { uid } = await params
  const client = createClient()

  // Fetch the author
  let author: AuthorDocument
  try {
    author = (await client.getByUID('author' as 'page', uid)) as unknown as AuthorDocument
  } catch {
    notFound()
  }

  // Fetch all posts by this author
  const allPosts = await client.getAllByType('post', {
    orderings: [
      { field: 'my.post.publication_date', direction: 'desc' },
      { field: 'document.first_publication_date', direction: 'desc' },
    ],
    fetchLinks: ['category.name', 'category.uid', 'author.name'],
  })

  // Filter posts by this author
  const authorPosts = allPosts.filter((post) => {
    const extendedPost = post as unknown as ExtendedPost
    if (
      !extendedPost.data.author ||
      !prismic.isFilled.contentRelationship(extendedPost.data.author)
    )
      return false
    return extendedPost.data.author.id === author.id
  })

  // Get author data safely
  const authorData = getAuthorData(author)
  if (!authorData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-6 py-16">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Authors', href: '/authors' },
            { label: authorData.name || '' },
          ]}
          className="mb-6"
        />

        {/* Author Header */}
        <div className="mb-12">
          <div className="flex flex-col items-start gap-8 md:flex-row">
            {authorData.avatar.url && (
              <div className="flex-shrink-0">
                <PrismicNextImage
                  field={authorData.avatar}
                  width={200}
                  height={200}
                  className="rounded-full object-cover"
                  fallbackAlt=""
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="mb-2 text-4xl font-bold text-foreground">{authorData.name || ''}</h1>
              {authorData.role && (
                <p className="mb-4 text-xl text-muted-foreground">{authorData.role}</p>
              )}
              <AuthorSocialLinks
                linkedinLink={authorData.linkedin_link}
                xLink={authorData.x_link}
                githubLink={authorData.github_link}
                websiteLink={authorData.website_link}
                className="mb-6"
              />
              {authorData.bio && (
                <div className="prose prose-lg dark:prose-invert">
                  <RichTextRenderer field={authorData.bio} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Author's Posts */}
        <section className="mt-16 border-t border-border pt-16">
          <h2 className="mb-8 text-2xl font-bold text-foreground">
            Posts by {authorData.name || 'Author'}
          </h2>

          {authorPosts.length === 0 ? (
            <p className="text-muted-foreground">No posts found by this author.</p>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {authorPosts.map((post) => {
                const categoryData = extractCategoryData(post)
                const categorySlug = categoryData?.uid || 'uncategorized'

                return (
                  <BlogCard
                    key={post.id}
                    uid={post.uid}
                    title={post.data.name}
                    excerpt={post.data.excerpt}
                    image={post.data.image}
                    category={{
                      uid: categorySlug,
                      name: categoryData?.name || '',
                    }}
                    date={post.data.publication_date || post.first_publication_date}
                  />
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
