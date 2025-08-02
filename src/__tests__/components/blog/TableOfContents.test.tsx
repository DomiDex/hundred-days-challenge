import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ToCHeading } from '@/lib/toc-utils'
jest.mock('@/hooks/useTableOfContents', () => ({
  useTableOfContents: jest.fn(),
}))

interface MockTableOfContentsItemProps {
  heading: { id: string; text: string }
  activeId: string
  onItemClick: (id: string) => void
}

jest.mock('@/components/blog/TableOfContentsItem', () => ({
  TableOfContentsItem: ({ heading, activeId, onItemClick }: MockTableOfContentsItemProps) => (
    <li>
      <button
        onClick={() => onItemClick(heading.id)}
        className={activeId === heading.id ? 'active' : ''}
        data-testid={`toc-item-${heading.id}`}
      >
        {heading.text}
      </button>
    </li>
  ),
}))

describe('TableOfContents', () => {
  const mockHeadings: ToCHeading[] = [
    { id: 'heading-1', text: 'Introduction', level: 1 },
    { id: 'heading-2', text: 'Getting Started', level: 2 },
    { id: 'heading-3', text: 'Advanced Topics', level: 2 },
    { id: 'heading-4', text: 'Conclusion', level: 1 },
  ]

  const mockScrollToSection = jest.fn()
  const mockUseTableOfContents = {
    activeId: 'heading-1',
    scrollToSection: mockScrollToSection,
  }

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useTableOfContents } = require('@/hooks/useTableOfContents') as { useTableOfContents: jest.Mock }
    useTableOfContents.mockReturnValue(mockUseTableOfContents)
    mockScrollToSection.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders table of contents with headings', () => {
    render(<TableOfContents headings={mockHeadings} />)

    expect(screen.getByText('Table of Contents')).toBeInTheDocument()
    expect(screen.getByText('Introduction')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Advanced Topics')).toBeInTheDocument()
    expect(screen.getByText('Conclusion')).toBeInTheDocument()
  })

  it('returns null when no headings provided', () => {
    const { container } = render(<TableOfContents headings={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('highlights active section', () => {
    render(<TableOfContents headings={mockHeadings} />)

    const activeItem = screen.getByTestId('toc-item-heading-1')
    expect(activeItem).toHaveClass('active')
  })

  it('handles click navigation', async () => {
    const user = userEvent.setup()
    render(<TableOfContents headings={mockHeadings} />)

    await user.click(screen.getByText('Getting Started'))
    expect(mockScrollToSection).toHaveBeenCalledWith('heading-2')

    await user.click(screen.getByText('Conclusion'))
    expect(mockScrollToSection).toHaveBeenCalledWith('heading-4')
  })

  it('applies custom className', () => {
    render(<TableOfContents headings={mockHeadings} className="custom-toc-class" />)

    const nav = screen.getByRole('navigation', { name: 'Table of contents' })
    expect(nav).toHaveClass('custom-toc-class')
  })

  it('renders with proper accessibility attributes', () => {
    render(<TableOfContents headings={mockHeadings} />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveAttribute('aria-label', 'Table of contents')
  })

  it('maintains sticky positioning classes', () => {
    render(<TableOfContents headings={mockHeadings} />)

    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('sticky', 'top-24')
  })

  it('updates active section when activeId changes', () => {
    const { rerender } = render(<TableOfContents headings={mockHeadings} />)

    let activeItem = screen.getByTestId('toc-item-heading-1')
    expect(activeItem).toHaveClass('active')

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useTableOfContents } = require('@/hooks/useTableOfContents') as { useTableOfContents: jest.Mock }
    useTableOfContents.mockReturnValue({
      ...mockUseTableOfContents,
      activeId: 'heading-3',
    })

    rerender(<TableOfContents headings={mockHeadings} />)

    activeItem = screen.getByTestId('toc-item-heading-3')
    expect(activeItem).toHaveClass('active')
  })

  it('renders all heading levels correctly', () => {
    const mixedLevelHeadings: ToCHeading[] = [
      { id: 'h1', text: 'Level 1', level: 1 },
      { id: 'h2', text: 'Level 2', level: 2 },
      { id: 'h3', text: 'Level 3', level: 3 },
      { id: 'h4', text: 'Level 4', level: 4 },
    ]

    render(<TableOfContents headings={mixedLevelHeadings} />)

    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('Level 2')).toBeInTheDocument()
    expect(screen.getByText('Level 3')).toBeInTheDocument()
    expect(screen.getByText('Level 4')).toBeInTheDocument()
  })
})