'use client'

import Link from 'next/link'
import { PrismicNextImage } from '@prismicio/next'
import { ImageField, KeyTextField } from '@prismicio/client'
import { Eye } from 'lucide-react'

interface CategoryCardProps {
  uid: string
  name: KeyTextField
  description?: KeyTextField
  image: ImageField
  postCount?: number
}

export function CategoryCard({ uid, name, description, image, postCount = 0 }: CategoryCardProps) {
  return (
    <Link href={`/blog/${uid}`} className="group block">
      <article className="space-y-4 rounded-2xl bg-white p-4 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:bg-gray-700">
        {image.url && (
          <div className="relative h-40 w-full overflow-hidden rounded-md">
            <PrismicNextImage field={image} fill className="object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-white/50">
              <button className="flex scale-95 transform items-center gap-2 rounded-lg bg-lochinvar-600 px-4 py-2 font-medium text-white opacity-0 transition-all duration-300 hover:bg-lochinvar-700 group-hover:scale-100 group-hover:opacity-100">
                <Eye size={16} />
                View Category
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-card-foreground">{name}</h3>

          {description && (
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-muted-foreground">
              {description}
            </p>
          )}

          {postCount !== undefined && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {postCount} {postCount === 1 ? 'post' : 'posts'}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
