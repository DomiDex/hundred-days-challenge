'use client';

import Link from 'next/link';
import { PrismicNextImage } from '@prismicio/next';
import { ImageField, KeyTextField } from '@prismicio/client';
import { Eye } from 'lucide-react';

interface CategoryCardProps {
  uid: string;
  name: KeyTextField;
  description?: KeyTextField;
  image: ImageField;
  postCount?: number;
}

export function CategoryCard({
  uid,
  name,
  description,
  image,
  postCount = 0,
}: CategoryCardProps) {
  return (
    <Link href={`/blog/${uid}`} className='block group'>
      <article className='bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-lg space-y-4 hover:shadow-xl transition-shadow duration-300'>
        {image.url && (
          <div className='relative w-full h-40 overflow-hidden rounded-md'>
            <PrismicNextImage field={image} fill className='object-cover' />
            <div className='absolute inset-0 bg-black/0 group-hover:bg-white/50 transition-all duration-300 flex items-center justify-center'>
              <button className='bg-lochinvar-600 hover:bg-lochinvar-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-300'>
                <Eye size={16} />
                View Category
              </button>
            </div>
          </div>
        )}

        <div className='space-y-2'>
          <h3 className='text-lg font-bold text-slate-800 dark:text-card-foreground'>
            {name}
          </h3>

          {description && (
            <p className='text-sm text-gray-600 dark:text-muted-foreground line-clamp-2'>
              {description}
            </p>
          )}

          {postCount !== undefined && (
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {postCount} {postCount === 1 ? 'post' : 'posts'}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
