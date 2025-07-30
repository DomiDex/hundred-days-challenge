import { Metadata } from 'next';
import { createClient } from '@/prismicio';
import { HomepageBlogSection } from '@/components/blog/HomepageBlogSection';
import { Hero } from '@/components/Hero';
import * as prismic from '@prismicio/client';
import type { PostDocument } from '../../prismicio-types';

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client.getSingle('homepage').catch(() => null);

  if (!page) {
    return {
      title: 'Blog - Hundred Days Challenge',
      description:
        'Welcome to our blog featuring articles on web development, technology, and more.',
    };
  }

  return {
    title: page.data.meta_title || 'Blog - Hundred Days Challenge',
    description:
      page.data.meta_description ||
      'Welcome to our blog featuring articles on web development, technology, and more.',
    openGraph: {
      title: page.data.og_title || page.data.meta_title || 'Blog - Hundred Days Challenge',
      description: page.data.og_description || page.data.meta_description || undefined,
      images: page.data.og_image?.url
        ? [{ url: page.data.og_image.url }]
        : undefined,
    },
  };
}

export default async function Home() {
  const client = createClient();

  // Fetch initial blog posts
  const postsResponse = await client.get({
    filters: [prismic.filter.at('document.type', 'post')],
    pageSize: 9,
    page: 1,
    orderings: [
      { field: 'document.first_publication_date', direction: 'desc' },
    ],
    fetchLinks: ['category.name', 'category.uid', 'author.name', 'author.avatar'],
  });

  // Fetch all categories
  const categories = await client.getAllByType('category', {
    orderings: [{ field: 'my.category.title', direction: 'asc' }],
  });

  const posts = postsResponse.results as PostDocument[];
  const hasMore = postsResponse.page < postsResponse.total_pages;

  return (
    <main className='min-h-screen'>
      {/* Hero Section */}
      <Hero />

      {/* Main Blog Content */}
      <div className='container mx-auto px-4 py-8'>
        <HomepageBlogSection
          initialPosts={posts}
          initialHasMore={hasMore}
          categories={categories}
        />
      </div>
    </main>
  );
}
