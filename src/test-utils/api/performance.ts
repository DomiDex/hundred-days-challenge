/**
 * Measures API response time
 */
export async function measureResponseTime(
  fn: () => Promise<Response>
): Promise<{ response: Response; duration: number }> {
  const start = performance.now()
  const response = await fn()
  const duration = performance.now() - start
  
  return { response, duration }
}

/**
 * Tests rate limiting behavior
 */
export async function testRateLimit(
  makeRequest: () => Promise<Response>,
  expectedLimit: number
): Promise<void> {
  const responses: Response[] = []
  
  // Make requests up to the limit
  for (let i = 0; i < expectedLimit + 5; i++) {
    responses.push(await makeRequest())
  }
  
  // Check that requests within limit succeed
  for (let i = 0; i < expectedLimit; i++) {
    expect(responses[i].status).toBe(200)
  }
  
  // Check that requests beyond limit are rate limited
  for (let i = expectedLimit; i < responses.length; i++) {
    expect(responses[i].status).toBe(429)
  }
}