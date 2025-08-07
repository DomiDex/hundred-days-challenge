import crypto from 'crypto'

/**
 * Creates authorization header with bearer token
 */
export function createAuthHeader(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  }
}

/**
 * Generates a valid JWT token for testing
 */
export function generateTestToken(
  payload: {
    sub?: string
    role?: string
    exp?: number
  } = {}
): string {
  // Simple base64 encoded token for testing
  const header = { alg: 'HS256', typ: 'JWT' }
  const defaultPayload = {
    sub: 'test-user',
    role: 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(defaultPayload)).toString('base64url')
  const signature = 'test-signature'

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Creates CSRF token header
 */
export function createCSRFHeader(token: string): Record<string, string> {
  return {
    'X-CSRF-Token': token,
  }
}

/**
 * Generates webhook signature
 */
export function generateWebhookSignature(payload: string | object, secret: string): string {
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload)

  return crypto.createHmac('sha256', secret).update(payloadString).digest('hex')
}
