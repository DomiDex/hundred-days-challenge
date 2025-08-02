import { extractHeadingsFromRichText, generateId, flattenHeadings, ToCHeading } from '@/lib/toc-utils'
import { RichTextField } from '@prismicio/client'

describe('toc-utils', () => {
  describe('generateId', () => {
    it('converts text to lowercase', () => {
      expect(generateId('Hello World')).toBe('hello-world')
      expect(generateId('UPPERCASE')).toBe('uppercase')
    })

    it('replaces spaces with hyphens', () => {
      expect(generateId('multiple word heading')).toBe('multiple-word-heading')
    })

    it('removes special characters', () => {
      expect(generateId('Hello! World?')).toBe('hello-world')
      expect(generateId('React & Next.js')).toBe('react-nextjs')
      expect(generateId('100% Complete')).toBe('100-complete')
    })

    it('handles multiple consecutive spaces', () => {
      expect(generateId('too    many    spaces')).toBe('too-many-spaces')
    })

    it('handles multiple consecutive hyphens', () => {
      expect(generateId('already---hyphenated')).toBe('already-hyphenated')
    })

    it('trims whitespace', () => {
      expect(generateId('  trimmed  ')).toBe('-trimmed-')
    })

    it('handles empty string', () => {
      expect(generateId('')).toBe('')
    })

    it('handles numbers', () => {
      expect(generateId('Chapter 1: Introduction')).toBe('chapter-1-introduction')
    })

    it('handles unicode characters', () => {
      expect(generateId('Café & Résumé')).toBe('caf-rsum')
    })

    it('handles edge cases', () => {
      expect(generateId('___test___')).toBe('___test___')
      expect(generateId('---test---')).toBe('-test-')
      expect(generateId('   ---   ')).toBe('-')
    })
  })

  describe('extractHeadingsFromRichText', () => {
    it('returns empty array for null input', () => {
      expect(extractHeadingsFromRichText(null as unknown as RichTextField)).toEqual([])
    })

    it('returns empty array for undefined input', () => {
      expect(extractHeadingsFromRichText(undefined as unknown as RichTextField)).toEqual([])
    })

    it('returns empty array for non-array input', () => {
      expect(extractHeadingsFromRichText({} as unknown as RichTextField)).toEqual([])
      expect(extractHeadingsFromRichText('string' as unknown as RichTextField)).toEqual([])
    })

    it('returns empty array when no headings present', () => {
      const richText: RichTextField = [
        { type: 'paragraph', text: 'This is a paragraph', spans: [] },
        { type: 'paragraph', text: 'Another paragraph', spans: [] },
      ]
      expect(extractHeadingsFromRichText(richText)).toEqual([])
    })

    it('extracts heading2 elements', () => {
      const richText: RichTextField = [
        { type: 'heading2', text: 'Main Heading', spans: [] },
        { type: 'paragraph', text: 'Some content', spans: [] },
      ]
      const result = extractHeadingsFromRichText(richText)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'main-heading',
        text: 'Main Heading',
        level: 2,
      })
    })

    it('extracts multiple heading types', () => {
      const richText: RichTextField = [
        { type: 'heading2', text: 'H2 Heading', spans: [] },
        { type: 'heading3', text: 'H3 Heading', spans: [] },
        { type: 'heading4', text: 'H4 Heading', spans: [] },
      ]
      const result = extractHeadingsFromRichText(richText)
      
      expect(result).toHaveLength(1)
      expect(result[0].level).toBe(2)
      expect(result[0].children).toHaveLength(1)
      expect(result[0].children![0].level).toBe(3)
      expect(result[0].children![0].children).toHaveLength(1)
      expect(result[0].children![0].children![0].level).toBe(4)
    })

    it('creates hierarchical structure', () => {
      const richText: RichTextField = [
        { type: 'heading2', text: 'Section 1', spans: [] },
        { type: 'heading3', text: 'Subsection 1.1', spans: [] },
        { type: 'heading3', text: 'Subsection 1.2', spans: [] },
        { type: 'heading2', text: 'Section 2', spans: [] },
        { type: 'heading3', text: 'Subsection 2.1', spans: [] },
      ]
      const result = extractHeadingsFromRichText(richText)
      
      expect(result).toHaveLength(2)
      expect(result[0].text).toBe('Section 1')
      expect(result[0].children).toHaveLength(2)
      expect(result[0].children![0].text).toBe('Subsection 1.1')
      expect(result[0].children![1].text).toBe('Subsection 1.2')
      expect(result[1].text).toBe('Section 2')
      expect(result[1].children).toHaveLength(1)
      expect(result[1].children![0].text).toBe('Subsection 2.1')
    })

    it('handles empty text in headings', () => {
      const richText: RichTextField = [
        { type: 'heading2', text: '', spans: [] },
        { type: 'heading3', text: null as unknown as string, spans: [] },
      ]
      const result = extractHeadingsFromRichText(richText)
      
      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('')
      expect(result[0].id).toBe('')
    })

    it('ignores heading1, heading5, and heading6', () => {
      const richText: RichTextField = [
        { type: 'heading1' as 'heading2', text: 'H1', spans: [] },
        { type: 'heading2', text: 'H2', spans: [] },
        { type: 'heading5' as 'heading2', text: 'H5', spans: [] },
        { type: 'heading6' as 'heading2', text: 'H6', spans: [] },
      ]
      const result = extractHeadingsFromRichText(richText)
      
      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('H2')
    })

    it('handles complex nesting correctly', () => {
      const richText: RichTextField = [
        { type: 'heading2', text: 'Level 2', spans: [] },
        { type: 'heading4', text: 'Level 4 under 2', spans: [] },
        { type: 'heading3', text: 'Level 3', spans: [] },
        { type: 'heading4', text: 'Level 4 under 3', spans: [] },
        { type: 'heading2', text: 'Another Level 2', spans: [] },
      ]
      const result = extractHeadingsFromRichText(richText)
      
      expect(result).toHaveLength(2)
      expect(result[0].children).toHaveLength(2)
      expect(result[0].children![0].level).toBe(4)
      expect(result[0].children![1].level).toBe(3)
      expect(result[0].children![1].children).toHaveLength(1)
    })
  })

  describe('flattenHeadings', () => {
    it('returns empty array for empty input', () => {
      expect(flattenHeadings([])).toEqual([])
    })

    it('returns flat array for already flat structure', () => {
      const headings: ToCHeading[] = [
        { id: '1', text: 'One', level: 2 },
        { id: '2', text: 'Two', level: 2 },
      ]
      expect(flattenHeadings(headings)).toEqual(headings)
    })

    it('flattens nested structure', () => {
      const headings: ToCHeading[] = [
        {
          id: '1',
          text: 'Parent',
          level: 2,
          children: [
            { id: '1.1', text: 'Child 1', level: 3 },
            { id: '1.2', text: 'Child 2', level: 3 },
          ],
        },
      ]
      const result = flattenHeadings(headings)
      
      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('1.1')
      expect(result[2].id).toBe('1.2')
    })

    it('flattens deeply nested structure', () => {
      const headings: ToCHeading[] = [
        {
          id: '1',
          text: 'Level 1',
          level: 2,
          children: [
            {
              id: '1.1',
              text: 'Level 2',
              level: 3,
              children: [
                { id: '1.1.1', text: 'Level 3', level: 4 },
              ],
            },
          ],
        },
        { id: '2', text: 'Another Level 1', level: 2 },
      ]
      const result = flattenHeadings(headings)
      
      expect(result).toHaveLength(4)
      expect(result.map(h => h.id)).toEqual(['1', '1.1', '1.1.1', '2'])
    })

    it('preserves original heading objects', () => {
      const headings: ToCHeading[] = [
        {
          id: 'parent',
          text: 'Parent',
          level: 2,
          children: [{ id: 'child', text: 'Child', level: 3 }],
        },
      ]
      const result = flattenHeadings(headings)
      
      expect(result[0]).toBe(headings[0])
      expect(result[1]).toBe(headings[0].children![0])
    })
  })
})