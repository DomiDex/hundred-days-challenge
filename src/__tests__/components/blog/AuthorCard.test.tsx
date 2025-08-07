import React from 'react'
import { render, screen } from '@/test-utils'
import { AuthorCard } from '@/components/blog/AuthorCard'
import { createMockAuthor } from '@/test-utils/mocks'
import type { AuthorDocument } from '../../../../prismicio-types'
import { createEmptyImageField } from '@/test-utils/mock-factories'

interface MockImageProps {
  field?: { url?: string; alt?: string }
  width?: number
  height?: number
  className?: string
  fallbackAlt?: string
}

jest.mock('@prismicio/next', () => ({
  PrismicNextImage: ({ field, width, height, className, fallbackAlt }: MockImageProps) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={field?.url}
      width={width}
      height={height}
      className={className}
      alt={fallbackAlt || field?.alt || ''}
      data-testid="author-avatar"
    />
  ),
}))

interface MockRichTextProps {
  field: unknown
}

jest.mock('@/components/blog/RichTextRenderer', () => ({
  RichTextRenderer: ({ field }: MockRichTextProps) => (
    <div data-testid="rich-text">{JSON.stringify(field)}</div>
  ),
}))

interface MockSocialLinksProps {
  linkedinLink?: { url: string }
  xLink?: { url: string }
  githubLink?: { url: string }
  websiteLink?: { url: string }
  className?: string
}

jest.mock('@/components/blog/AuthorSocialLinks', () => ({
  AuthorSocialLinks: ({
    linkedinLink,
    xLink,
    githubLink,
    websiteLink,
    className,
  }: MockSocialLinksProps) => (
    <div data-testid="social-links" className={className}>
      {linkedinLink && <a href={linkedinLink.url}>LinkedIn</a>}
      {xLink && <a href={xLink.url}>X</a>}
      {githubLink && <a href={githubLink.url}>GitHub</a>}
      {websiteLink && <a href={websiteLink.url}>Website</a>}
    </div>
  ),
}))

describe('AuthorCard', () => {
  it('renders correctly with compact variant', () => {
    const mockAuthor = createMockAuthor()
    render(<AuthorCard author={mockAuthor} />)

    expect(screen.getByText('Test Author')).toBeInTheDocument()
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
    expect(screen.getByTestId('author-avatar')).toHaveAttribute('width', '60')
    expect(screen.queryByTestId('social-links')).not.toBeInTheDocument()
    expect(screen.queryByTestId('rich-text')).not.toBeInTheDocument()
  })

  it('renders correctly with full variant', () => {
    const mockAuthor = createMockAuthor()
    render(<AuthorCard author={mockAuthor} variant="full" />)

    expect(screen.getByText('Test Author')).toBeInTheDocument()
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
    expect(screen.getByTestId('author-avatar')).toHaveAttribute('width', '100')
    expect(screen.getByTestId('social-links')).toBeInTheDocument()
    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
  })

  it('renders without avatar when missing', () => {
    const baseAuthor = createMockAuthor()
    const mockAuthor = createMockAuthor({
      data: {
        ...baseAuthor.data,
        avatar: createEmptyImageField<'thumbnail'>(),
      },
    })
    render(<AuthorCard author={mockAuthor} />)

    expect(screen.getByText('Test Author')).toBeInTheDocument()
    expect(screen.queryByTestId('author-avatar')).not.toBeInTheDocument()
  })

  it('renders without role when missing', () => {
    const baseAuthor = createMockAuthor()
    const mockAuthor = createMockAuthor({
      data: {
        ...baseAuthor.data,
        role: null,
      } as AuthorDocument['data'],
    })
    render(<AuthorCard author={mockAuthor} />)

    expect(screen.getByText('Test Author')).toBeInTheDocument()
    expect(screen.queryByText('Senior Developer')).not.toBeInTheDocument()
  })

  it('returns null when author data is invalid', () => {
    // Create a mock author with invalid structure
    const invalidAuthor = {
      ...createMockAuthor(),
      data: null, // This will make getAuthorData return null
    } as unknown as AuthorDocument

    const { container } = render(<AuthorCard author={invalidAuthor} />)

    expect(container.firstChild).toBeNull()
  })

  it('applies custom className', () => {
    const mockAuthor = createMockAuthor()
    render(<AuthorCard author={mockAuthor} className="custom-class" />)

    const card = screen.getByText('Test Author').closest('div')?.parentElement
    expect(card).toHaveClass('custom-class')
  })

  it('renders bio only in full variant', () => {
    const mockAuthor = createMockAuthor()

    const { rerender } = render(<AuthorCard author={mockAuthor} variant="compact" />)
    expect(screen.queryByTestId('rich-text')).not.toBeInTheDocument()

    rerender(<AuthorCard author={mockAuthor} variant="full" />)
    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
  })

  it('renders social links only in full variant', () => {
    const mockAuthor = createMockAuthor()

    const { rerender } = render(<AuthorCard author={mockAuthor} variant="compact" />)
    expect(screen.queryByTestId('social-links')).not.toBeInTheDocument()

    rerender(<AuthorCard author={mockAuthor} variant="full" />)
    expect(screen.getByTestId('social-links')).toBeInTheDocument()
  })
})
