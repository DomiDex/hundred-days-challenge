'use client'

import { useTableOfContents } from '@/hooks/useTableOfContents'
import { ToCHeading } from '@/lib/toc-utils'
import { TableOfContentsItem } from './TableOfContentsItem'
import { cn } from '@/lib/utils'

interface TableOfContentsProps {
  headings: ToCHeading[]
  className?: string
}

export function TableOfContents({ headings, className }: TableOfContentsProps) {
  const { activeId, scrollToSection } = useTableOfContents(headings)

  if (headings.length === 0) {
    return null
  }

  return (
    <nav
      className={cn(
        'sticky top-24 hidden h-[calc(100vh-8rem)] overflow-y-auto xl:block',
        className
      )}
      aria-label="Table of contents"
    >
      <div className="pl-4 pr-8">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Table of Contents
        </h2>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <TableOfContentsItem
              key={heading.id}
              heading={heading}
              activeId={activeId}
              onItemClick={scrollToSection}
            />
          ))}
        </ul>
      </div>
    </nav>
  )
}
