import React from 'react'
import { render, screen } from '@/test-utils'
import { CategoryChip } from '@/components/blog/CategoryChip'

interface MockLinkProps {
  children: React.ReactNode
  href: string
  className?: string
}

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockedLink = ({ children, href, className }: MockLinkProps) => (
    <a href={href} className={className}>
      {children}
    </a>
  )
  MockedLink.displayName = 'MockedLink'
  return MockedLink
})

describe('CategoryChip', () => {
  it('renders category name correctly', () => {
    render(<CategoryChip name="Technology" uid="technology" />)
    
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('generates correct link href', () => {
    render(<CategoryChip name="Design" uid="design" />)
    
    const link = screen.getByRole('link', { name: 'Design' })
    expect(link).toHaveAttribute('href', '/blog/design')
  })

  it('applies font-medium class', () => {
    render(<CategoryChip name="Development" uid="development" />)
    
    const link = screen.getByRole('link', { name: 'Development' })
    expect(link).toHaveClass('font-medium')
  })

  it('handles special characters in category name', () => {
    render(<CategoryChip name="UI/UX Design" uid="ui-ux-design" />)
    
    expect(screen.getByText('UI/UX Design')).toBeInTheDocument()
  })

  it('handles hyphenated uids correctly', () => {
    render(<CategoryChip name="Machine Learning" uid="machine-learning" />)
    
    const link = screen.getByRole('link', { name: 'Machine Learning' })
    expect(link).toHaveAttribute('href', '/blog/machine-learning')
  })

  it('renders with empty name', () => {
    render(<CategoryChip name="" uid="empty" />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/blog/empty')
    expect(link).toBeEmptyDOMElement()
  })

  it('renders with numeric uid', () => {
    render(<CategoryChip name="Category 123" uid="123" />)
    
    const link = screen.getByRole('link', { name: 'Category 123' })
    expect(link).toHaveAttribute('href', '/blog/123')
  })

  it('handles long category names', () => {
    const longName = 'Very Long Category Name That Might Wrap'
    render(<CategoryChip name={longName} uid="very-long-category" />)
    
    expect(screen.getByText(longName)).toBeInTheDocument()
  })

  it('is accessible as a link', () => {
    render(<CategoryChip name="Accessibility" uid="accessibility" />)
    
    const link = screen.getByRole('link', { name: 'Accessibility' })
    expect(link).toBeInTheDocument()
  })

  it('renders multiple instances correctly', () => {
    const { rerender } = render(<CategoryChip name="First" uid="first" />)
    
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/first')
    
    rerender(<CategoryChip name="Second" uid="second" />)
    
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/second')
  })
})