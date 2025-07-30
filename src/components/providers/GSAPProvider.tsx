'use client';

import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function GSAPProvider({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    // Ensure GSAP is properly initialized
    gsap.config({
      nullTargetWarn: false
    });
  }, []);

  return <>{children}</>;
}