// Helper functions for Prismic type handling
import type { AuthorDocument, AuthorDocumentData } from '@/types/author-types'
import type { ExtendedCategoryDocumentData } from '@/types/category-types'

// Helper function to safely extract author data
export function getAuthorData(author: unknown): AuthorDocumentData | null {
  if (!author || typeof author !== 'object') return null

  const authorObj = author as Record<string, unknown>
  if (!authorObj.data || typeof authorObj.data !== 'object') return null

  return authorObj.data as AuthorDocumentData
}

// Helper function to cast author response to AuthorDocument
export function asAuthorDocument(response: unknown): AuthorDocument | null {
  if (!response || typeof response !== 'object') return null

  const doc = response as Record<string, unknown>
  if (doc.type !== 'author' || !doc.data) return null

  return response as AuthorDocument
}

// Helper function to safely extract category data
export function getCategoryData(category: unknown): ExtendedCategoryDocumentData | null {
  if (!category || typeof category !== 'object') return null

  const categoryObj = category as Record<string, unknown>
  if (!categoryObj.data || typeof categoryObj.data !== 'object') return null

  return categoryObj.data as ExtendedCategoryDocumentData
}
