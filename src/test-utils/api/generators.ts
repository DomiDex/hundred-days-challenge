/**
 * Generates a CSP violation report
 */
export function createCSPReport(overrides: Partial<{
  documentUri: string
  violatedDirective: string
  effectiveDirective: string
  originalPolicy: string
  blockedUri: string
  statusCode: number
  referrer: string
  scriptSample: string
  disposition: string
}> = {}): any {
  const {
    documentUri = 'https://example.com/page',
    violatedDirective = 'script-src',
    effectiveDirective = 'script-src',
    originalPolicy = "default-src 'self'",
    blockedUri = 'https://evil.com/script.js',
    statusCode = 0,
    referrer = '',
    scriptSample = '',
    disposition = 'enforce'
  } = overrides
  
  return {
    'csp-report': {
      'document-uri': documentUri,
      'violated-directive': violatedDirective,
      'effective-directive': effectiveDirective,
      'original-policy': originalPolicy,
      'blocked-uri': blockedUri,
      'status-code': statusCode,
      'referrer': referrer,
      'script-sample': scriptSample,
      'disposition': disposition
    }
  }
}

/**
 * Generates newsletter subscription data
 */
export function createSubscriptionData(overrides: Partial<{
  email: string
  firstName: string
  lastName: string
  tags: string[]
}> = {}) {
  return {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    tags: ['blog', 'newsletter'],
    ...overrides
  }
}

/**
 * Generates webhook event
 */
export function createWebhookEvent(type: string, data: any = {}) {
  return {
    id: 'evt_123',
    type,
    created: Date.now(),
    data,
    signature: 'test-signature'
  }
}

/**
 * Generates Prismic webhook event
 */
export function createPrismicWebhookEvent(overrides: Partial<{
  type: string
  secret: string | null
  masterRef: string | null
  domain: string
  apiUrl: string
  documents: string[]
}> = {}) {
  return {
    type: 'api-update',
    secret: null,
    masterRef: null,
    domain: 'hundred-days-challenge',
    apiUrl: 'https://hundred-days-challenge.prismic.io/api/v2',
    documents: [],
    ...overrides
  }
}