'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { CategoryDocument } from '../../../prismicio-types'

interface CategoryNavigationProps {
  categories: CategoryDocument[]
  currentCategoryId?: string
  className?: string
}

export function CategoryNavigation({
  categories,
  currentCategoryId,
  className,
}: CategoryNavigationProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Link
        href="/blog"
        className={cn(
          'rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
          !currentCategoryId
            ? 'border-primary bg-primary text-primary-foreground hover:shadow-md hover:brightness-110 dark:hover:brightness-75'
            : 'border-border bg-secondary/50 text-foreground hover:bg-secondary/70 dark:hover:bg-secondary/30'
        )}
      >
        All Posts
      </Link>
      {categories.map((category) => {
        const isActive = category.id === currentCategoryId

        return (
          <Link
            key={category.id}
            href={`/blog/${category.uid}`}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'border-primary bg-primary text-primary-foreground hover:shadow-md hover:brightness-110 dark:hover:brightness-75'
                : 'border-border bg-secondary/50 text-foreground hover:bg-secondary/70 dark:hover:bg-secondary/30'
            )}
          >
            {category.data.name}
          </Link>
        )
      })}
    </div>
  )
}
