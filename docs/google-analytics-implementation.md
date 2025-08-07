# Google Analytics 4 Implementation Guide

## Overview

This document describes the Google Analytics 4 (GA4) implementation for the 100 Days of Craft blog. The implementation uses the official `@next/third-parties` library for optimal performance and includes custom event tracking for detailed user behavior analytics.

## Implementation Details

### 1. Core Integration

The GA4 integration is implemented using `@next/third-parties/google`, which provides:

- Optimized script loading (non-blocking)
- Automatic page view tracking
- Server-side rendering compatibility
- TypeScript support

**Location**: `src/app/layout.tsx`

```tsx
{
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
    <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
  )
}
```

### 2. Custom Analytics Hook

**Location**: `src/hooks/useAnalytics.ts`

Provides methods for tracking:

- `trackEvent`: Generic event tracking
- `trackReadingTime`: Time spent reading posts
- `trackScrollDepth`: How far users scroll
- `trackAuthorClick`: Author profile interactions
- `trackCategoryClick`: Category navigation
- `trackExternalLink`: Outbound link clicks

### 3. Blog Post Analytics

**Location**: `src/components/BlogPostAnalytics.tsx`

Automatically tracks:

- **Reading Time**: Measured when user leaves page (min 5 seconds)
- **Scroll Depth**: Tracked at 25%, 50%, 75%, and 100% milestones

### 4. Cookie Consent

**Location**: `src/components/CookieConsent.tsx`

Features:

- GDPR-compliant consent banner
- Persistent consent storage (localStorage)
- GA disable functionality for declined consent
- Responsive design

## Custom Events Reference

### Event: `reading_time`

Tracks how long users spend reading blog posts.

Parameters:

- `post_slug`: Unique identifier for the post
- `time_seconds`: Total time in seconds
- `time_minutes`: Rounded time in minutes

### Event: `scroll_depth`

Tracks scroll progress through blog posts.

Parameters:

- `post_slug`: Unique identifier for the post
- `depth_percentage`: Scroll milestone (25, 50, 75, or 100)

### Event: `author_profile_click`

Tracks clicks on author profile links.

Parameters:

- `author_name`: Name of the author
- `from_page`: Page where the click occurred

### Event: `category_navigation`

Tracks category link clicks.

Parameters:

- `category_name`: Name of the category

### Event: `external_link_click`

Tracks outbound link clicks.

Parameters:

- `link_url`: Destination URL
- `link_text`: Link text content

## Setup Instructions

### 1. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property
3. Set up a Web Data Stream
4. Copy the Measurement ID (format: G-XXXXXXXXXX)

### 2. Configure Environment

Add to `.env.local`:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Test Implementation

1. Run the application in production mode:

   ```bash
   npm run build
   npm run start
   ```

2. Open GA4 Real-time reports
3. Navigate your site and verify:
   - Page views are tracked
   - Custom events appear
   - User consent works

## Performance Considerations

- Scripts load asynchronously after hydration
- No impact on Core Web Vitals
- Events are batched for efficiency
- Minimal bundle size increase (~15KB)

## Privacy & Compliance

- Cookie consent required before tracking
- Consent stored in localStorage
- GA can be disabled post-consent
- No PII collected in events
- IP anonymization available in GA4 settings

## Debugging

### Enable Debug Mode

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension
2. Open browser DevTools
3. Check Console for GA debug messages

### Common Issues

**No data in GA4 dashboard:**

- Verify Measurement ID is correct
- Check browser ad blockers
- Ensure cookies are accepted
- Wait 24-48 hours for data processing

**Events not firing:**

- Check browser console for errors
- Verify event parameters
- Test in production mode (not dev)

## Maintenance

### Adding New Events

1. Add method to `useAnalytics` hook
2. Implement tracking in components
3. Document event in this guide
4. Test in GA4 DebugView

### Updating GA4 Configuration

1. Update Measurement ID in `.env.local`
2. Restart application
3. Clear browser cache
4. Test tracking

## Resources

- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js Third Party Libraries](https://nextjs.org/docs/app/guides/third-party-libraries)
- [@next/third-parties Docs](https://github.com/vercel/next.js/tree/canary/packages/third-parties)
- [GA4 Event Builder](https://ga-dev-tools.google/ga4/event-builder/)
