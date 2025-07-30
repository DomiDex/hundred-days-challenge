'use client'

import { PrismicRichText, JSXMapSerializer } from '@prismicio/react'
import { RichTextField } from '@prismicio/client'
import { useEffect } from 'react'
import { RichTextCodeBlock } from './RichTextCodeBlock'

interface RichTextRendererProps {
  field: RichTextField
  className?: string
}

export function RichTextRenderer({ field, className }: RichTextRendererProps) {
  useEffect(() => {
    // Highlight any code blocks after render
    const highlightCode = async () => {
      if (typeof window !== 'undefined') {
        const Prism = (await import('prismjs')).default
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          Prism.highlightAll()
        }, 100)
      }
    }
    highlightCode()
  }, [field])

  const components: JSXMapSerializer = {
    heading1: ({ children }) => <h1 className="mb-4 mt-8 text-4xl font-bold">{children}</h1>,
    heading2: ({ children }) => <h2 className="mb-4 mt-8 text-3xl font-bold">{children}</h2>,
    heading3: ({ children }) => <h3 className="mb-3 mt-6 text-2xl font-bold">{children}</h3>,
    heading4: ({ children }) => <h4 className="mb-3 mt-6 text-xl font-bold">{children}</h4>,
    heading5: ({ children }) => <h5 className="mb-2 mt-4 text-lg font-bold">{children}</h5>,
    heading6: ({ children }) => <h6 className="mb-2 mt-4 text-base font-bold">{children}</h6>,
    paragraph: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
    preformatted: ({ node, key }) => {
      let language = 'plaintext'
      let codeText = node.text || ''

      // Check if the first line contains a language hint
      // Format: //javascript or #python or --sql etc.
      const firstLine = codeText.split('\n')[0]
      const languageMatch = firstLine.match(/^(?:\/\/|#|--|'|"|<!--|\/\*)\s*(\w+)/)

      if (languageMatch) {
        language = languageMatch[1].toLowerCase()
        // Remove the language line from the code
        codeText = codeText.split('\n').slice(1).join('\n')
      }

      console.log('Detected language:', language, 'from:', firstLine)

      return (
        <RichTextCodeBlock key={key} language={language}>
          {codeText}
        </RichTextCodeBlock>
      )
    },
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    listItem: ({ children }) => <li className="mb-2">{children}</li>,
    oListItem: ({ children }) => <li className="mb-2">{children}</li>,
    list: ({ children }) => <ul className="mb-4 list-disc pl-6">{children}</ul>,
    oList: ({ children }) => <ol className="mb-4 list-decimal pl-6">{children}</ol>,
    image: ({ node }) => (
      <figure className="my-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={node.url} alt={node.alt || ''} className="h-auto max-w-full rounded-lg" />
        {node.copyright && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {node.copyright}
          </figcaption>
        )}
      </figure>
    ),
    embed: ({ node }) => (
      <div
        className="relative my-8 h-0 overflow-hidden rounded-lg pb-[56.25%]"
        dangerouslySetInnerHTML={{ __html: node.oembed.html || '' }}
      />
    ),
    hyperlink: ({ children, node }) => {
      const target = node.data.link_type === 'Web' ? node.data.target : undefined
      return (
        <a
          href={node.data.url || '#'}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-primary underline hover:text-primary/80"
        >
          {children}
        </a>
      )
    },
    label: ({ node, children }) => {
      if (node.data.label === 'codespan') {
        return (
          <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {children}
          </code>
        )
      }
      if (node.data.label === 'highlight') {
        return <mark className="bg-yellow-200 px-1 dark:bg-yellow-900">{children}</mark>
      }
      return <span>{children}</span>
    },
  }

  return (
    <div className={className}>
      <PrismicRichText field={field} components={components} />
    </div>
  )
}
