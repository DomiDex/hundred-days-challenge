'use client';

import { useEffect, useRef, useState } from 'react';

interface RichTextCodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

export function RichTextCodeBlock({
  children,
  className,
  language: propLanguage,
}: RichTextCodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<string>('plaintext');
  const [codeContent, setCodeContent] = useState<string>('');

  useEffect(() => {
    // Process the text content and detect language
    const textContent = children || '';
    const lines = textContent.split('\n');

    // Use prop language if provided
    let detectedLang = propLanguage || 'plaintext';
    let actualCode = textContent;

    // Prevent PHP from being processed due to Prism.js bug
    // Also convert 'none' to 'plaintext'
    if (detectedLang === 'php' || detectedLang === 'none') {
      detectedLang = 'plaintext';
    }

    setLanguage(detectedLang);
    setCodeContent(actualCode);
  }, [children, propLanguage]);

  useEffect(() => {
    const highlightCode = async () => {
      if (typeof window !== 'undefined' && codeRef.current) {
        const Prism = (await import('prismjs')).default;

        // Try to import the specific language if not plaintext
        if (language !== 'plaintext') {
          try {
            // Skip problematic languages
            const skipLanguages = ['php', 'php-extras', 'erb', 'handlebars'];
            if (!skipLanguages.includes(language)) {
              await import(`prismjs/components/prism-${language}`);
            }
          } catch (error) {
            console.warn(
              `Language ${language} not found, using plaintext`,
              error
            );
          }
        }

        // Set the text content and apply syntax highlighting
        if (codeRef.current) {
          codeRef.current.textContent = codeContent;
          Prism.highlightElement(codeRef.current);
        }
      }
    };

    highlightCode();
  }, [language, codeContent]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative group my-8 -mx-6 md:mx-0 max-w-full ${className || ''}`}
    >
      {/* Language badge */}
      {language !== 'plaintext' && (
        <div className='absolute top-0 left-0 px-3 py-1 text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 rounded-tl-lg rounded-br-lg border-r border-b border-gray-300 dark:border-gray-600 z-10'>
          {language}
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className='absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md transition-all opacity-0 group-hover:opacity-100 shadow-sm'
        aria-label='Copy code'
      >
        {copied ? (
          <>
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
              />
            </svg>
            Copy
          </>
        )}
      </button>

      {/* Code block */}
      <div className='overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700'>
        <pre
          className={`${language !== 'plaintext' ? `language-${language}` : ''} !bg-gray-200 dark:!bg-gray-900 !p-8 !pt-12 !m-0 overflow-x-auto max-w-full !text-gray-800 dark:!text-gray-100`}
        >
          <code
            ref={codeRef}
            className={`${language !== 'plaintext' ? `language-${language}` : ''} !bg-transparent text-sm font-mono block w-max min-w-full`}
          ></code>
        </pre>
      </div>
    </div>
  );
}
