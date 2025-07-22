'use client';

import Link from 'next/link';
import { motion, useMotionValue, animate } from 'framer-motion';

interface NavLinkProps {
  href: string;
  text: string;
}

const ANIMATION_CONFIG = {
  duration: 0.3,
  ease: 'easeInOut',
} as const;

export default function NavLink({ href, text }: NavLinkProps) {
  const x = useMotionValue(-100);

  const handleMouseEnter = () => {
    animate(x, 0, ANIMATION_CONFIG);
  };

  const handleMouseLeave = () => {
    animate(x, 100, {
      ...ANIMATION_CONFIG,
      onComplete: () => x.set(-100),
    });
  };

  return (
    <Link
      href={href}
      className='relative block overflow-hidden'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className='block'>{text}</span>
      <motion.div
        className='absolute bottom-0 left-0 h-[1px] w-full bg-limed-spruce-900'
        style={{ x }}
      />
    </Link>
  );
}
