# Task 24: Google Analytics 4 Integration

## Overview

Implement Google Analytics 4 (GA4) tracking for the 100 Days of Craft blog to monitor user engagement, content performance, and visitor behavior.

## Objectives

1. Set up Google Analytics 4 property
2. Integrate GA4 with Next.js 15 using @next/third-parties
3. Implement custom event tracking for blog interactions
4. Ensure GDPR compliance with cookie consent
5. Track key metrics: page views, reading time, scroll depth, author clicks

## Prerequisites

- Google account for Analytics access
- Access to Google Analytics dashboard
- Next.js 15 app with TypeScript

## Implementation Steps

### Step 1: Create Google Analytics Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create new GA4 property for "100 Days of Craft"
3. Set up Web Data Stream for your domain
4. Copy Measurement ID (format: G-XXXXXXXXXX)

### Step 2: Install Dependencies

```bash
npm install @next/third-parties
```

### Step 3: Environment Configuration

Create/update `.env.local`:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Update `.env.example`:

```env
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### Step 4: Root Layout Integration

Update `src/app/layout.tsx`:

```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  )
}
```

### Step 5: Custom Analytics Hook

Create `src/hooks/useAnalytics.ts`:

```tsx
'use client'

import { sendGAEvent } from '@next/third-parties/google'

export const useAnalytics = () => {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      sendGAEvent({
        event: eventName,
        ...parameters,
      })
    }
  }

  const trackReadingTime = (postSlug: string, timeInSeconds: number) => {
    trackEvent('reading_time', {
      post_slug: postSlug,
      time_seconds: timeInSeconds,
      time_minutes: Math.round(timeInSeconds / 60),
    })
  }

  const trackScrollDepth = (postSlug: string, percentage: number) => {
    trackEvent('scroll_depth', {
      post_slug: postSlug,
      depth_percentage: percentage,
    })
  }

  const trackAuthorClick = (authorName: string, fromPage: string) => {
    trackEvent('author_profile_click', {
      author_name: authorName,
      from_page: fromPage,
    })
  }

  const trackCategoryClick = (categoryName: string) => {
    trackEvent('category_navigation', {
      category_name: categoryName,
    })
  }

  const trackExternalLink = (url: string, linkText: string) => {
    trackEvent('external_link_click', {
      link_url: url,
      link_text: linkText,
    })
  }

  return {
    trackEvent,
    trackReadingTime,
    trackScrollDepth,
    trackAuthorClick,
    trackCategoryClick,
    trackExternalLink,
  }
}
```

### Step 6: Blog Post Analytics Component

Create `src/components/BlogPostAnalytics.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'

interface BlogPostAnalyticsProps {
  postSlug: string
  postTitle: string
}

export const BlogPostAnalytics: React.FC<BlogPostAnalyticsProps> = ({ postSlug, postTitle }) => {
  const { trackReadingTime, trackScrollDepth } = useAnalytics()
  const [startTime] = useState(Date.now())
  const [maxScroll, setMaxScroll] = useState(0)
  const hasTracked25 = useRef(false)
  const hasTracked50 = useRef(false)
  const hasTracked75 = useRef(false)
  const hasTracked100 = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollPercentage = Math.round(((scrollTop + windowHeight) / documentHeight) * 100)

      setMaxScroll((prev) => Math.max(prev, scrollPercentage))

      // Track scroll depth milestones
      if (scrollPercentage >= 25 && !hasTracked25.current) {
        trackScrollDepth(postSlug, 25)
        hasTracked25.current = true
      }
      if (scrollPercentage >= 50 && !hasTracked50.current) {
        trackScrollDepth(postSlug, 50)
        hasTracked50.current = true
      }
      if (scrollPercentage >= 75 && !hasTracked75.current) {
        trackScrollDepth(postSlug, 75)
        hasTracked75.current = true
      }
      if (scrollPercentage >= 90 && !hasTracked100.current) {
        trackScrollDepth(postSlug, 100)
        hasTracked100.current = true
      }
    }

    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      if (timeSpent > 5) {
        // Only track if user spent more than 5 seconds
        trackReadingTime(postSlug, timeSpent)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      handleBeforeUnload() // Track when component unmounts
    }
  }, [postSlug, startTime, trackReadingTime, trackScrollDepth])

  return null
}
```

### Step 7: Update Blog Post Page

Update `src/app/blog/[category]/[slug]/page.tsx` to include analytics:

```tsx
import { BlogPostAnalytics } from '@/components/BlogPostAnalytics'

// In your component
return (
  <>
    <BlogPostAnalytics postSlug={post.uid} postTitle={post.data.title} />
    {/* Rest of your blog post content */}
  </>
)
```

### Step 8: Track Author Clicks

Update author links in components:

```tsx
'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { usePathname } from 'next/navigation'

// In your author link component
const { trackAuthorClick } = useAnalytics()
const pathname = usePathname()

<Link
  href={`/authors/${author.uid}`}
  onClick={() => trackAuthorClick(author.data.name, pathname)}
>
  {author.data.name}
</Link>
```

### Step 9: Cookie Consent Banner

Create `src/components/CookieConsent.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('ga-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('ga-consent', 'accepted')
    setShowBanner(false)
    // GA is already loaded, consent is implicit
  }

  const handleDecline = () => {
    localStorage.setItem('ga-consent', 'declined')
    setShowBanner(false)
    // Disable GA
    window['ga-disable-' + process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID] = true
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          We use cookies to analyze site traffic and improve your experience.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Step 10: Testing

1. **Local Testing**:

   ```bash
   npm run build
   npm run start
   ```

2. **Verify in GA4 Dashboard**:
   - Check Realtime reports
   - Verify events are firing
   - Test all custom events

3. **Debug Mode**:
   - Use GA4 DebugView
   - Browser DevTools Network tab

## Custom Events to Track

1. **Page Views** (automatic)
2. **Reading Time** - Time spent on blog posts
3. **Scroll Depth** - 25%, 50%, 75%, 100% milestones
4. **Author Profile Clicks** - Track which authors get clicked
5. **Category Navigation** - Track category browsing
6. **External Link Clicks** - Track outbound links
7. **Search Queries** (if search is implemented)
8. **Newsletter Signup** (if implemented)

## Metrics to Monitor

### Content Performance

- Most viewed posts
- Average reading time per post
- Scroll depth by post type
- Bounce rate by category

### User Behavior

- User flow through categories
- Author profile engagement
- Time on site
- Pages per session

### Traffic Sources

- Organic search traffic
- Social media referrals
- Direct traffic
- Campaign performance

## Security Considerations

1. **Environment Variables**: Never commit GA Measurement ID to repo
2. **User Privacy**: Implement cookie consent
3. **Data Anonymization**: Consider IP anonymization
4. **GDPR Compliance**: Provide opt-out mechanism

## Performance Impact

- @next/third-parties loads GA asynchronously
- Minimal impact on Core Web Vitals
- Events are batched for efficiency
- No render-blocking scripts

## Deliverables

- [ ] GA4 property configured
- [ ] Analytics integrated in layout
- [ ] Custom events tracking
- [ ] Cookie consent banner
- [ ] Documentation for team
- [ ] Testing verification

## Success Criteria

- ✅ GA4 tracking active on all pages
- ✅ Custom events firing correctly
- ✅ No performance degradation
- ✅ GDPR compliant implementation
- ✅ Real-time data visible in dashboard

## Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics)
- [Next.js Third Party Libraries Guide](https://nextjs.org/docs/app/guides/third-party-libraries)
- [@next/third-parties Documentation](https://nextjs.org/docs/app/api-reference/components/third-parties)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
