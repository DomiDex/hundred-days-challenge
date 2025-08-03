'use client'

import { sendGAEvent } from '@next/third-parties/google'

export const useAnalytics = () => {
  const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
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
