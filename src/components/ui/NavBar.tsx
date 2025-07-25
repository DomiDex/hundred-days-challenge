'use client';

import { useState, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import NavLink from './NavLink';
import SocialLink from './SocialLink';
import GitHubIcon from '../svg/GitHubIcon';
import LinkedInIcon from '../svg/LinkedInIcon';
import XIcon from '../svg/XIcon';
import { MobileCategoriesSection } from './MobileCategoriesSection';
import { CategoriesDropdown } from './CategoriesDropdown';
import type { CategoryDocument } from '../../../prismicio-types';

const navLinks = [
  { href: '/', text: 'Home' },
  { href: '/about', text: 'About' },
  { href: '/blog', text: 'Blog' },
  { href: 'mailto:domidex01@gmail.com', text: 'Contact' },
];

const socialLinks = [
  {
    href: 'https://www.linkedin.com/in/domidex/',
    icon: LinkedInIcon,
    label: 'LinkedIn',
  },
  { href: 'https://x.com/domidexdesign', icon: XIcon, label: 'X (Twitter)' },
  { href: 'https://github.com/DomiDex', icon: GitHubIcon, label: 'GitHub' },
];

interface NavBarProps {
  categories?: CategoryDocument[];
}

export default function NavBar({ categories = [] }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    if (mobileMenuRef.current && overlayRef.current) {
      tl.current = gsap.timeline({ paused: true })
        .set(mobileMenuRef.current, { x: '100%', display: 'flex' })
        .set(overlayRef.current, { display: 'block', opacity: 0 })
        .to(overlayRef.current, { opacity: 1, duration: 0.3 }, 0)
        .to(mobileMenuRef.current, { x: 0, duration: 0.5, ease: 'power3.out' }, 0);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      tl.current?.play();
      document.body.style.overflow = 'hidden';
    } else {
      tl.current?.reverse();
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className='hidden md:flex items-center justify-end w-full space-x-5'>
        <div className='flex gap-6 items-center'>
          {navLinks.slice(0, 3).map((link) => (
            <NavLink key={link.text} href={link.href} text={link.text} />
          ))}
          <CategoriesDropdown categories={categories} />
          {navLinks.slice(3).map((link) => (
            <NavLink key={link.text} href={link.href} text={link.text} />
          ))}
        </div>
        <div className='flex gap-3'>
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
        className='md:hidden relative z-50 p-2'
        aria-label='Toggle menu'
      >
        <div className='w-6 h-5 flex flex-col justify-between'>
          <span className={`block w-full h-0.5 bg-foreground transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-full h-0.5 bg-foreground transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-full h-0.5 bg-foreground transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      <div
        ref={overlayRef}
        className='fixed inset-0 bg-black/50 z-40 hidden'
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className='fixed top-0 right-0 w-full h-full bg-background z-40 hidden flex-col items-center justify-center'
      >
        <nav className='flex flex-col items-center gap-8'>
          {navLinks.slice(0, 3).map((link) => (
            <NavLink
              key={link.text}
              href={link.href}
              text={link.text}
              className='text-2xl'
              onClick={() => setIsOpen(false)}
            />
          ))}
          {categories.length > 0 && (
            <MobileCategoriesSection
              categories={categories}
              onLinkClick={() => setIsOpen(false)}
            />
          )}
          {navLinks.slice(3).map((link) => (
            <NavLink
              key={link.text}
              href={link.href}
              text={link.text}
              className='text-2xl'
              onClick={() => setIsOpen(false)}
            />
          ))}
          <div className='flex gap-6 mt-8'>
            {socialLinks.map((social) => (
              <SocialLink
                key={social.label}
                href={social.href}
                icon={social.icon}
                label={social.label}
                className='w-8 h-8'
              />
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
