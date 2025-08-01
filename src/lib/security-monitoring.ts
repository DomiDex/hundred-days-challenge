import { NextRequest } from 'next/server'

// Security event types
export enum SecurityEventType {
  AUTH_FAILURE = 'AUTH_FAILURE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  CSP_VIOLATION = 'CSP_VIOLATION',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  PREVIEW_ACCESS = 'PREVIEW_ACCESS',
  API_KEY_INVALID = 'API_KEY_INVALID',
  WEBHOOK_INVALID = 'WEBHOOK_INVALID',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
}

// Security event severity
export enum SecurityEventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Security event interface
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: SecurityEventSeverity
  timestamp: Date
  ip?: string
  userAgent?: string
  url?: string
  method?: string
  userId?: string
  details?: Record<string, unknown>
  blocked?: boolean
}

// In-memory storage for recent events (in production, use a proper database)
const recentEvents: SecurityEvent[] = []
const MAX_EVENTS = 1000

// Thresholds for alerting
const ALERT_THRESHOLDS = {
  [SecurityEventType.AUTH_FAILURE]: { count: 5, window: 300000 }, // 5 failures in 5 minutes
  [SecurityEventType.RATE_LIMIT_EXCEEDED]: { count: 10, window: 600000 }, // 10 in 10 minutes
  [SecurityEventType.INVALID_INPUT]: { count: 20, window: 300000 }, // 20 in 5 minutes
  [SecurityEventType.XSS_ATTEMPT]: { count: 1, window: 0 }, // Alert immediately
  [SecurityEventType.SQL_INJECTION_ATTEMPT]: { count: 1, window: 0 }, // Alert immediately
}

// Log security event
export function logSecurityEvent(
  type: SecurityEventType,
  request?: NextRequest,
  details?: Record<string, unknown>,
  severity?: SecurityEventSeverity
): SecurityEvent {
  const event: SecurityEvent = {
    id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    severity: severity || getSeverityForType(type),
    timestamp: new Date(),
    ip: request ? getClientIp(request) : undefined,
    userAgent: request?.headers.get('user-agent') || undefined,
    url: request?.url,
    method: request?.method,
    details,
    blocked: false,
  }

  // Store event
  recentEvents.push(event)
  if (recentEvents.length > MAX_EVENTS) {
    recentEvents.shift()
  }

  // Log to console (in production, send to logging service)
  console.log('[SECURITY]', JSON.stringify(event))

  // Check if we need to alert
  checkAlertThreshold(type, event.ip)

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    sendToMonitoringService(event)
  }

  return event
}

// Get client IP from request
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

// Get default severity for event type
function getSeverityForType(type: SecurityEventType): SecurityEventSeverity {
  switch (type) {
    case SecurityEventType.XSS_ATTEMPT:
    case SecurityEventType.SQL_INJECTION_ATTEMPT:
      return SecurityEventSeverity.CRITICAL
    case SecurityEventType.AUTH_FAILURE:
    case SecurityEventType.API_KEY_INVALID:
    case SecurityEventType.WEBHOOK_INVALID:
      return SecurityEventSeverity.HIGH
    case SecurityEventType.RATE_LIMIT_EXCEEDED:
    case SecurityEventType.SUSPICIOUS_ACTIVITY:
      return SecurityEventSeverity.MEDIUM
    default:
      return SecurityEventSeverity.LOW
  }
}

// Check if we should alert based on threshold
function checkAlertThreshold(type: SecurityEventType, ip?: string): void {
  const threshold = ALERT_THRESHOLDS[type]
  if (!threshold) return

  const now = Date.now()
  const relevantEvents = recentEvents.filter(
    (event) =>
      event.type === type &&
      (!ip || event.ip === ip) &&
      now - event.timestamp.getTime() < threshold.window
  )

  if (relevantEvents.length >= threshold.count) {
    sendAlert({
      type,
      count: relevantEvents.length,
      window: threshold.window,
      ip,
      message: `Security threshold exceeded: ${relevantEvents.length} ${type} events in ${
        threshold.window / 1000
      } seconds`,
    })
  }
}

// Send alert (implement based on your alerting system)
function sendAlert(alert: {
  type: SecurityEventType
  count: number
  window: number
  ip?: string
  message: string
}): void {
  console.error('[SECURITY ALERT]', alert)

  // In production, send to:
  // - Email
  // - Slack/Discord
  // - PagerDuty
  // - SMS
}

// Send event to monitoring service
function sendToMonitoringService(event: SecurityEvent): void {
  // TODO: Implement integration with monitoring service
  // Examples: Sentry, DataDog, New Relic, CloudWatch
}

// Get security metrics
export function getSecurityMetrics(window: number = 3600000): {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsBySeverity: Record<string, number>
  topIPs: Array<{ ip: string; count: number }>
  recentHighSeverityEvents: SecurityEvent[]
} {
  const now = Date.now()
  const relevantEvents = recentEvents.filter((event) => now - event.timestamp.getTime() < window)

  const eventsByType: Record<string, number> = {}
  const eventsBySeverity: Record<string, number> = {}
  const ipCounts: Record<string, number> = {}

  for (const event of relevantEvents) {
    // Count by type
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1

    // Count by severity
    eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1

    // Count by IP
    if (event.ip) {
      ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1
    }
  }

  // Get top IPs
  const topIPs = Object.entries(ipCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }))

  // Get recent high severity events
  const recentHighSeverityEvents = relevantEvents
    .filter(
      (event) =>
        event.severity === SecurityEventSeverity.HIGH ||
        event.severity === SecurityEventSeverity.CRITICAL
    )
    .slice(-10)

  return {
    totalEvents: relevantEvents.length,
    eventsByType,
    eventsBySeverity,
    topIPs,
    recentHighSeverityEvents,
  }
}

// Middleware to detect suspicious patterns
export function detectSuspiciousPatterns(request: NextRequest): void {
  const url = request.url
  const body = request.body

  // Check for common attack patterns
  const suspiciousPatterns = [
    // SQL Injection
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(from|where|table|database)\b)/i,
    // XSS
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    // Path traversal
    /\.\.(\/|\\)/g,
    // Command injection
    /[;&|`].*?(cat|ls|pwd|whoami|id|uname|ps|netstat)/i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, request, {
        pattern: pattern.toString(),
        match: url.match(pattern)?.[0],
      })
      break
    }
  }
}

// Clean up old events periodically
if (typeof window === 'undefined') {
  setInterval(
    () => {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000 // 24 hours
      while (recentEvents.length > 0 && recentEvents[0].timestamp.getTime() < cutoff) {
        recentEvents.shift()
      }
    },
    60 * 60 * 1000
  ) // Every hour
}
