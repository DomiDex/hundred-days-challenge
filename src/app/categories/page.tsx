import { Metadata } from 'next';
import { createClient } from '@/prismicio';
import { CategoryCard } from '@/components/blog/CategoryCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { getCategoryData } from '@/lib/prismic-helpers';

export const metadata: Metadata = {
  title: 'Categories | Blog',
  description: 'Browse all blog categories',
};

export default async function CategoriesPage() {
  const client = createClient();

  // Fetch all categories
  const categories = await client.getAllByType('category', {
    orderings: [{ field: 'my.category.name', direction: 'asc' }],
  });

  // Fetch all posts to count posts per category
  const posts = await client.getAllByType('post', {
    fetchLinks: ['category.uid'],
  });

  // Count posts per category
  const postCountByCategory = new Map<string, number>();
  posts.forEach((post) => {
    if (post.data.category && 'id' in post.data.category) {
      const categoryId = post.data.category.id;
      postCountByCategory.set(
        categoryId,
        (postCountByCategory.get(categoryId) || 0) + 1
      );
    }
  });

  return (
    <div className='min-h-screen bg-background'>
      <main className='max-w-5xl mx-auto px-6 py-16'>
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Categories' }
          ]}
          className='mb-6'
        />
        <div className='mb-12'>
          <h1 className='text-4xl font-bold text-foreground mb-4'>
            Blog Categories
          </h1>
          <p className='text-xl text-muted-foreground'>
            Explore our content organized by topics
          </p>
        </div>

        {categories.length === 0 ? (
          <p className='text-muted-foreground'>No categories found.</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {categories.map((category) => {
              const categoryData = getCategoryData(category);
              if (!categoryData) return null;
              return (
                <CategoryCard
                  key={category.id}
                  uid={category.uid}
                  name={categoryData.name}
                  description={categoryData.description}
                  image={categoryData.image}
                  postCount={postCountByCategory.get(category.id) || 0}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}