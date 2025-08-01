import { NextResponse } from 'next/server'

export interface ErrorResponse {
  error: string
  code?: string
  timestamp?: string
  requestId?: string
}

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

// Common API errors
export const ApiErrors = {
  BadRequest: (message = 'Bad request') => new ApiError(message, 400, 'BAD_REQUEST'),
  Unauthorized: (message = 'Unauthorized') => new ApiError(message, 401, 'UNAUTHORIZED'),
  Forbidden: (message = 'Forbidden') => new ApiError(message, 403, 'FORBIDDEN'),
  NotFound: (message = 'Not found') => new ApiError(message, 404, 'NOT_FOUND'),
  MethodNotAllowed: (message = 'Method not allowed') =>
    new ApiError(message, 405, 'METHOD_NOT_ALLOWED'),
  Conflict: (message = 'Conflict') => new ApiError(message, 409, 'CONFLICT'),
  TooManyRequests: (message = 'Too many requests') =>
    new ApiError(message, 429, 'TOO_MANY_REQUESTS'),
  InternalError: (message = 'Internal server error') =>
    new ApiError(message, 500, 'INTERNAL_ERROR'),
  ServiceUnavailable: (message = 'Service unavailable') =>
    new ApiError(message, 503, 'SERVICE_UNAVAILABLE'),
}

// Generate a request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Log error details (server-side only)
function logError(
  error: Error | ApiError,
  context: {
    requestId: string
    method?: string
    url?: string
    ip?: string
    userAgent?: string
  }
): void {
  const errorDetails = {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error instanceof ApiError ? error.statusCode : 500,
      code: error instanceof ApiError ? error.code : 'UNKNOWN_ERROR',
    },
    request: {
      method: context.method,
      url: context.url,
      ip: context.ip,
      userAgent: context.userAgent,
    },
  }

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry, DataDog, etc.
    console.error('Production error:', JSON.stringify(errorDetails))
  } else {
    console.error('Development error:', errorDetails)
  }
}

// Handle errors and return appropriate response
export function handleApiError(
  error: unknown,
  context?: {
    method?: string
    url?: string
    ip?: string
    userAgent?: string
  }
): NextResponse<ErrorResponse> {
  const requestId = generateRequestId()
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Default error response
  let statusCode = 500
  let errorMessage = 'An unexpected error occurred'
  let errorCode = 'INTERNAL_ERROR'

  // Handle known error types
  if (error instanceof ApiError) {
    statusCode = error.statusCode
    errorMessage = error.message
    errorCode = error.code || 'API_ERROR'
  } else if (error instanceof Error) {
    // In development, show actual error message
    if (isDevelopment) {
      errorMessage = error.message
    }

    // Map common errors to appropriate status codes
    if (error.name === 'ValidationError') {
      statusCode = 400
      errorCode = 'VALIDATION_ERROR'
    } else if (error.message.includes('Unauthorized')) {
      statusCode = 401
      errorCode = 'UNAUTHORIZED'
    } else if (error.message.includes('Not found')) {
      statusCode = 404
      errorCode = 'NOT_FOUND'
    }
  }

  // Log the error
  logError(error instanceof Error ? error : new Error(String(error)), {
    requestId,
    ...context,
  })

  // Build response
  const response: ErrorResponse = {
    error: errorMessage,
    code: errorCode,
    requestId,
  }

  // Only include timestamp in development
  if (isDevelopment) {
    response.timestamp = new Date().toISOString()
  }

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      'X-Request-Id': requestId,
    },
  })
}

// Wrapper for async route handlers
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      // Extract context from request if available
      const request = args[0] as { method?: string; url?: string; headers?: Headers } | undefined

      const context = request
        ? {
            method: request.method,
            url: request.url,
            ip:
              request.headers?.get('x-forwarded-for')?.split(',')[0] ||
              request.headers?.get('x-real-ip') ||
              'unknown',
            userAgent: request.headers?.get('user-agent') || undefined,
          }
        : undefined

      return handleApiError(error, context)
    }
  }
}

// Safe JSON parsing with error handling
export function safeJsonParse<T>(json: string, fallback?: T): T | undefined {
  try {
    return JSON.parse(json) as T
  } catch {
    if (fallback !== undefined) {
      return fallback
    }
    throw new ApiError('Invalid JSON format', 400, 'INVALID_JSON')
  }
}

// Safe async wrapper that catches and logs errors
export async function safeAsync<T>(fn: () => Promise<T>, fallback?: T): Promise<T | undefined> {
  try {
    return await fn()
  } catch (err) {
    console.error('Safe async error:', err)
    return fallback
  }
}
