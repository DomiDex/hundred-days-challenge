// Polyfill for Node.js environment
const { TextEncoder, TextDecoder } = require('util')
const crypto = require('crypto')

// Import undici for Request/Response polyfills
const undici = require('undici')

// Polyfill global Request, Response, Headers, fetch before any imports
global.Request = undici.Request
global.Response = undici.Response
global.Headers = undici.Headers
global.fetch = undici.fetch
global.FormData = undici.FormData
global.File = undici.File
global.Blob = undici.Blob

// Set up text encoding
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock crypto.webcrypto for Node.js
if (!global.crypto) {
  global.crypto = crypto
}

if (!global.crypto.webcrypto) {
  global.crypto.webcrypto = crypto.webcrypto
}

// Mock env module
jest.mock('@/lib/env', () => require('./src/test-utils/api/env-mock'))

// Mock Next.js cache functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn()
}))

// Mock Mailchimp
jest.mock('@/lib/mailchimp', () => ({
  __esModule: true,
  default: {
    lists: {
      getListMember: jest.fn(),
      updateListMember: jest.fn(),
      addListMember: jest.fn()
    }
  }
}))

// Mock security monitoring
jest.mock('@/lib/security-monitoring', () => ({
  getSecurityMetrics: jest.fn(),
  getFailedLoginAttempts: jest.fn(),
  getCSPViolations: jest.fn(),
  getRateLimitHits: jest.fn(),
  getSecurityEvents: jest.fn()
}))

// Mock Prismic Next
jest.mock('@prismicio/next', () => ({
  redirectToPreviewURL: jest.fn().mockResolvedValue(
    new Response(null, {
      status: 307,
      headers: { location: '/preview' }
    })
  ),
  enableAutoPreviews: jest.fn()
}))

// Mock API auth and handlers
jest.mock('@/lib/api-auth', () => ({
  createSecureApiRoute: jest.fn(handler => handler)
}))

jest.mock('@/lib/error-handler', () => ({
  withErrorHandler: jest.fn(handler => handler)
}))

jest.mock('@/lib/validation', () => ({
  validateRequestBody: jest.fn((body, schema) => body)
}))

// Mock feed generator
jest.mock('@/lib/feed-generator', () => ({
  generateRSSFeed: jest.fn().mockResolvedValue('<?xml version="1.0"?><rss version="2.0"><channel><title>Test</title></channel></rss>'),
  generateAtomFeed: jest.fn().mockResolvedValue('<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Test</title></feed>'),
  generateJSONFeed: jest.fn().mockResolvedValue(JSON.stringify({ version: 'https://jsonfeed.org/version/1', title: 'Test' }))
}))

// Clear all timers/intervals after tests
afterEach(() => {
  jest.clearAllTimers()
})

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: class NextRequest extends Request {
    constructor(input, init) {
      super(input, init)
      this.nextUrl = new URL(input)
      this.cookies = {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
      }
      this.geo = {}
      this.ip = '127.0.0.1'
    }
  },
  NextResponse: {
    json: (body, init) => {
      return new Response(JSON.stringify(body), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(init?.headers || {}),
        },
      })
    },
    redirect: (url, status = 307) => {
      return new Response(null, {
        status,
        headers: {
          location: url.toString(),
        },
      })
    },
    next: () => {
      return new Response(null, { status: 200 })
    },
  },
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME = 'hundred-days-challenge'
process.env.PREVIEW_SECRET = 'test-preview-secret-that-is-at-least-32-chars-long'
process.env.PRISMIC_WEBHOOK_SECRET = 'test-webhook-secret-that-is-at-least-32-chars'
process.env.MAILCHIMP_API_KEY = 'test-api-key-1234567890abcdef-us1'
process.env.MAILCHIMP_LIST_ID = 'test-list-id'
process.env.MAILCHIMP_SERVER_PREFIX = 'us1'
process.env.MAILCHIMP_API_SERVER = 'us1'
process.env.MAILCHIMP_AUDIENCE_ID = 'test-audience-id'