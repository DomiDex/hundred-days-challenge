import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export type SecureCookieOptions = Partial<Omit<ResponseCookie, 'name' | 'value'>>

export function getSecureCookieOptions(options: SecureCookieOptions = {}): Partial<ResponseCookie> {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    ...options,
  }
}

export function getSessionCookieOptions(
  maxAge: number = 60 * 60 * 24, // 24 hours default
  options: SecureCookieOptions = {}
): Partial<ResponseCookie> {
  return getSecureCookieOptions({
    maxAge,
    ...options,
  })
}

export function getPreviewCookieOptions(
  options: SecureCookieOptions = {}
): Partial<ResponseCookie> {
  return getSecureCookieOptions({
    maxAge: 60 * 60, // 1 hour for preview
    sameSite: 'strict', // Stricter for preview mode
    ...options,
  })
}

export function getAuthCookieOptions(options: SecureCookieOptions = {}): Partial<ResponseCookie> {
  return getSecureCookieOptions({
    httpOnly: true,
    secure: true, // Always secure for auth cookies
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    ...options,
  })
}

// Helper to clear a cookie securely
export function getClearCookieOptions(options: SecureCookieOptions = {}): Partial<ResponseCookie> {
  return getSecureCookieOptions({
    maxAge: 0,
    ...options,
  })
}
