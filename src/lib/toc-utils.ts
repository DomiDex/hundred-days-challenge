import { RichTextField } from '@prismicio/client'

export interface ToCHeading {
  id: string
  text: string
  level: number
  children?: ToCHeading[]
}

export function extractHeadingsFromRichText(richText: RichTextField): ToCHeading[] {
  if (!richText || !Array.isArray(richText)) {
    return []
  }

  // Check if content looks like markdown
  const fieldText = richText.map((block) => ('text' in block ? block.text : '')).join('\n')
  const isMarkdown = /^#{1,6}\s+/m.test(fieldText) || /```[\w]*\n/m.test(fieldText)

  if (isMarkdown) {
    // Extract headings from markdown
    return extractHeadingsFromMarkdown(fieldText)
  }

  // Original logic for Prismic rich text
  const headings: ToCHeading[] = []
  const stack: ToCHeading[] = []

  richText.forEach((block) => {
    if (block.type === 'heading2' || block.type === 'heading3' || block.type === 'heading4') {
      const level = block.type === 'heading2' ? 2 : block.type === 'heading3' ? 3 : 4
      const text = block.text || ''
      const id = generateId(text)

      const heading: ToCHeading = {
        id,
        text,
        level,
      }

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      if (stack.length === 0) {
        headings.push(heading)
      } else {
        const parent = stack[stack.length - 1]
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(heading)
      }

      stack.push(heading)
    }
  })

  return headings
}

export function extractHeadingsFromMarkdown(markdown: string): ToCHeading[] {
  const headings: ToCHeading[] = []
  const stack: ToCHeading[] = []

  // Match markdown headings (# H1, ## H2, etc.)
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = generateId(text)

    const heading: ToCHeading = {
      id,
      text,
      level,
    }

    // Build hierarchy
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop()
    }

    if (stack.length === 0) {
      headings.push(heading)
    } else {
      const parent = stack[stack.length - 1]
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(heading)
    }

    stack.push(heading)
  }

  return headings
}

export function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function flattenHeadings(headings: ToCHeading[]): ToCHeading[] {
  const flattened: ToCHeading[] = []

  function flatten(items: ToCHeading[]) {
    items.forEach((item) => {
      flattened.push(item)
      if (item.children) {
        flatten(item.children)
      }
    })
  }

  flatten(headings)
  return flattened
}
