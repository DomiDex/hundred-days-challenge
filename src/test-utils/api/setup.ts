/**
 * Sets up test environment variables
 */
export function setupTestEnv(overrides: Record<string, string> = {}) {
  const defaults = {
    NODE_ENV: 'test',
    PRISMIC_ACCESS_TOKEN: 'test-token',
    PRISMIC_WEBHOOK_SECRET: 'test-webhook-secret',
    PREVIEW_SECRET: 'test-preview-secret',
    API_SECRET_KEY: 'test-api-secret',
    NEWSLETTER_API_KEY: 'test-newsletter-key',
    NEWSLETTER_WEBHOOK_SECRET: 'test-newsletter-webhook',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    MAILCHIMP_API_KEY: 'test-mailchimp-key',
    MAILCHIMP_LIST_ID: 'test-list-id',
    MAILCHIMP_SERVER_PREFIX: 'us1',
  }

  Object.entries({ ...defaults, ...overrides }).forEach(([key, value]) => {
    process.env[key] = value
  })
}

/**
 * Cleans up test environment
 */
export function cleanupTestEnv() {
  const envKeys = [
    'PRISMIC_ACCESS_TOKEN',
    'PRISMIC_WEBHOOK_SECRET',
    'PREVIEW_SECRET',
    'API_SECRET_KEY',
    'NEWSLETTER_API_KEY',
    'NEWSLETTER_WEBHOOK_SECRET',
    'MAILCHIMP_API_KEY',
    'MAILCHIMP_LIST_ID',
    'MAILCHIMP_SERVER_PREFIX',
  ]

  envKeys.forEach((key) => {
    delete process.env[key]
  })
}
