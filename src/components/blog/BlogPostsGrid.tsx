'use client';

import { useState, useCallback, useEffect } from 'react';
import { PostDocument } from '../../../prismicio-types';
import { BlogCard } from './BlogCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Loader2 } from 'lucide-react';
import { extractCategoryData } from '@/lib/prismic-utils';

interface BlogPostsGridProps {
  initialPosts: PostDocument[];
  initialHasMore: boolean;
  selectedCategory?: string | null;
}

export function BlogPostsGrid({ 
  initialPosts, 
  initialHasMore,
  selectedCategory 
}: BlogPostsGridProps) {
  const [posts, setPosts] = useState<PostDocument[]>(initialPosts);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
    setPage(2);
    setHasMore(initialHasMore);
    setError(null);
  }, [initialPosts, initialHasMore, selectedCategory]);

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/posts?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      
      setPosts(prev => [...prev, ...data.posts]);
      setHasMore(data.pagination.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, selectedCategory]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMorePosts,
    hasMore,
    loading,
    threshold: 200,
  });

  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No posts found{selectedCategory ? ' in this category' : ''}.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={loadMorePosts}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      <div ref={loadMoreRef} className="py-8 text-center">
        {loading && (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-gray-600 dark:text-gray-400">
              Loading more posts...
            </span>
          </div>
        )}
        
        {!hasMore && posts.length > 0 && !loading && (
          <p className="text-gray-500 dark:text-gray-400">
            You&apos;ve reached the end of the posts.
          </p>
        )}
      </div>
    </>
  );
}