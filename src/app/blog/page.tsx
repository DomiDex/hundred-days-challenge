import { Metadata } from 'next';
import { createClient } from '@/prismicio';
import Link from 'next/link';
import { BlogCard } from '@/components/blog/BlogCard';
import { extractCategoryData } from '@/lib/prismic-utils';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Blog | Your Site Name',
    description: 'Read our latest blog posts',
  };
}

export default async function BlogPage() {
  const client = createClient();

  // Fetch all blog posts
  const posts = await client.getAllByType('post', {
    orderings: [
      { field: 'my.post.publication_date', direction: 'desc' },
      { field: 'document.first_publication_date', direction: 'desc' },
    ],
    fetchLinks: ['category.name', 'category.uid'],
  });

  // Fetch all categories
  const categories = await client.getAllByType('category', {
    orderings: [{ field: 'my.category.name', direction: 'asc' }],
  });

  if (!posts || posts.length === 0) {
    return (
      <div className='min-h-screen bg-background'>
        <main className='max-w-4xl mx-auto px-6 py-16'>
          <h1 className='text-4xl font-bold text-foreground mb-8'>Blog</h1>
          <p className='text-muted-foreground'>No blog posts found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <main className='max-w-5xl mx-auto px-6 py-16'>
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog' }
          ]}
          className='mb-6'
        />
        <h1 className='text-4xl font-bold text-foreground mb-12'>Blog</h1>

        {/* Categories */}
        {categories.length > 0 && (
          <div className='mb-12'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold text-foreground'>
                Categories
              </h2>
              <Link
                href='/categories'
                className='text-sm text-primary hover:text-primary/80 font-medium'
              >
                View All Categories →
              </Link>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Link
                href='/blog'
                className='px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'
              >
                All Posts
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/${category.uid}`}
                  className='px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors'
                >
                  {category.data.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {posts.map((post) => {
            const categoryData = extractCategoryData(post);

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
            );
          })}
        </div>
      </main>
    </div>
  );
}
