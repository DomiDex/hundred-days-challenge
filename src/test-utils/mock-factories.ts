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

  // Check if this needs a thumbnail
  const needsThumbnail = overrides && 'thumbnail' in overrides

  if (needsThumbnail) {
    const thumbnailOverrides = (overrides as any).thumbnail
    return {
      ...base,
      ...overrides,
      thumbnail: thumbnailOverrides || base,
    } as ImageField<T>
  }

  return {
    ...base,
    ...overrides,
  } as ImageField<T>
}

export function createEmptyImageField<T extends string | null = never>(): ImageField<T> {
  const base = {
    id: null,
    url: null,
    dimensions: null,
    alt: null,
    copyright: null,
    edit: { x: 0, y: 0, zoom: 1, background: 'transparent' },
  }
  
  // Return with thumbnail for types that require it
  return {
    ...base,
    thumbnail: base,
  } as unknown as ImageField<T>
}

export function createMockEmbedField(
  type: 'video' | 'photo' | 'link' | 'rich' = 'video',
  overrides: Partial<any> = {}
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