import { PrismicNextImage } from '@prismicio/next'
import { RichTextRenderer } from './RichTextRenderer'
import type { AuthorDocument } from '@/types/author-types'
import { getAuthorData } from '@/lib/prismic-helpers'

interface AuthorCardProps {
  author: AuthorDocument
  variant?: 'full' | 'compact'
  className?: string
}

export function AuthorCard({ author, variant = 'compact', className = '' }: AuthorCardProps) {
  const authorData = getAuthorData(author)
  if (!authorData) return null

  return (
    <div className={`flex gap-4 ${className}`}>
      {authorData.avatar.url && (
        <div className="flex-shrink-0">
          <PrismicNextImage
            field={authorData.avatar}
            width={variant === 'full' ? 100 : 60}
            height={variant === 'full' ? 100 : 60}
            className="rounded-full object-cover"
          />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground">{authorData.name}</h3>
        {authorData.role && <p className="mb-2 text-sm text-muted-foreground">{authorData.role}</p>}
        {variant === 'full' && authorData.bio && (
          <div className="prose prose-sm dark:prose-invert">
            <RichTextRenderer field={authorData.bio} />
          </div>
        )}
      </div>
    </div>
  )
}
