'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Share2, Link2, Check } from 'lucide-react';
import XIcon from '@/components/svg/XIcon';
import LinkedInIcon from '@/components/svg/LinkedInIcon';

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareButtons({
  url,
  title,
  className = '',
}: ShareButtonsProps) {
  const [showButtons, setShowButtons] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useGSAP(() => {
    if (!containerRef.current || !buttonsRef.current) return;

    const buttons = iconRefs.current.filter(Boolean);

    if (showButtons) {
      // Animate share button rotation
      gsap.to(shareButtonRef.current, {
        rotation: 180,
        duration: 0.3,
        ease: 'power2.out',
      });

      // Show buttons container
      gsap.to(buttonsRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'back.out(1.7)',
      });

      // Stagger animate individual buttons
      gsap.fromTo(
        buttons,
        {
          scale: 0,
          opacity: 0,
          y: 20,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          delay: 0.1,
        }
      );
    } else {
      // Hide animations
      gsap.to(shareButtonRef.current, {
        rotation: 0,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to(buttons, {
        scale: 0,
        opacity: 0,
        y: 20,
        duration: 0.2,
        stagger: 0.05,
        ease: 'power2.in',
      });

      gsap.to(buttonsRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        delay: 0.2,
        ease: 'power2.in',
      });
    }
  }, [showButtons]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleShare = (platform: 'x' | 'linkedin' | 'copy') => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    switch (platform) {
      case 'x':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center gap-2 ${className}`}
    >
      <button
        ref={shareButtonRef}
        onClick={() => setShowButtons(!showButtons)}
        className='p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
        aria-label='Share this post'
      >
        <Share2 size={20} />
      </button>

      <div
        ref={buttonsRef}
        className='flex items-center gap-2 opacity-0 scale-0'
        style={{ transformOrigin: 'left center' }}
      >
        <button
          onClick={() => handleShare('x')}
          className='p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors scale-0'
          aria-label='Share on X (Twitter)'
        >
          <div className="w-[18px] h-[18px]">
            <XIcon />
          </div>
        </button>

        <button
          onClick={() => handleShare('linkedin')}
          className='p-3 bg-[#0077B5] text-white rounded-full hover:bg-[#006399] transition-colors scale-0'
          aria-label='Share on LinkedIn'
        >
          <div className="w-[18px] h-[18px]">
            <LinkedInIcon />
          </div>
        </button>

        <button
          onClick={() => handleShare('copy')}
          className='p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors scale-0 relative'
          aria-label='Copy link'
        >
          {copied ? (
            <Check size={18} className='text-green-400' />
          ) : (
            <Link2 size={18} />
          )}
        </button>
      </div>

      {copied && (
        <span className='absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-md whitespace-nowrap'>
          Link copied!
        </span>
      )}
    </div>
  );
}
