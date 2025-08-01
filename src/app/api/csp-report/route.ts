import { NextRequest, NextResponse } from 'next/server'

// Rate limiting store (in production, use Redis or similar)
const reportCounts = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REPORTS_PER_WINDOW = 10

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Check rate limit
    const now = Date.now()
    const clientData = reportCounts.get(clientIp)

    if (clientData) {
      if (now - clientData.timestamp < RATE_LIMIT_WINDOW) {
        if (clientData.count >= MAX_REPORTS_PER_WINDOW) {
          return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
        }
        clientData.count++
      } else {
        // Reset window
        reportCounts.set(clientIp, { count: 1, timestamp: now })
      }
    } else {
      reportCounts.set(clientIp, { count: 1, timestamp: now })
    }

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      for (const [ip, data] of reportCounts.entries()) {
        if (now - data.timestamp > RATE_LIMIT_WINDOW * 2) {
          reportCounts.delete(ip)
        }
      }
    }

    // Parse CSP report
    const body = await request.json()
    const report = body['csp-report']

    if (!report) {
      return NextResponse.json({ error: 'Invalid CSP report format' }, { status: 400 })
    }

    // Log the violation (in production, send to monitoring service)
    console.warn('CSP Violation:', {
      documentUri: report['document-uri'],
      violatedDirective: report['violated-directive'],
      effectiveDirective: report['effective-directive'],
      originalPolicy: report['original-policy'],
      blockedUri: report['blocked-uri'],
      sourceFile: report['source-file'],
      lineNumber: report['line-number'],
      columnNumber: report['column-number'],
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: clientIp,
    })

    // In production, you would send this to a monitoring service like:
    // - Sentry
    // - DataDog
    // - CloudWatch
    // - Custom logging solution

    return NextResponse.json({ success: true }, { status: 204 })
  } catch (error) {
    console.error('Error processing CSP report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
