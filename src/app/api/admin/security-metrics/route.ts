import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/api-auth'
import { getSecurityMetrics } from '@/lib/security-monitoring'
import { ApiError } from '@/lib/error-handler'

async function handler(request: NextRequest): Promise<NextResponse> {
  // This endpoint requires API key authentication
  const searchParams = new URL(request.url).searchParams
  const window = searchParams.get('window')

  try {
    const windowMs = window ? parseInt(window) : 3600000 // Default 1 hour

    if (isNaN(windowMs) || windowMs < 0 || windowMs > 86400000) {
      throw new ApiError('Invalid window parameter', 400)
    }

    const metrics = getSecurityMetrics(windowMs)

    return NextResponse.json({
      success: true,
      data: metrics,
      window: windowMs,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = (request: NextRequest) =>
  withApiAuth(request, handler, {
    requireAuth: true,
    allowedMethods: ['GET'],
    rateLimit: {
      windowMs: 60000,
      maxRequests: 10,
    },
  })
