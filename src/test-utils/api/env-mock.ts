// Mock environment variables for API tests
export const env = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME: 'hundred-days-challenge',
  PREVIEW_SECRET: 'test-preview-secret-that-is-at-least-32-chars-long',
  PRISMIC_WEBHOOK_SECRET: 'test-webhook-secret-that-is-at-least-32-chars',
  MAILCHIMP_API_KEY: 'test-api-key-1234567890abcdef-us1',
  MAILCHIMP_LIST_ID: 'test-list-id',
  MAILCHIMP_SERVER_PREFIX: 'us1',
  MAILCHIMP_API_SERVER: 'us1',
  MAILCHIMP_AUDIENCE_ID: 'test-audience-id',
  ADMIN_API_KEY: 'test-admin-key-123',
  MAILCHIMP_WEBHOOK_KEY: 'test-webhook-key',
}

export function validateEnvironmentVariables() {
  return env
}

export function getEnv() {
  return env
}

export function getPrismicConfig() {
  return {
    repositoryName: env.NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME,
    previewSecret: env.PREVIEW_SECRET,
    webhookSecret: env.PRISMIC_WEBHOOK_SECRET,
  }
}

export function getMailchimpConfig() {
  return {
    apiKey: env.MAILCHIMP_API_KEY,
    server: env.MAILCHIMP_API_SERVER,
    audienceId: env.MAILCHIMP_AUDIENCE_ID,
  }
}

export function getSiteConfig() {
  return {
    url: env.NEXT_PUBLIC_SITE_URL,
    name: '100 Days of Craft',
    description: 'A craft journey',
  }
}

export function getSecurityConfig() {
  return {
    previewSecret: env.PREVIEW_SECRET,
    webhookSecret: env.PRISMIC_WEBHOOK_SECRET,
  }
}
