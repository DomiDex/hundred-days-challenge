'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

interface NavLinkProps {
  href: string;
  text: string;
}

const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const CHARS = '!@#$%^&*():{};|,.<>/?';

export default function NavLink({ href, text }: NavLinkProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [displayText, setDisplayText] = useState(text);

  const scramble = () => {
    let pos = 0;

    intervalRef.current = setInterval(() => {
      const scrambled = text
        .split('')
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }

          const randomCharIndex = Math.floor(Math.random() * CHARS.length);
          const randomChar = CHARS[randomCharIndex];

          return randomChar;
        })
        .join('');

      setDisplayText(scrambled);
      pos++;

      if (pos >= text.length * CYCLES_PER_LETTER) {
        stopScramble();
      }
    }, SHUFFLE_TIME);
  };

  const stopScramble = () => {
    clearInterval(intervalRef.current || undefined);
    setDisplayText(text);
  };

  return (
    <div>
      <Link href={href} onMouseEnter={scramble} onMouseLeave={stopScramble}>
        {displayText}
      </Link>
    </div>
  );
}
