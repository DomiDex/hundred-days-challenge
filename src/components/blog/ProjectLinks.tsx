'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ExternalLink, Github } from 'lucide-react'
import { LinkField, isFilled } from '@prismicio/client'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface ProjectLinksProps {
  demoLink?: LinkField
  githubLink?: LinkField
  className?: string
}

export default function ProjectLinks({ demoLink, githubLink, className = '' }: ProjectLinksProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Set up hover animations for all buttons
      const buttons = gsap.utils.toArray('.project-link-button', containerRef.current)

      buttons.forEach((button) => {
        const buttonElement = button as HTMLElement
        const flair = buttonElement.querySelector('.button-flair')

        // Set initial state - flair is hidden below
        gsap.set(flair, { yPercent: 100 })

        // Mouse enter animation
        buttonElement.addEventListener('mouseenter', () => {
          gsap.to(flair, {
            yPercent: 0,
            duration: 0.5,
            ease: 'power3.out',
          })
        })

        // Mouse leave animation
        buttonElement.addEventListener('mouseleave', () => {
          gsap.to(flair, {
            yPercent: 100,
            duration: 0.4,
            ease: 'power3.inOut',
          })
        })
      })
    },
    { scope: containerRef }
  )

  // Check if at least one link exists
  if (!isFilled.link(demoLink) && !isFilled.link(githubLink)) {
    return null
  }

  return (
    <div ref={containerRef} className={`flex flex-wrap gap-4 ${className}`}>
      {isFilled.link(demoLink) && (
        <Link
          href={demoLink.url!}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link-button relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-lochinvar-600 px-5 py-2.5 text-white"
        >
          {/* Darker overlay that slides up on hover */}
          <div className="button-flair absolute inset-0 bg-lochinvar-700" />

          {/* Button content */}
          <span className="relative z-10 flex items-center gap-2">
            <ExternalLink size={16} />
            <span>View Demo</span>
          </span>
        </Link>
      )}

      {isFilled.link(githubLink) && (
        <Link
          href={githubLink.url!}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link-button relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-lochinvar-800 px-5 py-2.5 text-white"
        >
          {/* Darker overlay that slides up on hover */}
          <div className="button-flair absolute inset-0 bg-lochinvar-900" />

          {/* Button content */}
          <span className="relative z-10 flex items-center gap-2">
            <Github size={16} />
            <span>View on GitHub</span>
          </span>
        </Link>
      )}
    </div>
  )
}
