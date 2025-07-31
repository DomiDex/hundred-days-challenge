# Mailchimp Newsletter Setup Guide

This guide will help you set up Mailchimp for your blog's newsletter integration.

## Quick Start (5 minutes)

### 1. Get Mailchimp Credentials

1. **Create Account**: Sign up at [mailchimp.com](https://mailchimp.com)
2. **Get API Key**:
   - Profile → Account & billing → Extras → API keys → Create A Key
   - Copy the full key (looks like: `abc123...xyz-us1`)
3. **Get Audience ID**:
   - Audience → Settings → Audience name and defaults
   - Copy the Audience ID (looks like: `a1b2c3d4`)

### 2. Configure Your App

1. Copy the example env file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local`:
   ```env
   MAILCHIMP_API_KEY=your-api-key-here
   MAILCHIMP_API_SERVER=us1  # The part after dash in API key
   MAILCHIMP_AUDIENCE_ID=your-audience-id-here
   ```

### 3. Test It Works

1. Run your app: `npm run dev`
2. Subscribe with a test email
3. Check Mailchimp: Audience → All contacts

## Where Newsletter Forms Appear

1. **Homepage Hero** (right side of hero section)
   - Tags: `hero-signup`, `homepage`
2. **Footer** (on every page)
   - Tags: `footer-signup`

## Common Issues

### "API Key Invalid"

- Check for extra spaces
- Verify server prefix matches (us1, us2, etc.)

### "Resource Not Found"

- Double-check Audience ID
- Ensure API key has permissions

### Rate Limiting

- Limited to 5 signups per minute per IP
- Wait if testing multiple times

## What's Next?

1. **Welcome Email**: Automations → Create → Welcome new subscribers
2. **Webhooks**: Audience → Settings → Webhooks (optional)
3. **Campaigns**: Create your first newsletter campaign

## Need Help?

- Full documentation: `/tasks/task-17-mailchimp-newsletter-integration.md`
- Mailchimp Support: [mailchimp.com/help](https://mailchimp.com/help)
