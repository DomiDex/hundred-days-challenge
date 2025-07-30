'use client'

import { useState, useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import NavLink from './NavLink'
import SocialLink from './SocialLink'
import GitHubIcon from '../svg/GitHubIcon'
import LinkedInIcon from '../svg/LinkedInIcon'
import XIcon from '../svg/XIcon'
import { MobileCategoriesSection } from './MobileCategoriesSection'
import { CategoriesDropdown } from './CategoriesDropdown'
import type { CategoryDocument } from '../../../prismicio-types'

const navLinks = [
  { href: '/', text: 'Home' },
  { href: '/about', text: 'About' },
  { href: '/blog', text: 'Blog' },
  { href: 'mailto:domidex01@gmail.com', text: 'Contact' },
]

const socialLinks = [
  {
    href: 'https://www.linkedin.com/in/domidex/',
    icon: LinkedInIcon,
    label: 'LinkedIn',
  },
  { href: 'https://x.com/domidexdesign', icon: XIcon, label: 'X (Twitter)' },
  { href: 'https://github.com/DomiDex', icon: GitHubIcon, label: 'GitHub' },
]

interface NavBarProps {
  categories?: CategoryDocument[]
}

export default function NavBar({ categories = [] }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  useGSAP(() => {
    if (mobileMenuRef.current && overlayRef.current) {
      tl.current = gsap
        .timeline({ paused: true })
        .set(mobileMenuRef.current, { x: '100%', display: 'flex' })
        .set(overlayRef.current, { display: 'block', opacity: 0 })
        .to(overlayRef.current, { opacity: 1, duration: 0.3 }, 0)
        .to(mobileMenuRef.current, { x: 0, duration: 0.5, ease: 'power3.out' }, 0)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      tl.current?.play()
      document.body.style.overflow = 'hidden'
    } else {
      tl.current?.reverse()
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden w-full items-center justify-end space-x-5 md:flex">
        <div className="flex items-center gap-6">
          {navLinks.slice(0, 3).map((link) => (
            <NavLink key={link.text} href={link.href} text={link.text} />
          ))}
          <CategoriesDropdown categories={categories} />
          {navLinks.slice(3).map((link) => (
            <NavLink key={link.text} href={link.href} text={link.text} />
          ))}
        </div>
        <div className="flex gap-3">
          {socialLinks.map((social) => (
            <SocialLink
              key={social.label}
              href={social.href}
              icon={social.icon}
              label={social.label}
            />
          ))}
        </div>
      </nav>

      {/* Mobile Hamburger Menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 p-2 md:hidden"
        aria-label="Toggle menu"
      >
        <div className="flex h-5 w-6 flex-col justify-between">
          <span
            className={`block h-0.5 w-full bg-foreground transition-all duration-300 ${isOpen ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`block h-0.5 w-full bg-foreground transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block h-0.5 w-full bg-foreground transition-all duration-300 ${isOpen ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 hidden bg-black/50"
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className="fixed right-0 top-0 z-40 hidden h-full w-full flex-col items-center justify-center bg-background"
      >
        <nav className="flex flex-col items-center gap-8">
          {navLinks.slice(0, 3).map((link) => (
            <NavLink
              key={link.text}
              href={link.href}
              text={link.text}
              className="text-2xl"
              onClick={() => setIsOpen(false)}
            />
          ))}
          {categories.length > 0 && (
            <MobileCategoriesSection categories={categories} onLinkClick={() => setIsOpen(false)} />
          )}
          {navLinks.slice(3).map((link) => (
            <NavLink
              key={link.text}
              href={link.href}
              text={link.text}
              className="text-2xl"
              onClick={() => setIsOpen(false)}
            />
          ))}
          <div className="mt-8 flex gap-6">
            {socialLinks.map((social) => (
              <SocialLink
                key={social.label}
                href={social.href}
                icon={social.icon}
                label={social.label}
                className="h-8 w-8"
              />
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}
