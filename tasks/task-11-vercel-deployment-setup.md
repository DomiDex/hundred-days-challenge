# Task 11: Vercel Deployment Setup with Staging and Production

## Priority: High

## Description

Configure Vercel deployment with separate staging and production environments, including environment variables, domain setup, and deployment workflows.

## Dependencies

- GitHub repository must be set up
- Prismic project configured

## Implementation Steps

### 1. **Vercel Project Setup**

- Connect GitHub repository to Vercel
- Configure project settings:

```
Framework Preset: Next.js
Node.js Version: 20.x
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 2. **Environment Configuration**

- Set up environment variables in Vercel:

```env
# Production Environment
PRISMIC_REPOSITORY_NAME=hundred-days-challenge
PRISMIC_ACCESS_TOKEN=<production-token>
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
PRISMIC_WEBHOOK_SECRET=<webhook-secret>
PREVIEW_SECRET=<preview-secret>
NODE_ENV=production

# Staging Environment
PRISMIC_REPOSITORY_NAME=hundred-days-challenge
PRISMIC_ACCESS_TOKEN=<staging-token>
NEXT_PUBLIC_SITE_URL=https://staging.yourdomain.com
PRISMIC_WEBHOOK_SECRET=<webhook-secret>
PREVIEW_SECRET=<preview-secret>
NODE_ENV=production
VERCEL_ENV=preview
```

### 3. **Branch Configuration**

- Production branch: `main`
- Staging branch: `staging`

Configure in Vercel:

```
Settings > Git > Production Branch: main
```

### 4. **Custom Domains Setup**

- Production domain:

```
yourdomain.com
www.yourdomain.com
```

- Staging domain:

```
staging.yourdomain.com
```

### 5. **Deployment Protection**

- Enable deployment protection for staging:

```typescript
// vercel.json
{
  "github": {
    "enabled": true,
    "autoAlias": false
  },
  "public": false,
  "regions": ["iad1"],
  "functions": {
    "src/app/api/preview/route.ts": {
      "maxDuration": 10
    }
  }
}
```

### 6. **Build Configuration**

- Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/route.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "noindex, nofollow"
        }
      ],
      "has": [
        {
          "type": "host",
          "value": "staging.yourdomain.com"
        }
      ]
    }
  ]
}
```

### 7. **Deployment Workflows**

- Create deployment scripts in `package.json`:

```json
{
  "scripts": {
    "deploy:staging": "vercel --prod --scope=your-team --env=preview",
    "deploy:production": "vercel --prod --scope=your-team",
    "deploy:preview": "vercel --scope=your-team"
  }
}
```

### 8. **Monitoring and Alerts**

- Configure in Vercel Dashboard:

```
- Enable Web Analytics
- Set up deployment notifications
- Configure error alerts
- Enable performance monitoring
```

## Environment-Specific Features

### Staging Environment

```typescript
// src/lib/env.ts
export const isStaging = process.env.VERCEL_ENV === 'preview'
export const isProduction = process.env.VERCEL_ENV === 'production'

// Add staging banner
if (isStaging) {
  return <StagingBanner />
}
```

### Production Safeguards

```typescript
// Disable indexing on staging
export const robots = () => {
  if (isStaging) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }
  // Production robots.txt
}
```

## Deployment Checklist

### Initial Setup

- [ ] Vercel account created
- [ ] GitHub repo connected
- [ ] Project imported to Vercel
- [ ] Team configured (if applicable)

### Environment Variables

- [ ] Production variables set
- [ ] Staging variables set
- [ ] Sensitive values encrypted
- [ ] Variables scoped correctly

### Domains

- [ ] Production domain configured
- [ ] Staging domain configured
- [ ] SSL certificates active
- [ ] DNS properly configured

### Branch Setup

- [ ] Production branch set to `main`
- [ ] Staging branch created
- [ ] Auto-deployments configured
- [ ] Preview deployments enabled

### Security

- [ ] Staging has noindex headers
- [ ] Environment variables secure
- [ ] Deployment protection enabled
- [ ] Access controls configured

## Deployment Flow

### Feature Development

1. Create feature branch from `staging`
2. Push changes → Preview deployment
3. Test preview URL
4. Merge to `staging` → Staging deployment
5. Test staging environment
6. Merge to `main` → Production deployment

### Hotfix Flow

1. Create hotfix branch from `main`
2. Push changes → Preview deployment
3. Test and merge to `main`
4. Cherry-pick to `staging`

## Monitoring

### Set up monitoring for:

- Build times
- Deployment success rate
- Function execution times
- Error rates
- Traffic analytics

## Success Criteria

- Staging and production environments live
- Automatic deployments working
- Environment variables properly scoped
- Custom domains configured
- SSL certificates active
- Monitoring and alerts set up
- No indexing on staging
- Deployment protection active
