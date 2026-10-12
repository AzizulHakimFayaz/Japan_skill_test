'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

// Routes where Google AdSense must not be served during active examination execution
// (Active interactive test runners, auth forms, reset password, error screens)
const EXCLUDED_PREFIXES = [
  '/test/',
  '/ssw-test/',
  '/accounts/',
  '/reset-password',
  '/_not-found',
];

export default function GoogleAdsense() {
  const pathname = usePathname() || '';

  // Check if current route is an interactive simulator, auth form, or tool
  const isExcluded = EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isExcluded) {
    return null;
  }

  return (
    <Script
      id="google-adsense-script"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8435487820435842"
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
