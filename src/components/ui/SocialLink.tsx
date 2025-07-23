'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface IconProps {
  size?: number;
  className?: string;
}

interface SocialLinkProps {
  href: string;
  icon: React.ComponentType<IconProps>;
  label: string;
  className?: string;
}

const ANIMATION_CONFIG = {
  duration: 0.4,
  ease: 'power2.inOut',
} as const;

export default function SocialLink({
  href,
  icon: Icon,
  label,
  className = '',
}: SocialLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const icon1Ref = useRef<HTMLDivElement>(null);
  const icon2Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const link = linkRef.current;
    const icon1 = icon1Ref.current;
    const icon2 = icon2Ref.current;
    
    if (!link || !icon1 || !icon2) return;

    // Check if device supports hover (not touch-only device)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    
    if (!mediaQuery.matches) return;

    gsap.set(icon2, { y: '100%', opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    const iconAnimation = {
      ...ANIMATION_CONFIG,
      y: '-100%',
      opacity: 0,
    };

    tl.to(icon1, iconAnimation)
      .to(icon2, {
        ...ANIMATION_CONFIG,
        y: '0%',
        opacity: 1,
      }, '<');

    const handleMouseEnter = () => tl.play();
    const handleMouseLeave = () => tl.reverse();

    link.addEventListener('mouseenter', handleMouseEnter);
    link.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      link.removeEventListener('mouseenter', handleMouseEnter);
      link.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const iconContainerClass = 'absolute inset-0';

  return (
    <Link
      ref={linkRef}
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className={`relative flex items-center justify-center overflow-hidden ${className || 'h-4 w-4'}`}
      aria-label={label}
    >
      <div ref={icon1Ref} className={iconContainerClass}>
        <Icon />
      </div>
      <div ref={icon2Ref} className={iconContainerClass}>
        <Icon />
      </div>
    </Link>
  );
}
