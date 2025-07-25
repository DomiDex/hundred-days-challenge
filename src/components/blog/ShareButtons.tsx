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
  const buttonsContainerRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: containerRef });

  // Animation when toggling the share buttons
  const toggleButtons = contextSafe(() => {
    if (!buttonsContainerRef.current) return;

    const buttons = gsap.utils.toArray('.social-button', buttonsContainerRef.current);
    
    if (!showButtons) {
      // Opening animation
      setShowButtons(true);
      
      // Rotate share button
      gsap.to(shareButtonRef.current, {
        rotation: 180,
        duration: 0.4,
        ease: 'power3.inOut',
      });

      // Show buttons container
      gsap.to(buttonsContainerRef.current, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.3,
        ease: 'power2.out',
      });

      // Stagger animate individual buttons with elastic ease
      gsap.fromTo(
        buttons,
        {
          scale: 0,
          opacity: 0,
          x: -20,
          rotation: -180,
        },
        {
          scale: 1,
          opacity: 1,
          x: 0,
          rotation: 0,
          duration: 0.6,
          stagger: {
            each: 0.1,
            from: 'start',
          },
          ease: 'elastic.out(1, 0.5)',
          delay: 0.1,
        }
      );
    } else {
      // Closing animation
      
      // Rotate share button back
      gsap.to(shareButtonRef.current, {
        rotation: 0,
        duration: 0.4,
        ease: 'power3.inOut',
      });

      // Animate buttons out
      gsap.to(buttons.reverse(), {
        scale: 0,
        opacity: 0,
        x: -20,
        rotation: -180,
        duration: 0.3,
        stagger: {
          each: 0.05,
          from: 'start',
        },
        ease: 'power2.in',
        onComplete: () => {
          // Hide container after buttons are animated out
          gsap.set(buttonsContainerRef.current, {
            opacity: 0,
            visibility: 'hidden',
          });
          setShowButtons(false);
        }
      });
    }
  });

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Animate copy feedback
  useGSAP(() => {
    if (copied) {
      gsap.fromTo('.copy-feedback',
        {
          opacity: 0,
          y: 10,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'back.out(1.7)',
        }
      );
    }
  }, { dependencies: [copied], scope: containerRef });

  const handleShare = contextSafe((platform: 'x' | 'linkedin' | 'copy') => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    // Add click animation
    const button = document.querySelector(`[data-platform="${platform}"]`);
    if (button) {
      gsap.to(button, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }

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
  });

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center gap-3 ${className}`}
    >
      <button
        ref={shareButtonRef}
        onClick={toggleButtons}
        className='p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors transform-gpu'
        aria-label='Share this post'
        aria-expanded={showButtons}
      >
        <Share2 size={20} />
      </button>

      <div
        ref={buttonsContainerRef}
        className='flex items-center gap-2 opacity-0 invisible'
        style={{ transformOrigin: 'left center' }}
      >
        <button
          onClick={() => handleShare('x')}
          className='social-button p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors transform-gpu'
          aria-label='Share on X (Twitter)'
          data-platform="x"
        >
          <div className="w-[18px] h-[18px]">
            <XIcon />
          </div>
        </button>

        <button
          onClick={() => handleShare('linkedin')}
          className='social-button p-3 bg-[#0077B5] text-white rounded-full hover:bg-[#006399] transition-colors transform-gpu'
          aria-label='Share on LinkedIn'
          data-platform="linkedin"
        >
          <div className="w-[18px] h-[18px]">
            <LinkedInIcon />
          </div>
        </button>

        <button
          onClick={() => handleShare('copy')}
          className='social-button p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors transform-gpu relative'
          aria-label='Copy link'
          data-platform="copy"
        >
          {copied ? (
            <Check size={18} className='text-green-400' />
          ) : (
            <Link2 size={18} />
          )}
        </button>
      </div>

      {copied && (
        <span className='copy-feedback absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-md whitespace-nowrap pointer-events-none'>
          Link copied!
        </span>
      )}
    </div>
  );
}
