'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Adsterra Social Bar Component
 * Script: https://bauval.org/14/effad4d7d0d383d8bc1d0075bfd54d36
 * High-performing floating notification widget.
 * IMPORTANT: Strictly disabled on live CBT exams (/test/ and /ssw-test/)
 * to maintain authentic Prometric exam conditions.
 */
export default function AdsterraSocialBar() {
  const pathname = usePathname();

  // Strictly NEVER show during timed live exam sessions
  const isLiveExam = pathname?.startsWith('/test/') || pathname?.startsWith('/ssw-test/');

  useEffect(() => {
    if (isLiveExam) return;

    const scriptId = 'adsterra-social-bar-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://bauval.org/14/effad4d7d0d383d8bc1d0075bfd54d36';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.body.appendChild(script);
    }
  }, [isLiveExam]);

  return null;
}
