import { Metadata } from 'next'
import { createClient } from '@/prismicio'
import { BlogCard } from '@/components/blog/BlogCard'
import { CategoryNavigation } from '@/components/blog/CategoryNavigation'
import { extractCategoryData } from '@/lib/prismic-utils'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { ViewAllCategoriesLink } from '@/components/ui/ViewAllCategoriesLink'

// Revalidate every hour
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Code & Creativity Articles | 100 Days of Craft',
    description:
      'Daily articles and insights from 100 Days of Craft. Follow the journey of building, learning, and exploring code and design every day.',
  }
}

export default async function BlogPage() {
  const client = createClient()

  // Fetch all blog posts
  const posts = await client.getAllByType('post', {
    orderings: [
      { field: 'my.post.publication_date', direction: 'desc' },
      { field: 'document.first_publication_date', direction: 'desc' },
    ],
    fetchLinks: ['category.name', 'category.uid'],
  })

  // Fetch all categories
  const categories = await client.getAllByType('category', {
    orderings: [{ field: 'my.category.name', direction: 'asc' }],
  })

  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="mb-8 text-4xl font-bold text-foreground">Blog</h1>
          <p className="text-muted-foreground">No blog posts found.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-6 py-16">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} className="mb-6" />
        <h1 className="mb-12 text-4xl font-bold text-foreground">Blog</h1>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Categories</h2>
              <ViewAllCategoriesLink />
            </div>
            <CategoryNavigation categories={categories} currentCategoryId={undefined} />
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const categoryData = extractCategoryData(post)

            return (
              <BlogCard
                key={post.id}
                uid={post.uid}
                title={post.data.name}
                excerpt={post.data.excerpt}
                image={post.data.image}
                category={{
                  uid: categoryData?.uid || '',
                  name: categoryData?.name || '',
                }}
                date={post.data.publication_date || post.first_publication_date}
              />
            )
          })}
        </div>
      </main>
    </div>
  )
}
