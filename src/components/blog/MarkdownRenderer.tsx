'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { RichTextCodeBlock } from './RichTextCodeBlock'
import { generateId } from '@/lib/toc-utils'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const components: Components = {
    // Headings with IDs for table of contents
    h1: ({ children }) => {
      const text = String(children)
      const id = generateId(text)
      return (
        <h1 id={id} className="mb-4 mt-8 text-4xl font-bold">
          {children}
        </h1>
      )
    },
    h2: ({ children }) => {
      const text = String(children)
      const id = generateId(text)
      return (
        <h2 id={id} className="mb-4 mt-8 text-3xl font-bold">
          {children}
        </h2>
      )
    },
    h3: ({ children }) => {
      const text = String(children)
      const id = generateId(text)
      return (
        <h3 id={id} className="mb-3 mt-6 text-2xl font-bold">
          {children}
        </h3>
      )
    },
    h4: ({ children }) => {
      const text = String(children)
      const id = generateId(text)
      return (
        <h4 id={id} className="mb-3 mt-6 text-xl font-bold">
          {children}
        </h4>
      )
    },
    h5: ({ children }) => {
      const text = String(children)
      const id = generateId(text)
      return (
        <h5 id={id} className="mb-2 mt-4 text-lg font-bold">
          {children}
        </h5>
      )
    },
    h6: ({ children }) => {
      const text = String(children)
      const id = generateId(text)
      return (
        <h6 id={id} className="mb-2 mt-4 text-base font-bold">
          {children}
        </h6>
      )
    },

    // Code blocks using existing RichTextCodeBlock component
    code(props) {
      const { className, children } = props as { className?: string; children?: React.ReactNode }
      const inline = !className?.startsWith('language-')
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : 'plaintext'

      // For inline code
      if (inline) {
        return (
          <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {children}
          </code>
        )
      }

      // For code blocks, use our existing RichTextCodeBlock component
      return (
        <RichTextCodeBlock language={language}>
          {String(children).replace(/\n$/, '')}
        </RichTextCodeBlock>
      )
    },

    // Preformatted text
    pre({ children }) {
      // Return children directly as the code component will handle the wrapper
      return <>{children}</>
    },

    // Paragraphs
    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,

    // Lists
    ul: ({ children }) => <ul className="mb-4 list-disc pl-6">{children}</ul>,
    ol: ({ children }) => <ol className="mb-4 list-decimal pl-6">{children}</ol>,
    li: ({ children }) => <li className="mb-2">{children}</li>,

    // Text formatting
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,

    // Links
    a: ({ href, children }) => {
      const isExternal = href?.startsWith('http')
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-primary underline hover:text-primary/80"
        >
          {children}
        </a>
      )
    },

    // Images
    img: ({ src, alt }) => (
      <figure className="my-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt || ''} className="h-auto max-w-full rounded-lg" />
      </figure>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 dark:border-gray-600 dark:text-gray-300">
        {children}
      </blockquote>
    ),

    // Tables (with GFM)
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-gray-300 dark:border-gray-700">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="border border-gray-300 px-4 py-2 text-left font-semibold dark:border-gray-700">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 px-4 py-2 dark:border-gray-700">{children}</td>
    ),

    // Horizontal rule
    hr: () => <hr className="my-8 border-gray-300 dark:border-gray-700" />,
  }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
