"use client";

import { useEffect, useRef } from "react";
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

  return (
    <section className="max-w-4xl mx-auto px-6 py-4">
      {slice.primary.filename && (
        <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm rounded-t-lg font-mono">
          {slice.primary.filename}
        </div>
      )}
      <div className={`relative ${slice.primary.filename ? "rounded-b-lg" : "rounded-lg"} overflow-hidden`}>
        <pre className={`language-${language} ${showLineNumbers ? "line-numbers" : ""}`}>
          <code ref={codeRef} className={`language-${language}`}>
            {slice.primary.code}
          </code>
        </pre>
      </div>
    </section>
  );
};

export default CodeBlock;