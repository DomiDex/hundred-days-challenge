export type Environment = 'development' | 'staging' | 'production'

export interface SecurityConfig {
  csp: {
    defaultSrc: string[]
    scriptSrc: string[]
    styleSrc: string[]
    imgSrc: string[]
    fontSrc: string[]
    connectSrc: string[]
    objectSrc: string[]
    baseUri: string[]
    formAction: string[]
    frameAncestors: string[]
    reportUri?: string
  }
  enableReporting: boolean
}

function getEnvironment(): Environment {
  if (process.env.NODE_ENV === 'development') {
    return 'development'
  }
  if (process.env.VERCEL_ENV === 'preview') {
    return 'staging'
  }
  return 'production'
}

const baseConfig: SecurityConfig = {
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", 'https://fonts.googleapis.com'],
    imgSrc: ["'self'", 'blob:', 'data:', 'https://images.prismic.io', 'https://prismic.io'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    connectSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    reportUri: '/api/csp-report',
  },
  enableReporting: true,
}

const developmentConfig: SecurityConfig = {
  ...baseConfig,
  csp: {
    ...baseConfig.csp,
    scriptSrc: [
      ...baseConfig.csp.scriptSrc,
      "'unsafe-eval'", // Required for React Fast Refresh
      'http://localhost:*',
      'ws://localhost:*', // WebSocket for HMR
      "'sha256-CjG1SF7x5vU6t2FPiTodr3rfhCM7n03YT9lcVSo0pnA='", // Allow specific inline script
    ],
    styleSrc: [
      ...baseConfig.csp.styleSrc,
      "'unsafe-inline'", // More permissive in dev
    ],
    connectSrc: [
      ...baseConfig.csp.connectSrc,
      'http://localhost:*',
      'ws://localhost:*',
      'wss://localhost:*',
    ],
  },
  enableReporting: false, // Disable in development to reduce noise
}

const stagingConfig: SecurityConfig = {
  ...baseConfig,
  csp: {
    ...baseConfig.csp,
    // Staging might need additional sources for testing
    connectSrc: [
      ...baseConfig.csp.connectSrc,
      // Add any staging-specific API endpoints
    ],
  },
  enableReporting: true,
}

const productionConfig: SecurityConfig = {
  ...baseConfig,
  enableReporting: true,
}

export function getSecurityConfig(): SecurityConfig {
  const env = getEnvironment()

  switch (env) {
    case 'development':
      return developmentConfig
    case 'staging':
      return stagingConfig
    case 'production':
      return productionConfig
    default:
      return productionConfig
  }
}

export function buildCSPHeader(config: SecurityConfig, nonce: string): string {
  const directives: string[] = []

  // Add nonce to script-src and style-src
  const scriptSrc = [...config.csp.scriptSrc, `'nonce-${nonce}'`, "'strict-dynamic'"]
  const styleSrc = [...config.csp.styleSrc, `'nonce-${nonce}'`]

  // Build CSP directives
  directives.push(`default-src ${config.csp.defaultSrc.join(' ')}`)
  directives.push(`script-src ${scriptSrc.join(' ')}`)
  directives.push(`style-src ${styleSrc.join(' ')}`)
  directives.push(`img-src ${config.csp.imgSrc.join(' ')}`)
  directives.push(`font-src ${config.csp.fontSrc.join(' ')}`)
  directives.push(`connect-src ${config.csp.connectSrc.join(' ')}`)
  directives.push(`object-src ${config.csp.objectSrc.join(' ')}`)
  directives.push(`base-uri ${config.csp.baseUri.join(' ')}`)
  directives.push(`form-action ${config.csp.formAction.join(' ')}`)
  directives.push(`frame-ancestors ${config.csp.frameAncestors.join(' ')}`)
  directives.push('upgrade-insecure-requests')

  if (config.enableReporting && config.csp.reportUri) {
    directives.push(`report-uri ${config.csp.reportUri}`)
  }

  return directives.join('; ')
}
