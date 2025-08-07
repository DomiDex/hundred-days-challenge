'use client'

import { useEffect, useRef, useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'

interface BlogPostAnalyticsProps {
  postSlug: string
  postTitle: string
}

export const BlogPostAnalytics: React.FC<BlogPostAnalyticsProps> = ({ postSlug }) => {
  const { trackReadingTime, trackScrollDepth } = useAnalytics()
  const [startTime] = useState(Date.now())
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
