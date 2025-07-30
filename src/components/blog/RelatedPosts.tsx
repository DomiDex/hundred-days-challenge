import Link from 'next/link'
import { PrismicNextImage } from '@prismicio/next'
import { ArrowRight } from 'lucide-react'
import type { PostDocument } from '../../../prismicio-types'
import { extractCategoryData } from '@/lib/prismic-utils'

interface RelatedPostsProps {
  posts: PostDocument[]
  currentCategoryUid: string
}

export function RelatedPosts({ posts, currentCategoryUid }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className="mt-16 border-t border-border pt-16">
      <h2 className="mb-8 text-2xl font-bold text-foreground">Related Posts</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const categoryData = extractCategoryData(post)
          const categoryUid = categoryData?.uid || currentCategoryUid

          return (
            <article
              key={post.id}
              className="group overflow-hidden rounded-xl bg-card shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              {post.data.image.url && (
                <Link href={`/blog/${categoryUid}/${post.uid}`}>
                  <div className="relative h-48 w-full overflow-hidden">
                    <PrismicNextImage
                      field={post.data.image}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
              )}
              <div className="p-6">
                <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  <Link href={`/blog/${categoryUid}/${post.uid}`}>{post.data.name}</Link>
                </h3>
                {post.data.excerpt && (
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {post.data.excerpt}
                  </p>
                )}
                <Link
                  href={`/blog/${categoryUid}/${post.uid}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Read More
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
