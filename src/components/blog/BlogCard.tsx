'use client'

import Link from 'next/link'
import { PrismicNextImage } from '@prismicio/next'
import { ImageField, KeyTextField, DateField } from '@prismicio/client'
import { Eye } from 'lucide-react'

interface BlogCardProps {
  uid: string
  title: KeyTextField
  excerpt?: KeyTextField
  image: ImageField
  category: {
    uid: string
    name: KeyTextField
  }
  date: DateField | string
}

export function BlogCard({ uid, title, excerpt, image, category, date }: BlogCardProps) {
  const formattedDate = new Date(date || '').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link href={`/blog/${category.uid}/${uid}`} className="group block">
      <article className="space-y-4 rounded-2xl bg-white p-4 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:bg-gray-700">
        {image.url && (
          <div className="relative h-40 w-full overflow-hidden rounded-md">
            <PrismicNextImage field={image} fill className="object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20 dark:group-hover:bg-black/40">
              <div className="flex scale-95 transform items-center gap-2 rounded-lg bg-lochinvar-600 px-4 py-2 font-medium text-white opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                <Eye size={16} />
                Read Me
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {category && (
              <span
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = `/blog/${category.uid}`
                }}
                className="cursor-pointer font-medium text-primary hover:text-primary/80"
              >
                {category.name}
              </span>
            )}
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">{formattedDate}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-card-foreground">{title}</h3>

          {excerpt && (
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-muted-foreground">
              {excerpt}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
