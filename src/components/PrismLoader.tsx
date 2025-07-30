'use client'

import { useEffect } from 'react'

export function PrismLoader() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadPrism = async () => {
        const Prism = (await import('prismjs')).default

        // Import languages with proper error handling
        const languages = [
          'javascript',
          'typescript',
          'jsx',
          'tsx',
          'css',
          'scss',
          'bash',
          'json',
          'markdown',
          'python',
          'java',
          'c',
          'cpp',
          'csharp',
          'ruby',
          'go',
          'rust',
          'sql',
          'graphql',
          'yaml',
        ]

        // Load languages with error handling
        for (const lang of languages) {
          try {
            await import(`prismjs/components/prism-${lang}`)
          } catch (error) {
            console.warn(`Failed to load Prism language: ${lang}`, error)
          }
        }

        // Import plugins with error handling
        try {
          await import('prismjs/plugins/line-numbers/prism-line-numbers')
        } catch (error) {
          console.warn('Failed to load line-numbers plugin', error)
        }

        // Highlight all code blocks
        Prism.highlightAll()
      }

      loadPrism()
    }
  }, [])

  return null
}
