'use client'

import { useState } from 'react'
import { CategoryDocument } from '../../../prismicio-types'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: CategoryDocument[]
  onCategorySelect: (categoryId: string | null) => void
}

export function CategoryFilter({ categories, onCategorySelect }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    onCategorySelect(categoryId)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => handleCategoryClick(null)}
        className={cn(
          'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
          'border border-gray-300 dark:border-gray-600',
          'hover:scale-105 hover:shadow-md',
          selectedCategory === null
            ? 'border-primary bg-primary text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        )}
      >
        All Categories
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
            'border border-gray-300 dark:border-gray-600',
            'hover:scale-105 hover:shadow-md',
            selectedCategory === category.id
              ? 'border-primary bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
        >
          {category.data.name}
        </button>
      ))}
    </div>
  )
}
