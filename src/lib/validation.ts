// Input validation and sanitization utilities

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Alphanumeric with dashes and underscores (for slugs, IDs, etc.)
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-zA-Z0-9_-]+$/
  return slugRegex.test(slug)
}

// Sanitize string input
export function sanitizeString(input: string, maxLength = 1000): string {
  return input.trim().slice(0, maxLength).replace(/[<>]/g, '') // Remove potential HTML tags
}

// Sanitize HTML content (basic)
export function sanitizeHtml(html: string): string {
  // This is a basic sanitization. For production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '')
}

// Validate and sanitize query parameters
export function validateQueryParam(
  value: string | null,
  options: {
    required?: boolean
    type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'slug'
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: RegExp
    enum?: string[]
  } = {}
): string | number | boolean | null {
  const {
    required = false,
    type = 'string',
    minLength,
    maxLength = 1000,
    min,
    max,
    pattern,
    enum: allowedValues,
  } = options

  // Handle null/undefined
  if (value === null || value === undefined || value === '') {
    if (required) {
      throw new ValidationError('Value is required')
    }
    return null
  }

  // Type validation and conversion
  let processedValue: string | number | boolean = value

  switch (type) {
    case 'number':
      const num = Number(value)
      if (isNaN(num)) {
        throw new ValidationError('Value must be a number')
      }
      if (min !== undefined && num < min) {
        throw new ValidationError(`Value must be at least ${min}`)
      }
      if (max !== undefined && num > max) {
        throw new ValidationError(`Value must be at most ${max}`)
      }
      return num

    case 'boolean':
      if (value === 'true' || value === '1') return true
      if (value === 'false' || value === '0') return false
      throw new ValidationError('Value must be a boolean')

    case 'email':
      if (!isValidEmail(value)) {
        throw new ValidationError('Invalid email format')
      }
      processedValue = value.toLowerCase()
      break

    case 'url':
      if (!isValidUrl(value)) {
        throw new ValidationError('Invalid URL format')
      }
      break

    case 'slug':
      if (!isValidSlug(value)) {
        throw new ValidationError('Invalid slug format')
      }
      break
  }

  // String validation
  if (typeof processedValue === 'string') {
    if (minLength !== undefined && processedValue.length < minLength) {
      throw new ValidationError(`Value must be at least ${minLength} characters`)
    }
    if (maxLength !== undefined && processedValue.length > maxLength) {
      throw new ValidationError(`Value must be at most ${maxLength} characters`)
    }
    if (pattern && !pattern.test(processedValue)) {
      throw new ValidationError('Value does not match required pattern')
    }
    if (allowedValues && !allowedValues.includes(processedValue)) {
      throw new ValidationError(`Value must be one of: ${allowedValues.join(', ')}`)
    }

    // Sanitize string
    processedValue = sanitizeString(processedValue, maxLength)
  }

  return processedValue
}

// Validate request body
export function validateRequestBody<T extends Record<string, unknown>>(
  body: unknown,
  schema: {
    [K in keyof T]: {
      required?: boolean
      type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
      validator?: (value: unknown) => boolean
      sanitizer?: (value: unknown) => T[K]
    }
  }
): T {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be an object')
  }

  const validated: Partial<T> = {}
  const bodyObj = body as Record<string, unknown>

  for (const [field, rules] of Object.entries(schema)) {
    const value = bodyObj[field]

    if (value === undefined || value === null) {
      if (rules.required) {
        throw new ValidationError(`Field '${field}' is required`, field)
      }
      continue
    }

    // Type check
    if (rules.type) {
      const valueType = Array.isArray(value) ? 'array' : typeof value
      if (valueType !== rules.type) {
        throw new ValidationError(`Field '${field}' must be of type ${rules.type}`, field, value)
      }
    }

    // Custom validator
    if (rules.validator && !rules.validator(value)) {
      throw new ValidationError(`Field '${field}' is invalid`, field, value)
    }

    // Sanitizer
    if (rules.sanitizer) {
      validated[field as keyof T] = rules.sanitizer(value)
    } else {
      validated[field as keyof T] = value as T[keyof T]
    }
  }

  return validated as T
}

// Common validators
export const validators = {
  isNonEmptyString: (value: unknown): boolean =>
    typeof value === 'string' && value.trim().length > 0,

  isPositiveNumber: (value: unknown): boolean => typeof value === 'number' && value > 0,

  isNonEmptyArray: (value: unknown): boolean => Array.isArray(value) && value.length > 0,

  isValidDate: (value: unknown): boolean => {
    if (typeof value !== 'string') return false
    const date = new Date(value)
    return !isNaN(date.getTime())
  },
}

// Common sanitizers
export const sanitizers = {
  trim: (value: unknown): string =>
    typeof value === 'string' ? value.trim() : String(value).trim(),

  lowercase: (value: unknown): string =>
    typeof value === 'string' ? value.toLowerCase() : String(value).toLowerCase(),

  uppercase: (value: unknown): string =>
    typeof value === 'string' ? value.toUpperCase() : String(value).toUpperCase(),

  toNumber: (value: unknown): number => {
    const num = Number(value)
    if (isNaN(num)) throw new ValidationError('Invalid number')
    return num
  },

  toBoolean: (value: unknown): boolean =>
    value === true || value === 'true' || value === '1' || value === 1,
}
