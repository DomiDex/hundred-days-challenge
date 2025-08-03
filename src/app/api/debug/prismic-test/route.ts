import { NextResponse } from 'next/server'
import { createClient } from '@/prismicio'

export async function GET() {
  try {
    const client = createClient()

    // Test 1: Can we connect to Prismic?
    const repositoryInfo = await client.getRepository()

    // Test 2: Can we fetch the test post?
    let testPost = null
    try {
      testPost = await client.getByUID('post', 'test')
    } catch {
      // Post not found
    }

    // Test 3: Can we fetch categories?
    const categories = await client.getAllByType('category')

    // Test 4: Environment variables
    const env = {
      NEXT_PUBLIC_PRISMIC_ENVIRONMENT: process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || 'not set',
      PRISMIC_ACCESS_TOKEN: process.env.PRISMIC_ACCESS_TOKEN ? 'set' : 'not set',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL || 'not set',
    }

    return NextResponse.json({
      success: true,
      repository: {
        refs: repositoryInfo.refs.map((r) => r.label),
        languages: repositoryInfo.languages.map((l) => l.id),
      },
      testPost: testPost
        ? {
            exists: true,
            uid: testPost.uid,
            name: testPost.data.name,
            hasCategory: !!testPost.data.category,
          }
        : { exists: false },
      categoriesCount: categories.length,
      environment: env,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
