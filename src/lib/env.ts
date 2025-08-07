interface EnvironmentVariables {
  // Public variables (available in browser)
  NEXT_PUBLIC_SITE_URL: string
  NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME: string
  NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
  NEXT_PUBLIC_GTM_ID?: string

  // Server-only variables
  PRISMIC_ACCESS_TOKEN?: string
  PRISMIC_WEBHOOK_SECRET?: string
  PREVIEW_SECRET?: string
  API_SECRET_KEY?: string
  MAILCHIMP_API_KEY?: string
  MAILCHIMP_API_SERVER?: string
  MAILCHIMP_AUDIENCE_ID?: string
  MAILCHIMP_WEBHOOK_KEY?: string
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentError'
  }
}

function validateEnvironmentVariables(): EnvironmentVariables {
  const env = process.env as unknown as EnvironmentVariables
  const errors: string[] = []

  // Required public variables
  if (!env.NEXT_PUBLIC_SITE_URL) {
    errors.push('NEXT_PUBLIC_SITE_URL is required')
  } else {
    try {
      new URL(env.NEXT_PUBLIC_SITE_URL)
    } catch {
      errors.push('NEXT_PUBLIC_SITE_URL must be a valid URL')
    }
  }

  if (!env.NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME) {
    errors.push('NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME is required')
  }

  // Validate server-only variables (only in server environment)
  if (typeof window === 'undefined') {
    // Production security requirements
    if (process.env.NODE_ENV === 'production') {
      // These are required in production
      if (!env.PREVIEW_SECRET) {
        errors.push('PREVIEW_SECRET is required in production')
      }
      if (!env.API_SECRET_KEY) {
        errors.push('API_SECRET_KEY is required in production')
      }

      // Ensure HTTPS in production
      if (env.NEXT_PUBLIC_SITE_URL && !env.NEXT_PUBLIC_SITE_URL.startsWith('https://')) {
        errors.push('NEXT_PUBLIC_SITE_URL must use HTTPS in production')
      }
    }

    // Validate Mailchimp configuration if any part is provided
    const mailchimpVars = [
      env.MAILCHIMP_API_KEY,
      env.MAILCHIMP_API_SERVER,
      env.MAILCHIMP_AUDIENCE_ID,
    ]

    const hasMailchimpConfig = mailchimpVars.some((v) => v !== undefined)
    if (hasMailchimpConfig) {
      if (!env.MAILCHIMP_API_KEY) {
        errors.push('MAILCHIMP_API_KEY is required when using Mailchimp')
      }
      if (!env.MAILCHIMP_API_SERVER) {
        errors.push('MAILCHIMP_API_SERVER is required when using Mailchimp')
      }
      if (!env.MAILCHIMP_AUDIENCE_ID) {
        errors.push('MAILCHIMP_AUDIENCE_ID is required when using Mailchimp')
      }
    }

    // Validate security keys format if provided
    if (env.PREVIEW_SECRET && env.PREVIEW_SECRET.length < 32) {
      errors.push('PREVIEW_SECRET must be at least 32 characters long')
    }

    if (env.API_SECRET_KEY && env.API_SECRET_KEY.length < 32) {
      errors.push('API_SECRET_KEY must be at least 32 characters long')
    }

    if (env.PRISMIC_WEBHOOK_SECRET && env.PRISMIC_WEBHOOK_SECRET.length < 32) {
      errors.push('PRISMIC_WEBHOOK_SECRET must be at least 32 characters long')
    }

    if (env.MAILCHIMP_WEBHOOK_KEY && env.MAILCHIMP_WEBHOOK_KEY.length < 32) {
      errors.push('MAILCHIMP_WEBHOOK_KEY must be at least 32 characters long')
    }
  }

  if (errors.length > 0) {
    throw new EnvironmentError(`Environment validation failed:\n${errors.join('\n')}`)
  }

  return env
}

// Validate on module load (server-side only)
let validatedEnv: EnvironmentVariables | undefined

if (typeof window === 'undefined') {
  try {
    validatedEnv = validateEnvironmentVariables()
  } catch (error) {
    // In development, log the error but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.error('Environment validation warning:', error)
    } else {
      // In production, throw to prevent startup with invalid config
      throw error
    }
  }
}

export function getEnv(): EnvironmentVariables {
  if (typeof window !== 'undefined') {
    // Client-side: return process.env directly
    return process.env as unknown as EnvironmentVariables
  }

  // Server-side: return validated environment
  if (!validatedEnv) {
    validatedEnv = validateEnvironmentVariables()
  }

  return validatedEnv
}

// Helper functions for specific configs
export function getPrismicConfig() {
  const env = getEnv()
  return {
    repositoryName: env.NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME,
    accessToken: env.PRISMIC_ACCESS_TOKEN,
    webhookSecret: env.PRISMIC_WEBHOOK_SECRET,
  }
}

export function getMailchimpConfig() {
  const env = getEnv()

  if (!env.MAILCHIMP_API_KEY || !env.MAILCHIMP_API_SERVER || !env.MAILCHIMP_AUDIENCE_ID) {
    return null
  }

  return {
    apiKey: env.MAILCHIMP_API_KEY,
    server: env.MAILCHIMP_API_SERVER,
    audienceId: env.MAILCHIMP_AUDIENCE_ID,
    webhookKey: env.MAILCHIMP_WEBHOOK_KEY,
  }
}

export function getSecurityConfig() {
  const env = getEnv()
  return {
    previewSecret: env.PREVIEW_SECRET || generateDefaultSecret('preview'),
    apiSecretKey: env.API_SECRET_KEY || generateDefaultSecret('api'),
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
  }
}

// Generate a default secret for development
function generateDefaultSecret(type: string): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${type.toUpperCase()}_SECRET must be set in production`)
  }

  // In development, generate a consistent secret based on the type
  return Buffer.from(`dev-${type}-secret-${process.env.NODE_ENV}`).toString('base64')
}

// Helper function to check if we're in a secure context
export function isSecureContext(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.FORCE_SECURE === 'true'
}

// Helper to get the site URL with proper protocol
export function getSiteUrl(): string {
  const { siteUrl } = getSecurityConfig()
  if (process.env.NODE_ENV === 'development' && !siteUrl.startsWith('https://')) {
    return siteUrl
  }
  // Force HTTPS in production
  return siteUrl.replace(/^http:\/\//, 'https://')
}
