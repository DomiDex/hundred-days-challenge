'use client';

import { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useGSAP(() => {
    // Set up hover animation for the subscribe button
    const button = formRef.current?.querySelector('.newsletter-button');
    const flair = button?.querySelector('.button-flair');
    
    if (button && flair) {
      // Set initial state - flair is hidden below
      gsap.set(flair, { yPercent: 100 });
      
      // Mouse enter animation
      button.addEventListener('mouseenter', () => {
        gsap.to(flair, {
          yPercent: 0,
          duration: 0.5,
          ease: 'power3.out'
        });
      });
      
      // Mouse leave animation
      button.addEventListener('mouseleave', () => {
        gsap.to(flair, {
          yPercent: 100,
          duration: 0.4,
          ease: 'power3.inOut'
        });
      });
    }
  }, { scope: formRef });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <div>
      <h3 className='text-lg font-semibold mb-4 text-limed-spruce-900 dark:text-limed-spruce-100'>
        Newsletter
      </h3>
      <p className='text-sm text-limed-spruce-600 dark:text-limed-spruce-400 mb-4'>
        Subscribe to our newsletter for updates and news.
      </p>
      <form ref={formRef} onSubmit={handleSubmit} className='space-y-2'>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Enter your email'
          className='w-full px-3 py-2 text-sm border border-limed-spruce-300 dark:border-limed-spruce-700 rounded-md bg-white dark:bg-limed-spruce-900 text-limed-spruce-900 dark:text-limed-spruce-100 focus:outline-none focus:ring-2 focus:ring-limed-spruce-500'
          required
        />
        <button
          type='submit'
          className='newsletter-button relative w-full px-4 py-2 text-sm font-medium text-white bg-lochinvar-600 dark:bg-lochinvar-500 rounded-md overflow-hidden'
        >
          {/* Darker overlay that slides up on hover */}
          <div className='button-flair absolute inset-0 bg-lochinvar-700 dark:bg-lochinvar-600' />
          
          {/* Button content */}
          <span className='relative z-10'>Subscribe</span>
        </button>
      </form>
    </div>
  );
}