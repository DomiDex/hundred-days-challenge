export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/<[^>]*>/g, '')
}

// Rate limiting helper
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>()

  return (ip: string): boolean => {
    const now = Date.now()
    const timestamps = requests.get(ip) || []
    const recentTimestamps = timestamps.filter((t) => now - t < windowMs)

    if (recentTimestamps.length >= maxRequests) {
      return false
    }

    recentTimestamps.push(now)
    requests.set(ip, recentTimestamps)
    return true
  }
}
