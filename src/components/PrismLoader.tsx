"use client";

import { useEffect } from "react";

export function PrismLoader() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadPrism = async () => {
        const Prism = (await import("prismjs")).default;
        
        // Import languages
        await import("prismjs/components/prism-javascript");
        await import("prismjs/components/prism-typescript");
        await import("prismjs/components/prism-jsx");
        await import("prismjs/components/prism-tsx");
        await import("prismjs/components/prism-css");
        await import("prismjs/components/prism-scss");
        await import("prismjs/components/prism-bash");
        await import("prismjs/components/prism-json");
        await import("prismjs/components/prism-markdown");
        await import("prismjs/components/prism-python");
        await import("prismjs/components/prism-java");
        await import("prismjs/components/prism-c");
        await import("prismjs/components/prism-cpp");
        await import("prismjs/components/prism-csharp");
        await import("prismjs/components/prism-php");
        await import("prismjs/components/prism-ruby");
        await import("prismjs/components/prism-go");
        await import("prismjs/components/prism-rust");
        await import("prismjs/components/prism-sql");
        await import("prismjs/components/prism-graphql");
        await import("prismjs/components/prism-yaml");
        
        // Import plugins
        await import("prismjs/plugins/line-numbers/prism-line-numbers");
        await import("prismjs/plugins/toolbar/prism-toolbar");
        await import("prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard");
        
        // Highlight all code blocks
        Prism.highlightAll();
      };
      
      loadPrism();
    }
  }, []);
  
  return null;
}