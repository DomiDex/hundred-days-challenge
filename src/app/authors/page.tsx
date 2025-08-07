import { Metadata } from 'next'
import { createClient } from '@/prismicio'
import { PrismicNextImage } from '@prismicio/next'
import Link from 'next/link'
import { AuthorSocialLinks } from '@/components/blog/AuthorSocialLinks'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import type { AuthorDocument } from '../../../prismicio-types'
import { getAuthorData } from '@/lib/prismic-helpers'

// No need for extended types since AuthorDocument already has all fields

export const metadata: Metadata = {
  title: 'Authors | Blog',
  description: 'Meet our talented authors and contributors',
}

export default async function AuthorsPage() {
  const client = createClient()
  const authors = (await client.getAllByType('author', {
    orderings: [{ field: 'my.author.name', direction: 'asc' }],
  })) as unknown as AuthorDocument[]

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-6 py-16">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Authors' }]} className="mb-6" />
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Our Authors</h1>
          <p className="text-xl text-muted-foreground">
            Meet the talented writers and contributors behind our content.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {authors.map((author) => {
            const authorData = getAuthorData(author)
            if (!authorData) return null
            return (
              <article
                key={author.id}
                className="rounded-lg bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <Link href={`/authors/${author.uid}`}>
                  <div className="mb-4 flex gap-4">
                    {authorData.avatar.url && (
                      <div className="flex-shrink-0">
                        <PrismicNextImage
                          field={authorData.avatar}
                          width={80}
                          height={80}
                          className="rounded-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-card-foreground transition-colors hover:text-primary">
                        {authorData.name || ''}
                      </h2>
                      {authorData.role && (
                        <p className="text-muted-foreground">{authorData.role}</p>
                      )}
                    </div>
                  </div>
                </Link>
                <AuthorSocialLinks
                  linkedinLink={authorData.linkedin_link}
                  xLink={authorData.x_link}
                  githubLink={authorData.github_link}
                  className="mt-4"
                />
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}
