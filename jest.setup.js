import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Setup TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill Response for Node.js test environment
if (!global.Response) {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Map()
      this.ok = this.status >= 200 && this.status < 300

      if (init.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value)
        })
      }
    }

    async text() {
      return this.body
    }

    async json() {
      return JSON.parse(this.body)
    }
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock Prismic
jest.mock('@prismicio/client', () => ({
  createClient: jest.fn(),
  isFilled: {
    image: jest.fn((field) => field && field.url),
  },
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '',
}))

// Mock GSAP
jest.mock('gsap', () => ({
  gsap: {
    to: jest.fn(),
    from: jest.fn(),
    fromTo: jest.fn(),
    set: jest.fn(),
    timeline: jest.fn(() => ({
      to: jest.fn(),
      from: jest.fn(),
      fromTo: jest.fn(),
      set: jest.fn(),
      add: jest.fn(),
      play: jest.fn(),
      pause: jest.fn(),
      reverse: jest.fn(),
      kill: jest.fn(),
    })),
    registerPlugin: jest.fn(),
    config: jest.fn(),
    utils: {
      toArray: jest.fn(() => []),
    },
  },
  ScrollTrigger: {
    create: jest.fn(),
    refresh: jest.fn(),
    update: jest.fn(),
    getAll: jest.fn(() => []),
    getById: jest.fn(),
    kill: jest.fn(),
  },
}))

// Mock useGSAP hook
jest.mock('@gsap/react', () => ({
  useGSAP: (callback, dependencies) => {
    const { useEffect } = require('react')
    useEffect(() => {
      const context = {
        add: jest.fn(),
        revert: jest.fn(),
      }
      callback(context)
      return () => context.revert()
    }, dependencies)
  },
}))
