'use client';

import React, { lazy, Suspense } from 'react';
import { usePathname } from 'next/navigation';

// Lazy load the ReCaptcha provider
const ReCaptchaProvider = lazy(() => import('./ReCaptchaProvider'));

export default function LazyReCaptchaProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Only load ReCaptcha on pages that have forms
  const formPages = [
    '/sell-your-business',
    '/landing-b/step-2',
    // Add other form pages as needed
  ];
  
  const needsRecaptcha = formPages.some(page => pathname?.startsWith(page));
  
  // If page doesn't need ReCaptcha, don't load it at all
  if (!needsRecaptcha) {
    return <>{children}</>;
  }
  
  return (
    <Suspense fallback={<>{children}</>}>
      <ReCaptchaProvider>{children}</ReCaptchaProvider>
    </Suspense>
  );
}