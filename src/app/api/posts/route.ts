import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/prismicio'
import * as prismic from '@prismicio/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('limit') || '9')
    const category = searchParams.get('category')

    const client = createClient()

    const filters = [prismic.filter.at('document.type', 'post')]

    if (category) {
      filters.push(prismic.filter.at('my.post.category', category))
    }

    const response = await client.get({
      filters,
      pageSize,
      page,
      orderings: [{ field: 'document.first_publication_date', direction: 'desc' }],
      fetchLinks: ['category.name', 'category.uid', 'author.name', 'author.avatar'],
    })

    const posts = response.results
    const hasMore = page < response.total_pages
    const totalPages = response.total_pages
    const totalResults = response.total_results_size

    return NextResponse.json({
      posts,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalResults,
        hasMore,
      },
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
