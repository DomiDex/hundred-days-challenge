import { NextResponse } from 'next/server'
import { ValidationError } from './validation'

// Custom error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED')
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'INSUFFICIENT_PERMISSIONS')
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class RateLimitError extends ApiError {
  constructor(
    message: string = 'Too many requests',
    public retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}

// Error response formatter
interface ErrorResponse {
  error: {
    message: string
    code?: string
    details?: unknown
  }
  timestamp: string
  requestId?: string
}

// Create standardized error response
export function createErrorResponse(
  error: unknown,
  options: {
    statusCode?: number
    requestId?: string
    includeDetails?: boolean
  } = {}
): NextResponse<ErrorResponse> {
  const { statusCode = 500, requestId, includeDetails = false } = options
  const isDevelopment = process.env.NODE_ENV === 'development'

  let message = 'Internal server error'
  let code: string | undefined
  let details: unknown = undefined
  let finalStatusCode = statusCode

  // Handle different error types
  if (error instanceof ApiError) {
    message = error.message
    code = error.code
    finalStatusCode = error.statusCode
  } else if (error && typeof error === 'object' && 'errors' in error) {
    // Handle ZodError
    message = 'Validation error'
    code = 'VALIDATION_ERROR'
    finalStatusCode = 400
    if (includeDetails || isDevelopment) {
      // Access errors property without type assertion
      const errorWithErrors = error as { errors: unknown }
      if (Array.isArray(errorWithErrors.errors)) {
        details = errorWithErrors.errors.map((e: unknown) => {
          const errorItem = e as { path?: unknown; message?: unknown }
          return {
            path: Array.isArray(errorItem.path)
              ? errorItem.path.join('.')
              : String(errorItem.path || ''),
            message: String(errorItem.message || 'Validation error'),
          }
        })
      } else {
        details = error
      }
    }
  } else if (error instanceof ValidationError) {
    message = error.message
    code = 'VALIDATION_ERROR'
    finalStatusCode = 400
    if (includeDetails || (isDevelopment && error.field)) {
      details = { field: error.field }
    }
  } else if (error instanceof Error) {
    // Only show actual error message in development
    if (isDevelopment) {
      message = error.message
    }
    // Log the full error server-side
    console.error('Unhandled error:', error)
  } else {
    // Unknown error type
    console.error('Unknown error type:', error)
  }

  const errorResponse: ErrorResponse = {
    error: {
      message,
      ...(code ? { code } : {}),
      ...(details !== undefined ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
    ...(requestId ? { requestId } : {}),
  }

  // Add rate limit headers if applicable
  const headers: HeadersInit = {}
  if (error instanceof RateLimitError && error.retryAfter) {
    headers['Retry-After'] = error.retryAfter.toString()
  }

  return NextResponse.json(errorResponse, {
    status: finalStatusCode,
    headers,
  })
}

// Global error handler for API routes
export async function withErrorHandler<T>(
  handler: () => Promise<T>,
  options: {
    requestId?: string
    logError?: boolean
  } = {}
): Promise<T | NextResponse> {
  const { requestId, logError = true } = options

  try {
    return await handler()
  } catch (error) {
    if (logError) {
      console.error(`Error in request ${requestId || 'unknown'}:`, error)
    }

    return createErrorResponse(error, { requestId })
  }
}

// Error logging utility
export function logError(
  error: unknown,
  context: {
    requestId?: string
    userId?: string
    path?: string
    method?: string
    [key: string]: unknown
  } = {}
): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    ...context,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          }
        : error,
  }

  // In production, this would send to a logging service
  console.error('Application Error:', JSON.stringify(errorInfo, null, 2))
}

// Client-safe error messages
export const CLIENT_ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  AUTHENTICATION: 'Please sign in to continue.',
  AUTHORIZATION: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMIT: 'Too many requests. Please slow down.',
  NETWORK: 'Network error. Please check your connection.',
} as const

// Get client-safe error message
export function getClientErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 400:
        return CLIENT_ERROR_MESSAGES.VALIDATION
      case 401:
        return CLIENT_ERROR_MESSAGES.AUTHENTICATION
      case 403:
        return CLIENT_ERROR_MESSAGES.AUTHORIZATION
      case 404:
        return CLIENT_ERROR_MESSAGES.NOT_FOUND
      case 429:
        return CLIENT_ERROR_MESSAGES.RATE_LIMIT
      default:
        return CLIENT_ERROR_MESSAGES.GENERIC
    }
  }

  return CLIENT_ERROR_MESSAGES.GENERIC
}
