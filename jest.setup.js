import '@testing-library/jest-dom'

// Mock Prismic
jest.mock('@prismicio/client', () => ({
  createClient: jest.fn(),
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