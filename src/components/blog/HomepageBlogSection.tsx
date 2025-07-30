'use client'

import { useState } from 'react'
import { PostDocument, CategoryDocument } from '../../../prismicio-types'
import { BlogPostsGrid } from './BlogPostsGrid'
import { CategoryFilter } from './CategoryFilter'

interface HomepageBlogSectionProps {
  initialPosts: PostDocument[]
  initialHasMore: boolean
  categories: CategoryDocument[]
}

export function HomepageBlogSection({
  initialPosts,
  initialHasMore,
  categories,
}: HomepageBlogSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredPosts, setFilteredPosts] = useState<PostDocument[]>(initialPosts)
  const [filteredHasMore, setFilteredHasMore] = useState(initialHasMore)

  const handleCategorySelect = async (categoryId: string | null) => {
    setSelectedCategory(categoryId)

    // Fetch filtered posts from the API
    const params = new URLSearchParams({
      page: '1',
      limit: '9',
    })

    if (categoryId) {
      params.append('category', categoryId)
    }

    try {
      const response = await fetch(`/api/posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFilteredPosts(data.posts)
        setFilteredHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      console.error('Error fetching filtered posts:', error)
    }
  }

  return (
    <>
      {/* Category Navigation */}
      <section className="mx-auto mb-12 max-w-5xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Browse by Category
        </h2>
        <CategoryFilter categories={categories} onCategorySelect={handleCategorySelect} />
      </section>

      {/* Blog Posts Grid with Infinite Scroll */}
      <section className="mx-auto max-w-5xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Latest Articles
        </h2>
        <BlogPostsGrid
          initialPosts={filteredPosts}
          initialHasMore={filteredHasMore}
          selectedCategory={selectedCategory}
        />
      </section>
    </>
  )
}
