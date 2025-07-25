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

        {/* SEO Content Section */}
        <section className='mt-16 pt-16 border-t border-border'>
          <div className='prose prose-lg dark:prose-invert max-w-none'>
            <h2 className='text-2xl font-bold text-foreground mb-6'>
              Discover Our Content Categories
            </h2>
            <p className='text-muted-foreground mb-4'>
              Our blog is organized into carefully curated categories to help you find the content that matters most to you. 
              Whether you&apos;re interested in web development, design patterns, motion graphics, or interactive experiences, 
              we&apos;ve got you covered.
            </p>
            <p className='text-muted-foreground mb-4'>
              Each category represents a unique aspect of modern web development and digital creativity. From cutting-edge 
              animation techniques to best practices in user interface design, our categories serve as gateways to 
              in-depth tutorials, case studies, and industry insights.
            </p>
            <h3 className='text-xl font-semibold text-foreground mt-8 mb-4'>
              Why Explore by Category?
            </h3>
            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-6'>
              <li>
                <strong className='text-foreground'>Focused Learning:</strong> Dive deep into specific topics without distractions
              </li>
              <li>
                <strong className='text-foreground'>Progressive Content:</strong> Follow a natural learning path within each category
              </li>
              <li>
                <strong className='text-foreground'>Stay Updated:</strong> Easily track new posts in your areas of interest
              </li>
              <li>
                <strong className='text-foreground'>Expert Insights:</strong> Access specialized knowledge from industry professionals
              </li>
            </ul>
            <p className='text-muted-foreground'>
              Start exploring our categories today and enhance your skills in web development, creative coding, 
              and digital design. Each post is crafted with care to provide practical value and inspire your next project.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}