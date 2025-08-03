import { NextResponse } from 'next/server'
import { createClient } from '@/prismicio'
import { extractCategoryData } from '@/lib/prismic-utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || 'test'
  const category = searchParams.get('category') || 'motion-interactions'
  
  try {
    const client = createClient()
    
    // Step 1: Fetch the post
    let post = null
    let postError = null
    try {
      post = await client.getByUID('post', slug, {
        fetchLinks: ['category.name', 'category.uid'],
      })
    } catch (e) {
      postError = e instanceof Error ? e.message : 'Unknown error fetching post'
    }
    
    // Step 2: Extract category data if post exists
    let categoryData = null
    if (post) {
      categoryData = extractCategoryData(post)
    }
    
    // Step 3: Verify category matches
    const categoryMatches = categoryData?.uid === category
    
    return NextResponse.json({
      success: !!post,
      params: { slug, category },
      post: post ? {
        exists: true,
        uid: post.uid,
        name: post.data.name,
        categoryField: post.data.category,
      } : { exists: false, error: postError },
      categoryData: categoryData,
      categoryMatches,
      debug: {
        expectedCategory: category,
        actualCategory: categoryData?.uid || 'none',
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}