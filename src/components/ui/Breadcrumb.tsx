import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={`${className}`}>
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />}

              {isLast || !item.href ? (
                <span className="max-w-[200px] truncate font-medium text-gray-600 dark:text-gray-400 sm:max-w-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="max-w-[200px] truncate text-gray-600 transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary sm:max-w-none"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
