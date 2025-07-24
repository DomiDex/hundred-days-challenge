import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/prismicio';
import { PrismicNextImage } from '@prismicio/next';
import Link from 'next/link';
import { filterPostsByCategory } from '@/lib/prismic-utils';
import { RichTextRenderer } from '@/components/blog/RichTextRenderer';

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const client = createClient();

  try {
    const categoryDoc = await client.getByUID('category', category);

    return {
      title: categoryDoc.data.meta_title || `${categoryDoc.data.name} | Blog`,
      description:
        categoryDoc.data.meta_description ||
        `Browse all ${categoryDoc.data.name} posts`,
    };
  } catch {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found',
    };
  }
}

export async function generateStaticParams() {
  const client = createClient();
  const categories = await client.getAllByType('category');

  return categories.map((category) => ({
    category: category.uid,
  }));
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;
  const client = createClient();

  // Fetch the category
  let category;
  try {
    category = await client.getByUID('category', categorySlug);
  } catch {
    notFound();
  }

  // Fetch posts in this category
  // Note: Prismic's REST API has limitations when filtering by content relationships.
  // The filter.at("my.post.category", categoryId) syntax should work but may throw
  // "unexpected field" errors in some configurations. As a workaround, we fetch
  // all posts and filter client-side.
  //
  // Alternative solutions:
  // 1. Use Prismic's GraphQL API which has better support for relationship filtering
  // 2. Store the category UID directly in the post document as a separate field
  // 3. Use Prismic's Integration Fields to sync category data

  const allPosts = await client.getAllByType('post', {
    orderings: [
      { field: 'my.post.publication_date', direction: 'desc' },
      { field: 'document.first_publication_date', direction: 'desc' },
    ],
    fetchLinks: ['category.name', 'category.uid'],
  });

  // Filter posts that belong to this category
  const posts = filterPostsByCategory(allPosts, category.id);

  // Fetch all categories for navigation
  const allCategories = await client.getAllByType('category', {
    orderings: [{ field: 'my.category.name', direction: 'asc' }],
  });

  return (
    <div className='min-h-screen bg-background'>
      <main className='max-w-5xl mx-auto px-6 py-16'>
        {/* Category Header */}
        <div className='mb-12'>
          <h1 className='text-4xl font-bold text-foreground mb-6'>
            {category.data.name}
          </h1>
          {category.data.image.url && (
            <div className='relative h-64 w-full rounded-2xl overflow-hidden mb-8'>
              <PrismicNextImage
                field={category.data.image}
                fill
                className='object-cover'
              />
            </div>
          )}
        </div>

        {/* Categories Navigation */}
        <div className='mb-12'>
          <h2 className='text-xl font-semibold text-foreground mb-4'>
            Categories
          </h2>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/blog'
              className='px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors'
            >
              All Posts
            </Link>
            {allCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog/${cat.uid}`}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  cat.id === category.id
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                }`}
              >
                {cat.data.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Blog Posts */}
        {posts.length === 0 ? (
          <p className='text-muted-foreground'>
            No posts found in this category.
          </p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {posts.map((post) => (
              <article
                key={post.id}
                className='bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow'
              >
                {post.data.image.url && (
                  <Link href={`/blog/${categorySlug}/${post.uid}`}>
                    <div className='relative h-48 w-full'>
                      <PrismicNextImage
                        field={post.data.image}
                        fill
                        className='object-cover'
                      />
                    </div>
                  </Link>
                )}
                <div className='p-6'>
                  <h2 className='text-xl font-semibold text-card-foreground mb-2'>
                    <Link
                      href={`/blog/${categorySlug}/${post.uid}`}
                      className='hover:text-primary transition-colors'
                    >
                      {post.data.name}
                    </Link>
                  </h2>
                  {post.data.excerpt && (
                    <p className='text-muted-foreground line-clamp-3'>
                      {post.data.excerpt}
                    </p>
                  )}
                  <div className='mt-4 text-sm text-muted-foreground'>
                    {new Date(
                      post.data.publication_date || post.first_publication_date
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Rich Text Content */}
        {category.data.content && category.data.content.length > 0 && (
          <div className='mt-16 prose prose-lg dark:prose-invert max-w-none'>
            <RichTextRenderer field={category.data.content} />
          </div>
        )}
      </main>
    </div>
  );
}
