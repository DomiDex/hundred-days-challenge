import React from 'react'
import { render, screen, waitFor } from '@/test-utils'
import { RichTextRenderer } from '@/components/blog/RichTextRenderer'
import { RichTextField, RTImageNode, EmbedField } from '@prismicio/client'
import DOMPurify from 'isomorphic-dompurify'
import { createMockEmbedField } from '@/test-utils/mock-factories'

interface MockPrismicBlock {
  type: string
  text?: string
  spans?: Array<{
    start: number
    end: number
    type: string
    data?: Record<string, unknown>
  }>
  [key: string]: unknown
}

interface MockPrismicRichTextProps {
  field: MockPrismicBlock[]
  components: Record<string, React.ComponentType<{ node: MockPrismicBlock; children?: React.ReactNode }>>
}

// Mock PrismicRichText component
jest.mock('@prismicio/react', () => ({
  PrismicRichText: ({ field, components }: MockPrismicRichTextProps) => {
    if (!field || !Array.isArray(field)) return null
    
    const renderText = (block: MockPrismicBlock) => {
      if (!block.spans || block.spans.length === 0) {
        return block.text
      }
      
      // Handle spans
      let lastEnd = 0
      const parts: React.ReactNode[] = []
      
      block.spans.forEach((span, i: number) => {
        // Add text before span
        if (span.start > lastEnd && block.text) {
          parts.push(block.text.slice(lastEnd, span.start))
        }
        
        // Add span content
        const spanText = block.text?.slice(span.start, span.end) || ''
        const SpanComponent = components[span.type]
        if (SpanComponent) {
          parts.push(<SpanComponent key={i} node={{ ...span, type: span.type, text: spanText }}>{spanText}</SpanComponent>)
        } else {
          parts.push(spanText)
        }
        
        lastEnd = span.end
      })
      
      // Add remaining text
      if (lastEnd < (block.text?.length || 0)) {
        parts.push(block.text?.slice(lastEnd))
      }
      
      return parts
    }
    
    return (
      <div data-testid="prismic-rich-text">
        {field.map((block: MockPrismicBlock, index: number) => {
          const Component = components[block.type]
          if (Component) {
            return <Component key={index} node={block}>{renderText(block)}</Component>
          }
          return <div key={index}>{renderText(block)}</div>
        })}
      </div>
    )
  },
  JSXMapSerializer: {}
}))

// Mock Prism
const mockHighlightAll = jest.fn()
jest.mock('prismjs', () => {
  return {
    __esModule: true,
    default: {
      highlightAll: mockHighlightAll,
    },
  }
})

// Mock DOMPurify
jest.mock('isomorphic-dompurify', () => ({
  __esModule: true,
  default: {
    sanitize: jest.fn((html: string) => html),
  },
}))

interface MockCodeBlockProps {
  children: React.ReactNode
  language: string
}

// Mock RichTextCodeBlock
jest.mock('@/components/blog/RichTextCodeBlock', () => ({
  RichTextCodeBlock: ({ children, language }: MockCodeBlockProps) => (
    <pre data-testid="code-block" data-language={language}>
      <code>{children}</code>
    </pre>
  ),
}))

describe('RichTextRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders paragraph text correctly', () => {
    const field: RichTextField = [
      {
        type: 'paragraph',
        text: 'This is a test paragraph.',
        spans: [],
      },
    ]
    
    render(<RichTextRenderer field={field} />)
    expect(screen.getByText('This is a test paragraph.')).toBeInTheDocument()
  })

  it('renders headings with generated IDs', () => {
    const field: RichTextField = [
      { type: 'heading1', text: 'Main Title', spans: [] },
      { type: 'heading2', text: 'Section Title', spans: [] },
      { type: 'heading3', text: 'Subsection Title', spans: [] },
      { type: 'heading4', text: 'Sub-subsection', spans: [] },
      { type: 'heading5', text: 'Small Heading', spans: [] },
      { type: 'heading6', text: 'Tiny Heading', spans: [] },
    ]
    
    render(<RichTextRenderer field={field} />)
    
    expect(screen.getByRole('heading', { level: 1, name: 'Main Title' })).toHaveAttribute('id', 'main-title')
    expect(screen.getByRole('heading', { level: 2, name: 'Section Title' })).toHaveAttribute('id', 'section-title')
    expect(screen.getByRole('heading', { level: 3, name: 'Subsection Title' })).toHaveAttribute('id', 'subsection-title')
    expect(screen.getByRole('heading', { level: 4, name: 'Sub-subsection' })).toHaveAttribute('id', 'sub-subsection')
    expect(screen.getByRole('heading', { level: 5, name: 'Small Heading' })).toHaveAttribute('id', 'small-heading')
    expect(screen.getByRole('heading', { level: 6, name: 'Tiny Heading' })).toHaveAttribute('id', 'tiny-heading')
  })

  it('renders code blocks with language detection', () => {
    const field: RichTextField = [
      {
        type: 'preformatted',
        text: '//javascript\nconst hello = "world";',
        spans: [],
      },
    ]
    
    render(<RichTextRenderer field={field} />)
    
    const codeBlock = screen.getByTestId('code-block')
    expect(codeBlock).toHaveAttribute('data-language', 'javascript')
    expect(codeBlock).toHaveTextContent('const hello = "world";')
  })

  it('handles different language comment styles', () => {
    const testCases = [
      { text: '#python\nprint("hello")', expectedLang: 'python' },
      { text: '--sql\nSELECT * FROM users', expectedLang: 'sql' },
      { text: '/*css*/\nbody { color: red; }', expectedLang: 'css' },
      { text: '<!--html-->\n<div>Hello</div>', expectedLang: 'html' },
    ]
    
    testCases.forEach(({ text, expectedLang }) => {
      const field: RichTextField = [
        { type: 'preformatted', text, spans: [] },
      ]
      
      const { container } = render(<RichTextRenderer field={field} />)
      const codeBlock = container.querySelector('[data-testid="code-block"]')
      expect(codeBlock).toHaveAttribute('data-language', expectedLang)
    })
  })

  it('renders lists correctly', () => {
    const field: RichTextField = [
      {
        type: 'list-item',
        text: 'First item',
        spans: [],
      },
      {
        type: 'list-item',
        text: 'Second item',
        spans: [],
      },
      {
        type: 'o-list-item',
        text: 'Ordered first',
        spans: [],
      },
      {
        type: 'o-list-item',
        text: 'Ordered second',
        spans: [],
      },
    ]
    
    render(<RichTextRenderer field={field} />)
    
    expect(screen.getByText('First item')).toBeInTheDocument()
    expect(screen.getByText('Second item')).toBeInTheDocument()
    expect(screen.getByText('Ordered first')).toBeInTheDocument()
    expect(screen.getByText('Ordered second')).toBeInTheDocument()
  })

  it('renders inline styles correctly', () => {
    const field: RichTextField = [
      {
        type: 'paragraph',
        text: 'This is bold and italic text',
        spans: [
          { start: 8, end: 12, type: 'strong' },
          { start: 17, end: 23, type: 'em' },
        ],
      },
    ]
    
    render(<RichTextRenderer field={field} />)
    
    expect(screen.getByText('bold', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('italic', { exact: false })).toBeInTheDocument()
  })

  it('renders hyperlinks with correct attributes', () => {
    const field: RichTextField = [
      {
        type: 'paragraph',
        text: 'Check out this link',
        spans: [
          {
            start: 10,
            end: 19,
            type: 'hyperlink',
            data: {
              link_type: 'Web',
              url: 'https://example.com',
              target: '_blank',
            },
          },
        ],
      },
    ]
    
    render(<RichTextRenderer field={field} />)
    
    const link = screen.getByRole('link', { name: /this link/i })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders labels for codespan and highlight', () => {
    const field: RichTextField = [
      {
        type: 'paragraph',
        text: 'This has code and highlight',
        spans: [
          { start: 9, end: 13, type: 'label', data: { label: 'codespan' } },
          { start: 18, end: 27, type: 'label', data: { label: 'highlight' } },
        ],
      },
    ]
    
    render(<RichTextRenderer field={field} />)
    
    const code = screen.getByText('code')
    expect(code.tagName).toBe('CODE')
    expect(code).toHaveClass('rounded', 'bg-gray-200')
    
    const highlight = screen.getByText('highlight')
    expect(highlight.tagName).toBe('MARK')
    expect(highlight).toHaveClass('bg-yellow-200')
  })

  it('renders images with alt text and copyright', () => {
    const field: RichTextField = [
      {
        type: 'image',
        id: 'test-image',
        url: 'https://example.com/image.jpg',
        alt: 'Test image',
        copyright: '© 2024 Example',
        dimensions: { width: 800, height: 600 },
        edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
      } as RTImageNode,
    ]
    
    render(<RichTextRenderer field={field} />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
    expect(screen.getByText('© 2024 Example')).toBeInTheDocument()
  })

  it('renders embeds with sanitized HTML', () => {
    const embedHtml = '<iframe src="https://youtube.com/embed/123"></iframe>'
    const field: RichTextField = [
      {
        type: 'embed',
        oembed: createMockEmbedField('video', {
          html: embedHtml,
          embed_url: 'https://youtube.com/watch?v=123',
          title: 'Test Video',
          provider_name: 'YouTube',
          provider_url: 'https://youtube.com',
        }),
      },
    ]
    
    render(<RichTextRenderer field={field} />)
    
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(embedHtml, expect.any(Object))
  })

  it('highlights code after render', async () => {
    const field: RichTextField = [
      {
        type: 'preformatted',
        text: 'const x = 1;',
        spans: [],
      },
    ]
    
    render(<RichTextRenderer field={field} />)
    
    await waitFor(() => {
      expect(mockHighlightAll).toHaveBeenCalled()
    }, { timeout: 200 })
  })

  it('applies custom className', () => {
    const field: RichTextField = [
      { type: 'paragraph', text: 'Test', spans: [] },
    ]
    
    render(<RichTextRenderer field={field} className="custom-prose" />)
    
    const container = screen.getByText('Test').parentElement?.parentElement
    expect(container).toHaveClass('custom-prose')
  })

  it('handles empty field gracefully', () => {
    render(<RichTextRenderer field={[]} />)
    expect(document.body).toBeTruthy()
  })

  it('handles missing text in nodes', () => {
    const field = [
      { type: 'heading1', text: null as unknown as string, spans: [] },
      { type: 'paragraph', text: '', spans: [] },
    ] as RichTextField
    
    render(<RichTextRenderer field={field} />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveAttribute('id', '')
  })
})