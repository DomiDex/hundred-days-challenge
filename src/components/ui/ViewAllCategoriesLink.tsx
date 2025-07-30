'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

export function ViewAllCategoriesLink() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    if (!linkRef.current || !arrowRef.current) return;

    const tl = gsap.timeline({ paused: true });

    tl.to(arrowRef.current, {
      x: 4,
      duration: 0.3,
      ease: 'power2.out',
    });

    const handleMouseEnter = () => tl.play();
    const handleMouseLeave = () => tl.reverse();

    linkRef.current.addEventListener('mouseenter', handleMouseEnter);
    linkRef.current.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (linkRef.current) {
        linkRef.current.removeEventListener('mouseenter', handleMouseEnter);
        linkRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, { scope: linkRef });

  return (
    <Link
      ref={linkRef}
      href='/categories'
      className='inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors'
    >
      View All Categories
      <ArrowRight ref={arrowRef} className='w-4 h-4' />
    </Link>
  );
}