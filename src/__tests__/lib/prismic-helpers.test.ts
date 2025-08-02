import { getAuthorData, asAuthorDocument, getCategoryData } from '@/lib/prismic-helpers'
import { createMockAuthor, createMockCategory } from '@/test-utils/mocks'
import type { CategoryDocument } from '../../../prismicio-types'

describe('prismic-helpers', () => {
  describe('getAuthorData', () => {
    it('extracts author data from valid author object', () => {
      const mockAuthor = createMockAuthor()
      const authorData = getAuthorData(mockAuthor)

      expect(authorData).toEqual(mockAuthor.data)
      expect(authorData?.name).toBe('Test Author')
      expect(authorData?.role).toBe('Senior Developer')
    })

    it('returns null for null input', () => {
      expect(getAuthorData(null)).toBeNull()
    })

    it('returns null for undefined input', () => {
      expect(getAuthorData(undefined)).toBeNull()
    })

    it('returns null for non-object input', () => {
      expect(getAuthorData('string')).toBeNull()
      expect(getAuthorData(123)).toBeNull()
      expect(getAuthorData(true)).toBeNull()
      expect(getAuthorData([])).toBeNull()
    })

    it('returns null for object without data property', () => {
      expect(getAuthorData({ id: '123' })).toBeNull()
    })

    it('returns null when data is not an object', () => {
      expect(getAuthorData({ data: 'not an object' })).toBeNull()
      expect(getAuthorData({ data: null })).toBeNull()
      // Arrays are objects in JavaScript, so this will actually pass the check
      // but return an empty array which is truthy
      const result = getAuthorData({ data: [] })
      expect(result).toEqual([])
    })

    it('handles partial author data', () => {
      const partialAuthor = {
        data: {
          name: 'Partial Author',
          // Missing other fields
        },
      }
      const authorData = getAuthorData(partialAuthor)
      expect(authorData).toEqual({ name: 'Partial Author' })
    })
  })

  describe('asAuthorDocument', () => {
    it('casts valid author response to AuthorDocument', () => {
      const mockAuthor = createMockAuthor()
      const result = asAuthorDocument(mockAuthor)

      expect(result).toEqual(mockAuthor)
      expect(result?.type).toBe('author')
      if (result && result.data && 'name' in result.data) {
        expect(result.data.name).toBe('Test Author')
      }
    })

    it('returns null for null input', () => {
      expect(asAuthorDocument(null)).toBeNull()
    })

    it('returns null for undefined input', () => {
      expect(asAuthorDocument(undefined)).toBeNull()
    })

    it('returns null for non-object input', () => {
      expect(asAuthorDocument('string')).toBeNull()
      expect(asAuthorDocument(123)).toBeNull()
      expect(asAuthorDocument(true)).toBeNull()
    })

    it('returns null for wrong document type', () => {
      const wrongType = { ...createMockAuthor(), type: 'post' }
      expect(asAuthorDocument(wrongType)).toBeNull()
    })

    it('returns null for missing data property', () => {
      const noData = { ...createMockAuthor(), data: undefined }
      expect(asAuthorDocument(noData)).toBeNull()
    })

    it('returns null for missing type property', () => {
      const noType = { ...createMockAuthor() }
      delete (noType as { type?: string }).type
      expect(asAuthorDocument(noType)).toBeNull()
    })
  })

  describe('getCategoryData', () => {
    it('extracts category data from valid category object', () => {
      const mockCategory = createMockCategory()
      const categoryData = getCategoryData(mockCategory)

      expect(categoryData).toEqual(mockCategory.data)
      expect(categoryData?.name).toBe('Technology')
      // The category uid is at the document level, not in data
      expect((mockCategory as CategoryDocument).uid).toBe('test-category')
    })

    it('returns null for null input', () => {
      expect(getCategoryData(null)).toBeNull()
    })

    it('returns null for undefined input', () => {
      expect(getCategoryData(undefined)).toBeNull()
    })

    it('returns null for non-object input', () => {
      expect(getCategoryData('string')).toBeNull()
      expect(getCategoryData(123)).toBeNull()
      expect(getCategoryData(false)).toBeNull()
      expect(getCategoryData([])).toBeNull()
    })

    it('returns null for object without data property', () => {
      expect(getCategoryData({ id: '123', type: 'category' })).toBeNull()
    })

    it('returns null when data is not an object', () => {
      expect(getCategoryData({ data: 'not an object' })).toBeNull()
      expect(getCategoryData({ data: null })).toBeNull()
      expect(getCategoryData({ data: 42 })).toBeNull()
    })

    it('handles partial category data', () => {
      const partialCategory = {
        data: {
          name: 'Partial Category',
          // Missing other fields
        },
      }
      const categoryData = getCategoryData(partialCategory)
      expect(categoryData).toEqual({ name: 'Partial Category' })
    })

    it('handles complex nested data structures', () => {
      const complexCategory = {
        data: {
          name: 'Complex Category',
          slug: 'complex',
          color: '#FF0000',
          description: [{ type: 'paragraph', text: 'Description' }],
          meta_title: 'Meta Title',
          meta_description: 'Meta Description',
        },
      }
      const categoryData = getCategoryData(complexCategory)
      expect(categoryData).toEqual(complexCategory.data)
    })
  })
})