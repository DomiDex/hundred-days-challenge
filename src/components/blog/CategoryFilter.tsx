'use client';

import { useState } from 'react';
import { CategoryDocument } from '../../../prismicio-types';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: CategoryDocument[];
  onCategorySelect: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, onCategorySelect }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    onCategorySelect(categoryId);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => handleCategoryClick(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          "border border-gray-300 dark:border-gray-600",
          "hover:scale-105 hover:shadow-md",
          selectedCategory === null
            ? "bg-primary text-white border-primary"
            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        )}
      >
        All Categories
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            "border border-gray-300 dark:border-gray-600",
            "hover:scale-105 hover:shadow-md",
            selectedCategory === category.id
              ? "bg-primary text-white border-primary"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          )}
        >
          {category.data.name}
        </button>
      ))}
    </div>
  );
}