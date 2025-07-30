'use client';

import Link from 'next/link';
import { PrismicNextImage } from '@prismicio/next';
import { ImageField, KeyTextField, DateField } from '@prismicio/client';
import { Eye } from 'lucide-react';

interface BlogCardProps {
  uid: string;
  title: KeyTextField;
  excerpt?: KeyTextField;
  image: ImageField;
  category: {
    uid: string;
    name: KeyTextField;
  };
  date: DateField | string;
}

export function BlogCard({
  uid,
  title,
  excerpt,
  image,
  category,
  date,
}: BlogCardProps) {
  const formattedDate = new Date(date || '').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/blog/${category.uid}/${uid}`} className='block group'>
      <article className='bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-lg space-y-4 hover:shadow-xl transition-shadow duration-300'>
        {image.url && (
          <div className='relative w-full h-40 overflow-hidden rounded-md'>
            <PrismicNextImage field={image} fill className='object-cover' />
            <div className='absolute inset-0 bg-black/0 group-hover:bg-white/50 transition-all duration-300 flex items-center justify-center'>
              <button className='bg-lochinvar-600 hover:bg-lochinvar-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-300'>
                <Eye size={16} />
                Read Me
              </button>
            </div>
          </div>
        )}

        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-sm'>
            {category && (
              <span
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/blog/${category.uid}`;
                }}
                className='text-primary hover:text-primary/80 font-medium cursor-pointer'
              >
                {category.name}
              </span>
            )}
            <span className='text-gray-400'>•</span>
            <span className='text-gray-600 dark:text-gray-400'>
              {formattedDate}
            </span>
          </div>

          <h3 className='text-lg font-bold text-slate-800 dark:text-card-foreground'>
            {title}
          </h3>

          {excerpt && (
            <p className='text-sm text-gray-600 dark:text-muted-foreground line-clamp-2'>
              {excerpt}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
