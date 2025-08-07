'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { ToCHeading, flattenHeadings } from '@/lib/toc-utils'

export function useTableOfContents(headings: ToCHeading[]) {
  const [activeId, setActiveId] = useState<string>('')
  const flatHeadings = flattenHeadings(headings)
  const headingElementsRef = useRef<{ [key: string]: IntersectionObserverEntry }>({})

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }, [])

  useEffect(() => {
    if (flatHeadings.length === 0) return

    const observerOptions = {
      rootMargin: '-10% 0px -70% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    }

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Update the state of all observed elements
      entries.forEach((entry) => {
        headingElementsRef.current[entry.target.id] = entry
      })

      // Get all visible sections
      const visibleHeadings: string[] = []

      flatHeadings.forEach((heading) => {
        const entry = headingElementsRef.current[heading.id]
        if (entry && entry.isIntersecting) {
          visibleHeadings.push(heading.id)
        }
      })

      // If we have visible headings, activate the first one
      if (visibleHeadings.length > 0) {
        setActiveId(visibleHeadings[0])
      }
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all heading elements
    flatHeadings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    // Set initial active heading
    const findInitialActive = () => {
      for (const heading of flatHeadings) {
        const element = document.getElementById(heading.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            setActiveId(heading.id)
            break
          }
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(findInitialActive, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      headingElementsRef.current = {}
    }
  }, [flatHeadings])

  return { activeId, scrollToSection }
}
