/**
 * Asserts that a response is valid JSON with expected status
 */
export async function expectJsonResponse(
  response: Response,
  expectedStatus: number,
  expectedBody?: any
): Promise<any> {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('Content-Type')).toContain('application/json')
  
  const json = await response.json()
  
  if (expectedBody !== undefined) {
    expect(json).toEqual(expectedBody)
  }
  
  return json
}

/**
 * Asserts that a response is an error with expected message
 */
export async function expectErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedMessage?: string
): Promise<void> {
  expect(response.status).toBe(expectedStatus)
  
  const json = await response.json()
  expect(json).toHaveProperty('error')
  
  if (expectedMessage) {
    expect(json.error).toBe(expectedMessage)
  }
}

/**
 * Asserts that a response is a valid feed
 */
export async function expectFeedResponse(
  response: Response,
  contentType: 'rss' | 'atom' | 'json'
): Promise<string> {
  expect(response.status).toBe(200)
  
  const expectedContentTypes = {
    rss: 'application/rss+xml',
    atom: 'application/atom+xml',
    json: 'application/feed+json'
  }
  
  expect(response.headers.get('Content-Type')).toContain(expectedContentTypes[contentType])
  expect(response.headers.get('Cache-Control')).toBeDefined()
  
  const content = await response.text()
  expect(content).toBeTruthy()
  
  return content
}

/**
 * Asserts redirect response
 */
export function expectRedirectResponse(
  response: Response,
  expectedUrl: string,
  expectedStatus: number = 307
): void {
  expect(response.status).toBe(expectedStatus)
  expect(response.headers.get('Location')).toBe(expectedUrl)
}