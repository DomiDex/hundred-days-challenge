# Task 19: Fix ESLint no-explicit-any Errors

## Overview

Replace all `any` types with proper TypeScript types to satisfy the `@typescript-eslint/no-explicit-any` rule across the codebase.

## Problem

Multiple files are using `any` type which violates ESLint rules:
- `src/types/jest-dom.d.ts` - 3 instances
- `src/__tests__/components/blog/AuthorCard.test.tsx` - 1 instance
- `src/__tests__/components/blog/RichTextRenderer.test.tsx` - 2 instances
- `src/__tests__/components/blog/ShareButtons.test.tsx` - 3 instances
- `src/__tests__/components/SEO.test.tsx` - 10 instances
- `src/__tests__/lib/prismic-helpers.test.ts` - 2 instances

## Implementation Steps

### 1. Fix jest-dom.d.ts Types

```typescript
// src/types/jest-dom.d.ts
import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveClass(className: string): R
      toHaveStyle(style: Record<string, unknown>): R
      toBeVisible(): R
      toBeDisabled(): R
      toHaveTextContent(text: string | RegExp): R
    }
  }
}

declare module '@testing-library/jest-dom' {
  interface Matchers<R> {
    toBeInTheDocument(): R
    toHaveAttribute(attr: string, value?: string): R
    toHaveClass(className: string): R
    toHaveStyle(style: Record<string, unknown>): R
    toBeVisible(): R
    toBeDisabled(): R
    toHaveTextContent(text: string | RegExp): R
  }
}
```

### 2. Fix AuthorCard Test

```typescript
// src/__tests__/components/blog/AuthorCard.test.tsx
// Instead of:
avatar: {} as any

// Use:
avatar: {} as ImageField<'thumbnail'>
// Or create a proper empty image field mock
```

### 3. Fix RichTextRenderer Test

```typescript
// src/__tests__/components/blog/RichTextRenderer.test.tsx
// Instead of:
} as any,

// Use proper types:
} as RTImageNode

// For embed field:
} as EmbedField<'video'>
```

### 4. Fix ShareButtons Test

```typescript
// src/__tests__/components/blog/ShareButtons.test.tsx
// Define proper mock types:
interface MockCopyConfig {
  writeText: jest.Mock<Promise<void>, [string]>
}

interface MockNavigatorConfig {
  share: jest.Mock<Promise<void>, [ShareData]>
}

const mockCopy: MockCopyConfig = {
  writeText: jest.fn().mockResolvedValue(undefined)
}

const mockNavigator: Partial<Navigator> & MockNavigatorConfig = {
  share: jest.fn().mockResolvedValue(undefined)
}
```

### 5. Fix SEO Test

```typescript
// src/__tests__/components/SEO.test.tsx
// Instead of:
expect((metadata.openGraph as any)?.type).toBe('website')

// Use type assertion with known type:
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types'
expect((metadata.openGraph as OpenGraph)?.type).toBe('website')

// For og_image:
og_image: {
  id: 'test-image',
  url: 'https://example.com/image.jpg',
  alt: 'Image Alt',
  dimensions: { width: 1200, height: 630 },
  edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
  copyright: null,
} as ImageField
```

### 6. Fix prismic-helpers Test

```typescript
// src/__tests__/lib/prismic-helpers.test.ts
// Instead of:
expect((result?.data as any)?.name).toBe('Test Author')

// Use proper type guard or assertion:
if (result && 'data' in result && result.data) {
  expect(result.data.name).toBe('Test Author')
}

// Or create a type guard:
function isAuthorDocument(doc: unknown): doc is AuthorDocument {
  return doc !== null && 
         typeof doc === 'object' && 
         'type' in doc && 
         doc.type === 'author'
}
```

### 7. Create Shared Test Types

Create a file for shared test types:

```typescript
// src/test-utils/types.ts
import type { ImageField, EmbedField, RichTextField } from '@prismicio/client'

export type MockImageField = Partial<ImageField>
export type MockEmbedField = Partial<EmbedField>
export type MockRichTextField = RichTextField

export interface MockNavigator extends Partial<Navigator> {
  share?: jest.Mock<Promise<void>, [ShareData]>
  clipboard?: {
    writeText: jest.Mock<Promise<void>, [string]>
  }
}
```

## ESLint Configuration Alternative

If certain `any` types are unavoidable in tests, consider:

```javascript
// .eslintrc.js or eslint config
{
  "overrides": [
    {
      "files": ["**/__tests__/**/*", "**/*.test.ts", "**/*.test.tsx"],
      "rules": {
        "@typescript-eslint/no-explicit-any": ["error", {
          "ignoreRestArgs": true,
          "fixToUnknown": true
        }]
      }
    }
  ]
}
```

## Success Criteria

- [ ] All ESLint errors resolved
- [ ] No `any` types remain in the codebase
- [ ] Tests still pass after type fixes
- [ ] Type safety improved without compromising test clarity

## Testing

```bash
# Run ESLint to check for errors
npm run lint

# Run tests to ensure they still pass
npm test

# Run TypeScript compiler
npx tsc --noEmit
```

## Notes

- Prefer `unknown` over `any` when the type is truly unknown
- Use type assertions sparingly and document why they're needed
- Consider creating mock factories with proper types
- Some test utilities might require `any` - document these cases