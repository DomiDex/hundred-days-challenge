'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface Category {
  id: string;
  uid: string;
  data: {
    name: string;
  };
}

interface CategoryButtonsProps {
  categories: Category[];
}

export function CategoryButtons({ categories }: CategoryButtonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Set up hover animations for all category buttons
    const buttons = gsap.utils.toArray('.category-button', containerRef.current);
    
    buttons.forEach((button) => {
      const buttonElement = button as HTMLElement;
      const flair = buttonElement.querySelector('.button-flair');
      
      // Set initial state - flair is hidden below
      gsap.set(flair, { yPercent: 100 });
      
      // Mouse enter animation
      buttonElement.addEventListener('mouseenter', () => {
        gsap.to(flair, {
          yPercent: 0,
          duration: 0.5,
          ease: 'power3.out'
        });
      });
      
      // Mouse leave animation
      buttonElement.addEventListener('mouseleave', () => {
        gsap.to(flair, {
          yPercent: 100,
          duration: 0.4,
          ease: 'power3.inOut'
        });
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className='flex flex-wrap gap-3'>
      <Link
        href='/blog'
        className='category-button relative px-4 py-2 bg-limed-spruce-500 text-white rounded-lg overflow-hidden'
      >
        <div className='button-flair absolute inset-0 bg-limed-spruce-600' />
        <span className='relative z-10'>All Posts</span>
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/blog/${category.uid}`}
          className='category-button relative px-4 py-2 bg-limed-spruce-400 text-white rounded-lg overflow-hidden'
        >
          <div className='button-flair absolute inset-0 bg-limed-spruce-500' />
          <span className='relative z-10'>{category.data.name}</span>
        </Link>
      ))}
    </div>
  );
}