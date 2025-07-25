import Link from 'next/link';
import { PrismicNextImage } from '@prismicio/next';
import { ArrowRight } from 'lucide-react';
import type { PostDocument } from '../../../prismicio-types';
import { extractCategoryData } from '@/lib/prismic-utils';

interface RelatedPostsProps {
  posts: PostDocument[];
  currentCategoryUid: string;
}

export function RelatedPosts({ posts, currentCategoryUid }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 pt-16 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground mb-8">
        Related Posts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          const categoryData = extractCategoryData(post);
          const categoryUid = categoryData?.uid || currentCategoryUid;
          
          return (
            <article
              key={post.id}
              className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {post.data.image.url && (
                <Link href={`/blog/${categoryUid}/${post.uid}`}>
                  <div className="relative w-full h-48 overflow-hidden">
                    <PrismicNextImage
                      field={post.data.image}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  <Link href={`/blog/${categoryUid}/${post.uid}`}>
                    {post.data.name}
                  </Link>
                </h3>
                {post.data.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {post.data.excerpt}
                  </p>
                )}
                <Link
                  href={`/blog/${categoryUid}/${post.uid}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Read More
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}