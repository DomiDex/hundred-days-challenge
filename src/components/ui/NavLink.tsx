'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface NavLinkProps {
  href: string;
  text: string;
  className?: string;
  onClick?: () => void;
}

const ANIMATION_DURATION = 0.4;
const ANIMATION_EASE = 'power2.inOut';

export default function NavLink({ href, text, className = '', onClick }: NavLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const underline = underlineRef.current;
    const link = linkRef.current;
    
    if (!underline || !link) return;

    // Check if device supports hover (not touch-only device)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    
    if (!mediaQuery.matches) return;

    gsap.set(underline, { x: '-100%', opacity: 1 });

    const handleMouseEnter = () => {
      gsap.killTweensOf(underline);
      gsap.to(underline, {
        x: '0%',
        duration: ANIMATION_DURATION,
        ease: ANIMATION_EASE,
      });
    };

    const handleMouseLeave = () => {
      gsap.killTweensOf(underline);
      gsap.to(underline, {
        x: '101%',
        duration: ANIMATION_DURATION,
        ease: ANIMATION_EASE,
        onComplete: () => {
          gsap.set(underline, { x: '-100%' });
        },
      });
    };

    link.addEventListener('mouseenter', handleMouseEnter);
    link.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      link.removeEventListener('mouseenter', handleMouseEnter);
      link.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(underline);
    };
  }, []);

  return (
    <Link ref={linkRef} href={href} className={`relative block overflow-hidden ${className}`} onClick={onClick}>
      <span className='block'>{text}</span>
      <div
        ref={underlineRef}
        className='absolute bottom-0 left-0 h-[1px] w-full bg-gray-900 dark:bg-gray-100 opacity-0'
      />
    </Link>
  );
}
