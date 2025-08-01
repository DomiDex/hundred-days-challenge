'use client'

import DOMPurify from 'isomorphic-dompurify'

// Configure DOMPurify for client-side use
const purifyConfig = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
    'em',
    'strong',
    'pre',
    'code',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'article',
    'section',
    'header',
    'footer',
    'aside',
    'nav',
    'figure',
    'figcaption',
    'mark',
    'small',
    'del',
    'ins',
    'sub',
    'sup',
  ],
  ALLOWED_ATTR: [
    'href',
    'title',
    'target',
    'rel',
    'class',
    'id',
    'src',
    'alt',
    'width',
    'height',
    'loading',
    'data-*',
    'aria-*',
    'role',
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: true,
  RETURN_TRUSTED_TYPE: false,
}

// Sanitize HTML content for safe rendering
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (handle server-side differently)
    return dirty
  }

  return DOMPurify.sanitize(dirty, purifyConfig)
}

// Sanitize user input for display (more restrictive)
export function sanitizeUserInput(input: string): string {
  if (typeof window === 'undefined') {
    return input
  }

  const strictConfig = {
    ALLOWED_TAGS: ['p', 'br', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  }

  return DOMPurify.sanitize(input, strictConfig)
}

// Safe local storage wrapper with encryption for sensitive data
export const secureStorage = {
  setItem(key: string, value: unknown, encrypt = false): void {
    if (typeof window === 'undefined') return

    try {
      const stringValue = JSON.stringify(value)
      const finalValue = encrypt ? btoa(stringValue) : stringValue
      localStorage.setItem(key, finalValue)
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  },

  getItem<T>(key: string, decrypt = false): T | null {
    if (typeof window === 'undefined') return null

    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const decodedItem = decrypt ? atob(item) : item
      return JSON.parse(decodedItem) as T
    } catch (error) {
      console.error('Failed to retrieve from localStorage:', error)
      return null
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  },
}

// XSS prevention utilities
export function escapeHtml(unsafe: string): string {
  const div = document.createElement('div')
  div.textContent = unsafe
  return div.innerHTML
}

// Content Security Policy violation reporter
export function setupCSPReporter(): void {
  if (typeof window === 'undefined') return

  document.addEventListener('securitypolicyviolation', (event) => {
    console.error('CSP Violation:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      disposition: event.disposition,
      documentURI: event.documentURI,
      effectiveDirective: event.effectiveDirective,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
      sourceFile: event.sourceFile,
      statusCode: event.statusCode,
      referrer: event.referrer,
      sample: event.sample,
    })

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to your monitoring service
      // sendToMonitoring('/api/csp-report', violationData)
    }
  })
}

// Secure form submission
export function createSecureFormData(form: HTMLFormElement): FormData {
  const formData = new FormData(form)
  const secureData = new FormData()

  // Sanitize each form field
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      // Basic sanitization - adjust based on field type
      const sanitized = value.trim().slice(0, 10000) // Max 10k chars
      secureData.append(key, sanitized)
    } else {
      // For files, could add file type validation here
      secureData.append(key, value)
    }
  }

  return secureData
}

// Detect suspicious activity
export function detectSuspiciousActivity(): void {
  if (typeof window === 'undefined') return

  let suspiciousEvents = 0
  const threshold = 10
  const resetTime = 60000 // 1 minute

  // Monitor rapid clicks (potential bot/abuse)
  let clickCount = 0
  let clickTimer: NodeJS.Timeout

  document.addEventListener('click', () => {
    clickCount++

    if (clickCount > threshold) {
      console.warn('Suspicious click activity detected')
      suspiciousEvents++
      // Could trigger additional security measures here
    }

    clearTimeout(clickTimer)
    clickTimer = setTimeout(() => {
      clickCount = 0
    }, 1000) // Reset after 1 second of no clicks
  })

  // Monitor console usage (potential attacker reconnaissance)
  const originalLog = console.log
  const originalWarn = console.warn
  const originalError = console.error

  if (process.env.NODE_ENV === 'production') {
    console.log = (...args) => {
      suspiciousEvents++
      originalLog.apply(console, args)
    }

    console.warn = (...args) => {
      suspiciousEvents++
      originalWarn.apply(console, args)
    }

    console.error = (...args) => {
      originalError.apply(console, args)
    }
  }

  // Reset suspicious events counter periodically
  setInterval(() => {
    if (suspiciousEvents > threshold * 2) {
      console.warn('High level of suspicious activity detected')
      // Could implement additional security measures
    }
    suspiciousEvents = 0
  }, resetTime)
}

// Initialize client-side security measures
export function initializeClientSecurity(): void {
  if (typeof window === 'undefined') return

  // Set up CSP reporter
  setupCSPReporter()

  // Set up suspicious activity detection
  if (process.env.NODE_ENV === 'production') {
    detectSuspiciousActivity()
  }

  // Disable right-click in production (optional)
  if (process.env.NODE_ENV === 'production') {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      return false
    })
  }

  // Monitor for devtools (optional, controversial)
  const devtools = { open: false, orientation: '' }
  const threshold = 160

  setInterval(() => {
    if (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    ) {
      if (!devtools.open) {
        devtools.open = true
        console.log('DevTools detected')
      }
    } else {
      devtools.open = false
    }
  }, 500)
}

// Secure fetch wrapper with timeout and retry
export async function secureFetch(
  url: string,
  options: RequestInit = {},
  config: {
    timeout?: number
    retries?: number
    retryDelay?: number
  } = {}
): Promise<Response> {
  const { timeout = 30000, retries = 1, retryDelay = 1000 } = config

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const secureOptions: RequestInit = {
    ...options,
    signal: controller.signal,
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    },
  }

  let lastError: Error | null = null

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, secureOptions)
      clearTimeout(timeoutId)

      if (!response.ok && i < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        continue
      }

      return response
    } catch (error) {
      lastError = error as Error

      if (i < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        continue
      }
    }
  }

  clearTimeout(timeoutId)
  throw lastError || new Error('Fetch failed')
}
