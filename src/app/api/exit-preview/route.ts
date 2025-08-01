import { exitPreview } from '@prismicio/next'
import { NextRequest } from 'next/server'

export function GET(request: NextRequest) {
  // Log preview exit
  console.log('Preview mode exited', {
    ip:
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown',
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
  })

  return exitPreview()
}
