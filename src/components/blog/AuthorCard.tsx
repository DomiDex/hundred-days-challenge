import { PrismicNextImage } from '@prismicio/next'
import { RichTextRenderer } from './RichTextRenderer'
import { AuthorSocialLinks } from './AuthorSocialLinks'
import type { AuthorDocument } from '../../../prismicio-types'
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
      {authorData.avatar?.url && (
        <div className="flex-shrink-0">
          <PrismicNextImage
            field={authorData.avatar}
            width={variant === 'full' ? 100 : 60}
            height={variant === 'full' ? 100 : 60}
            className="rounded-full object-cover"
            fallbackAlt=""
            loading="lazy"
            sizes="(max-width: 768px) 60px, 100px"
          />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground">{authorData.name}</h3>
        {authorData.role && <p className="mb-2 text-sm text-muted-foreground">{authorData.role}</p>}
        {variant === 'full' && (
          <>
            <AuthorSocialLinks
              linkedinLink={authorData.linkedin_link}
              xLink={authorData.x_link}
              githubLink={authorData.github_link}
              websiteLink={authorData.website_link}
              className="mb-3"
            />
            {authorData.bio && (
              <div className="prose prose-sm dark:prose-invert">
                <RichTextRenderer field={authorData.bio} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
