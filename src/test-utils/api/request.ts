import { NextRequest } from 'next/server'

/**
 * Creates a mock NextRequest for testing API routes
 */
export function createMockRequest(
  options: {
    method?: string
    url?: string
    headers?: Record<string, string>
    body?: string | Record<string, unknown> | FormData | null
    params?: Record<string, string>
    searchParams?: Record<string, string>
    cookies?: Record<string, string>
  } = {}
): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    headers: customHeaders = {},
    body,
    searchParams = {},
    cookies = {},
  } = options

  // Create URL with search params
  const urlObj = new URL(url)
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })

  // Create headers
  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    ...customHeaders,
  })

  // Add cookies to headers
  if (Object.keys(cookies).length > 0) {
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')
    requestHeaders.set('Cookie', cookieString)
  }

  // Create request init with proper typing for NextRequest
  const init: RequestInit = {
    method,
    headers: requestHeaders,
  }

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    init.body = JSON.stringify(body)
  }

  return new NextRequest(urlObj.toString(), init as ConstructorParameters<typeof NextRequest>[1])
}

/**
 * Creates mock headers for testing
 */
export function createMockHeaders(customHeaders: Record<string, string> = {}): Headers {
  return new Headers({
    'Content-Type': 'application/json',
    'User-Agent': 'Jest Test',
    ...customHeaders,
  })
}
