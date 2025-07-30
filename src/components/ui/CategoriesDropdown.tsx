'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import type { CategoryDocument } from '../../../prismicio-types';

interface CategoriesDropdownProps {
  categories: CategoryDocument[];
  className?: string;
}

export function CategoriesDropdown({ categories, className }: CategoriesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // GSAP animations
  useGSAP(() => {
    if (!menuRef.current || !iconRef.current) return;

    // Create timeline
    const tl = gsap.timeline({ 
      paused: true,
      onReverseComplete: () => {
        gsap.set(menuRef.current, { visibility: 'hidden' });
      }
    });
    
    // Set initial states
    gsap.set(menuRef.current, { 
      y: -10,
      visibility: 'hidden'
    });

    // Build timeline for opening
    tl.set(menuRef.current, { visibility: 'visible' })
    .to(iconRef.current, {
      rotate: 180,
      duration: 0.3,
      ease: 'power2.inOut'
    }, 0)
    .to(menuRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: 'power2.out'
    }, 0);

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, { scope: dropdownRef });

  // Play/reverse animation based on state
  useEffect(() => {
    if (!timelineRef.current) return;
    
    if (isOpen) {
      timelineRef.current.play();
    } else {
      timelineRef.current.reverse();
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInteraction = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={cn('relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleInteraction}
        className={cn(
          'flex items-center gap-1',
          'text-foreground',
          'transition-colors duration-200',
          'hover:text-foreground/80',
          'focus:outline-none'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Categories
        <ChevronDown 
          ref={iconRef}
          className="h-4 w-4" 
          aria-hidden="true"
        />
      </button>

      <div
        ref={menuRef}
        className={cn(
          'absolute top-full left-0 mt-2',
          'min-w-[200px] p-2',
          'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg',
          'z-50',
          'invisible opacity-0'
        )}
        role="menu"
        aria-orientation="vertical"
      >
        <Link
          href="/categories"
          className={cn(
            'block w-full px-3 py-2 text-sm',
            'text-foreground rounded-sm',
            'transition-colors duration-150',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'focus:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800'
          )}
          role="menuitem"
          onClick={() => setIsOpen(false)}
        >
          All Categories
        </Link>
        
        {categories.length > 0 && (
          <>
            <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/${category.uid}`}
                className={cn(
                  'block w-full px-3 py-2 text-sm',
                  'text-foreground rounded-sm',
                  'transition-colors duration-150',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'focus:outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800'
                )}
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                {category.data.name}
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}