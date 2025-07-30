'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import type { CategoryDocument } from '../../../prismicio-types';

interface MobileCategoriesSectionProps {
  categories: CategoryDocument[];
  onLinkClick: () => void;
}

export function MobileCategoriesSection({ categories, onLinkClick }: MobileCategoriesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    if (!contentRef.current || !iconRef.current) return;

    gsap.set(contentRef.current, { 
      height: 0,
      opacity: 0
    });

    if (isExpanded) {
      gsap.to(contentRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(iconRef.current, {
        rotate: 180,
        duration: 0.3,
        ease: 'power2.inOut'
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      });
      gsap.to(iconRef.current, {
        rotate: 0,
        duration: 0.3,
        ease: 'power2.inOut'
      });
    }
  }, [isExpanded]);

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-2',
          'text-2xl text-foreground',
          'transition-colors duration-200',
          'hover:text-foreground/80'
        )}
        aria-expanded={isExpanded}
      >
        Categories
        <ChevronDown 
          ref={iconRef}
          className="h-5 w-5" 
          aria-hidden="true"
        />
      </button>

      <div ref={contentRef} className="overflow-hidden">
        <div className="pt-6 space-y-6">
          <Link
            href="/categories"
            className={cn(
              'block text-2xl text-center',
              'text-foreground hover:text-foreground/80',
              'transition-colors duration-150'
            )}
            onClick={onLinkClick}
          >
            All Categories
          </Link>
          
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog/${category.uid}`}
              className={cn(
                'block text-2xl text-center',
                'text-foreground hover:text-foreground/80',
                'transition-colors duration-150'
              )}
              onClick={onLinkClick}
            >
              {category.data.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}