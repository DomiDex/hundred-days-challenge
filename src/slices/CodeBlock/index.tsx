"use client";

import { useEffect, useRef, useState } from "react";
import { SelectField, KeyTextField, BooleanField } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

interface CodeBlockSlice {
  id: string;
  slice_type: "code_block";
  slice_label: string | null;
  primary: {
    language?: SelectField;
    code?: KeyTextField;
    filename?: KeyTextField;
    show_line_numbers?: BooleanField;
  };
  items: never[];
}

export type CodeBlockProps = SliceComponentProps<CodeBlockSlice>;

const CodeBlock = ({ slice }: CodeBlockProps) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const highlightCode = async () => {
      if (typeof window !== "undefined" && codeRef.current) {
        const Prism = (await import("prismjs")).default;
        
        // Import the specific language if needed
        const language = slice.primary.language || "javascript";
        try {
          await import(`prismjs/components/prism-${language}`);
        } catch {
          console.warn(`Language ${language} not found, using plaintext`);
        }
        
        // Highlight the specific code block
        if (codeRef.current) {
          Prism.highlightElement(codeRef.current);
        }
      }
    };
    
    highlightCode();
  }, [slice.primary.code, slice.primary.language]);

  const language = slice.primary.language || "javascript";
  const showLineNumbers = slice.primary.show_line_numbers !== false;

  const handleCopy = async () => {
    if (slice.primary.code) {
      await navigator.clipboard.writeText(slice.primary.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-4">
      <div className="relative group">
        {slice.primary.filename && (
          <div className="flex items-center justify-between bg-gray-900 dark:bg-gray-950 px-4 py-2 text-sm rounded-t-lg border border-gray-800 dark:border-gray-700">
            <span className="text-gray-300 dark:text-gray-400 font-mono">{slice.primary.filename}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>
          </div>
        )}
        <div className={`relative bg-gray-900 dark:bg-gray-950 ${slice.primary.filename ? "rounded-b-lg border-x border-b" : "rounded-lg border"} border-gray-800 dark:border-gray-700 overflow-hidden`}>
          {!slice.primary.filename && (
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 z-10 flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 dark:bg-gray-900 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-md transition-all opacity-0 group-hover:opacity-100"
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
          <pre className={`language-${language} ${showLineNumbers ? "line-numbers" : ""} !bg-transparent !m-0 !p-4 overflow-x-auto`}>
            <code ref={codeRef} className={`language-${language} !text-gray-300`}>
              {slice.primary.code}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
};

export default CodeBlock;