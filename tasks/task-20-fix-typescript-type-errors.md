# Task 20: Fix TypeScript Type Errors After Any Removal

## Overview

Fix TypeScript type errors that emerged after replacing `any` types with more specific types. These errors reveal type mismatches that were previously hidden by the `any` type.

## Problem

After fixing ESLint `no-explicit-any` errors, several TypeScript type errors emerged:

1. **AuthorCard.test.tsx** - `EmptyImageFieldImage` is missing required `thumbnail` property
2. **RichTextRenderer.test.tsx** - `EmbedField<'video'>` type mismatch and missing properties
3. **SEO.test.tsx** - Mock type conversion error and missing ImageField properties

## Root Cause

The `any` type was masking legitimate type incompatibilities. Now that we're using proper types, we need to create correctly structured mock data.

## Implementation Steps

### 1. Fix AuthorCard.test.tsx - EmptyImageFieldImage

The `avatar` field expects `ImageField<'thumbnail'>` which requires a thumbnail property.

```typescript
// src/__tests__/components/blog/AuthorCard.test.tsx

// Instead of:
avatar: {} as EmptyImageFieldImage,

// Use a proper empty image field with thumbnail:
avatar: {
  id: null,
  url: null,
  dimensions: null,
  alt: null,
  copyright: null,
  edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
  thumbnail: {
    id: null,
    url: null,
    dimensions: null,
    alt: null,
    copyright: null,
    edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
  }
} as ImageField<'thumbnail'>,
```

### 2. Fix RichTextRenderer.test.tsx - EmbedField Type

The EmbedField type needs to match the Prismic structure exactly.

```typescript
// src/__tests__/components/blog/RichTextRenderer.test.tsx

// Instead of casting to EmbedField<'video'>, use the base EmbedField type:
oembed: {
  html: embedHtml,
  type: 'video',
  embed_url: 'https://youtube.com/watch?v=123',
  title: 'Test Video',
  width: 560,
  height: 315,
  version: '1.0',
  provider_name: 'YouTube',
  provider_url: 'https://youtube.com',
  author_name: 'Test Author',
  author_url: 'https://youtube.com/channel/test',
  thumbnail_url: 'https://i.ytimg.com/vi/123/hqdefault.jpg',
  thumbnail_width: 480,
  thumbnail_height: 360,
} as unknown as EmbedField,
```

### 3. Fix SEO.test.tsx - Mock and ImageField Issues

#### Fix the isFilled.image mock:

```typescript
// The mock needs to be on the actual mock function, not the type guard
beforeEach(() => {
  jest.clearAllMocks()
  // Reset the mock implementation
  ;(isFilled.image as jest.MockedFunction<typeof isFilled.image>).mockImplementation(
    (field) => field && field.url
  )
})

// When testing invalid images:
;(isFilled.image as jest.MockedFunction<typeof isFilled.image>).mockReturnValue(false)
```

#### Fix the ImageField structure:

```typescript
// Instead of partial ImageField:
og_image: { url: '', alt: '', dimensions: null } as ImageField,

// Use complete structure:
og_image: {
  id: null,
  url: '',
  alt: '',
  dimensions: null,
  edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
  copyright: null,
} as ImageField,
```

### 4. Create Helper Functions for Mock Data

Create utility functions to generate proper mock data:

```typescript
// src/test-utils/mock-factories.ts

import type { ImageField, EmbedField } from '@prismicio/client'

export function createMockImageField<T extends string | null = never>(
  overrides: Partial<ImageField<T>> = {}
): ImageField<T> {
  const base = {
    id: null,
    url: null,
    dimensions: null,
    alt: null,
    copyright: null,
    edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
  }

  // Add thumbnail if needed
  if (overrides.thumbnail !== undefined || typeof overrides === 'object') {
    return {
      ...base,
      ...overrides,
      thumbnail: overrides.thumbnail || base,
    } as ImageField<T>
  }

  return {
    ...base,
    ...overrides,
  } as ImageField<T>
}

export function createMockEmbedField(
  type: 'video' | 'photo' | 'link' | 'rich' = 'video',
  overrides: Partial<EmbedField> = {}
): EmbedField {
  const baseFields = {
    type,
    version: '1.0',
    title: 'Test Embed',
    author_name: 'Test Author',
    author_url: 'https://example.com/author',
    provider_name: 'Test Provider',
    provider_url: 'https://example.com',
    cache_age: 3600,
    thumbnail_url: 'https://example.com/thumbnail.jpg',
    thumbnail_width: 480,
    thumbnail_height: 360,
    embed_url: 'https://example.com/embed',
    html: '<div>Embed HTML</div>',
  }

  // Type-specific fields
  const typeSpecificFields = {
    video: { width: 560, height: 315 },
    photo: { width: 800, height: 600, url: 'https://example.com/photo.jpg' },
    link: {},
    rich: { width: 600, height: 400 },
  }

  return {
    ...baseFields,
    ...typeSpecificFields[type],
    ...overrides,
  } as unknown as EmbedField
}
```

## Success Criteria

- [ ] All TypeScript errors resolved
- [ ] Tests still pass with proper types
- [ ] No use of `unknown` unless absolutely necessary
- [ ] Mock data structures match actual Prismic types

## Testing

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run affected tests
npm test src/__tests__/components/blog/AuthorCard.test.tsx
npm test src/__tests__/components/blog/RichTextRenderer.test.tsx
npm test src/__tests__/components/SEO.test.tsx

# Run all tests
npm test

# Verify ESLint still passes
npm run lint
```

## Dependencies

- Prismic type definitions
- Jest mock utilities
- Existing test infrastructure

## Notes

- These errors were hidden by `any` types and reveal actual type mismatches
- Creating proper mock factories will prevent future issues
- Consider updating the existing mock utilities to use these factories
- Document the mock data structure for future reference