# Task 14: Monitoring and Observability Setup

## Priority: Medium

## Description
Implement comprehensive monitoring, logging, and observability for the application including error tracking, performance monitoring, and analytics.

## Dependencies
- Task 11: Vercel Deployment (deployment environments ready)

## Implementation Steps

### 1. **Error Tracking with Sentry**
   - Install Sentry:
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```
   
   - Configure `sentry.client.config.ts`:
   ```typescript
   import * as Sentry from '@sentry/nextjs'
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.VERCEL_ENV || 'development',
     tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
     debug: false,
     replaysOnErrorSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     integrations: [
       Sentry.replayIntegration({
         maskAllText: true,
         blockAllMedia: true,
       }),
     ],
   })
   ```

### 2. **Web Analytics Setup**
   - Create `src/components/Analytics.tsx`:
   ```typescript
   'use client'
   
   import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
   import { SpeedInsights } from '@vercel/speed-insights/next'
   
   export function Analytics() {
     return (
       <>
         <VercelAnalytics />
         <SpeedInsights />
       </>
     )
   }
   ```

### 3. **Custom Event Tracking**
   - Create `src/lib/analytics.ts`:
   ```typescript
   type EventName = 
     | 'post_view'
     | 'category_filter'
     | 'search'
     | 'share_click'
     | 'author_profile_view'
     | 'toc_navigation'
   
   export function trackEvent(
     eventName: EventName,
     properties?: Record<string, any>
   ) {
     // Vercel Analytics
     if (window.va) {
       window.va('track', eventName, properties)
     }
     
     // Custom tracking endpoint
     if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
       fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           event: eventName,
           properties,
           timestamp: new Date().toISOString(),
           url: window.location.href,
         }),
       })
     }
   }
   ```

### 4. **Performance Monitoring**
   - Create `src/lib/performance.ts`:
   ```typescript
   export function measureWebVitals(metric: any) {
     const vitals = {
       FCP: 'First Contentful Paint',
       LCP: 'Largest Contentful Paint',
       CLS: 'Cumulative Layout Shift',
       FID: 'First Input Delay',
       TTFB: 'Time to First Byte',
       INP: 'Interaction to Next Paint',
     }
     
     if (vitals[metric.name]) {
       console.log(`${vitals[metric.name]}: ${metric.value}`)
       
       // Send to analytics
       trackEvent('web_vitals', {
         metric: metric.name,
         value: metric.value,
         rating: metric.rating,
       })
     }
   }
   ```

### 5. **Structured Logging**
   - Create `src/lib/logger.ts`:
   ```typescript
   type LogLevel = 'debug' | 'info' | 'warn' | 'error'
   
   interface LogContext {
     userId?: string
     requestId?: string
     [key: string]: any
   }
   
   class Logger {
     private context: LogContext = {}
     
     setContext(context: LogContext) {
       this.context = { ...this.context, ...context }
     }
     
     private log(level: LogLevel, message: string, data?: any) {
       const logEntry = {
         timestamp: new Date().toISOString(),
         level,
         message,
         context: this.context,
         data,
         environment: process.env.VERCEL_ENV,
       }
       
       if (process.env.NODE_ENV === 'production') {
         // Send to logging service
         fetch('/api/logs', {
           method: 'POST',
           body: JSON.stringify(logEntry),
         })
       } else {
         console.log(logEntry)
       }
     }
     
     debug(message: string, data?: any) {
       this.log('debug', message, data)
     }
     
     info(message: string, data?: any) {
       this.log('info', message, data)
     }
     
     warn(message: string, data?: any) {
       this.log('warn', message, data)
     }
     
     error(message: string, error?: Error | any) {
       this.log('error', message, {
         error: error?.message,
         stack: error?.stack,
       })
       
       // Also send to Sentry
       if (error instanceof Error) {
         Sentry.captureException(error)
       }
     }
   }
   
   export const logger = new Logger()
   ```

### 6. **Health Check Endpoint**
   - Create `src/app/api/health/route.ts`:
   ```typescript
   import { createClient } from '@/prismicio'
   
   export async function GET() {
     const checks = {
       server: 'ok',
       prismic: 'checking',
       timestamp: new Date().toISOString(),
     }
     
     try {
       // Check Prismic connectivity
       const client = createClient()
       await client.getSingle('homepage')
       checks.prismic = 'ok'
     } catch (error) {
       checks.prismic = 'error'
     }
     
     const status = Object.values(checks).includes('error') ? 503 : 200
     
     return Response.json(checks, { status })
   }
   ```

### 7. **Uptime Monitoring**
   - Configure external monitoring:
   ```yaml
   # uptime-kuma-config.yml
   monitors:
     - name: "Production Site"
       url: "https://yourdomain.com/api/health"
       interval: 300 # 5 minutes
       
     - name: "Staging Site"
       url: "https://staging.yourdomain.com/api/health"
       interval: 600 # 10 minutes
   ```

### 8. **Create Monitoring Dashboard**
   - Set up Grafana dashboard config:
   ```json
   {
     "dashboard": {
       "title": "100 Days of Craft Monitoring",
       "panels": [
         {
           "title": "Request Rate",
           "targets": [
             {
               "expr": "rate(http_requests_total[5m])"
             }
           ]
         },
         {
           "title": "Error Rate",
           "targets": [
             {
               "expr": "rate(http_errors_total[5m])"
             }
           ]
         },
         {
           "title": "Core Web Vitals",
           "targets": [
             {
               "expr": "web_vitals_lcp"
             }
           ]
         }
       ]
     }
   }
   ```

## Monitoring Checklist

### Error Tracking
- [ ] Sentry configured for production
- [ ] Source maps uploaded
- [ ] Error boundaries implemented
- [ ] User context captured
- [ ] Performance tracking enabled

### Analytics
- [ ] Vercel Analytics enabled
- [ ] Custom events tracked
- [ ] User journeys mapped
- [ ] Conversion tracking set up

### Performance
- [ ] Web Vitals monitored
- [ ] Speed Insights enabled
- [ ] Bundle size tracked
- [ ] API response times logged

### Logging
- [ ] Structured logging implemented
- [ ] Log levels properly used
- [ ] Sensitive data filtered
- [ ] Log retention configured

### Alerting
- [ ] Error rate alerts
- [ ] Uptime monitoring
- [ ] Performance degradation alerts
- [ ] Deployment failure notifications

## Alert Configuration

```typescript
// Example alert rules
const alerts = [
  {
    name: 'High Error Rate',
    condition: 'error_rate > 0.05',
    channels: ['email', 'slack'],
  },
  {
    name: 'Slow Page Load',
    condition: 'p95_response_time > 3000',
    channels: ['slack'],
  },
  {
    name: 'Site Down',
    condition: 'uptime_check_failed',
    channels: ['email', 'slack', 'pagerduty'],
  },
]
```

## Success Criteria
- All monitoring tools integrated
- Errors tracked in production
- Performance metrics collected
- Custom events implemented
- Alerts configured and tested
- Dashboard visualizing key metrics
- Logs structured and searchable
- Uptime monitoring active