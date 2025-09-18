'use client';

import React, { useEffect, useState } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { usePathname } from 'next/navigation';

const ReCaptchaProvider = ({ children }: { children: React.ReactNode }) => {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const pathname = usePathname();
  const [shouldLoadRecaptcha, setShouldLoadRecaptcha] = useState(false);

  useEffect(() => {
    // Only load ReCaptcha on pages that have forms
    const formPages = [
      '/sell-your-business',
      '/landing-b/step-2',
      // Add other form pages as needed
    ];
    
    // Check if current page needs ReCaptcha
    const needsRecaptcha = formPages.some(page => pathname?.startsWith(page));
    
    if (needsRecaptcha) {
      // Delay loading until user interacts or after timeout
      const handleInteraction = () => {
        setShouldLoadRecaptcha(true);
        // Remove listeners after loading
        ['focus', 'click', 'touchstart'].forEach(event => {
          document.removeEventListener(event, handleInteraction);
        });
      };

      // Add interaction listeners to form elements
      ['focus', 'click', 'touchstart'].forEach(event => {
        document.addEventListener(event, handleInteraction, { once: true, passive: true });
      });

      // Fallback: Load after 3 seconds if no interaction
      const timer = setTimeout(() => setShouldLoadRecaptcha(true), 3000);

      return () => {
        clearTimeout(timer);
        ['focus', 'click', 'touchstart'].forEach(event => {
          document.removeEventListener(event, handleInteraction);
        });
      };
    }
  }, [pathname]);

  // Skip ReCaptcha provider in development if no key is set
  if (!recaptchaSiteKey || recaptchaSiteKey === 'test-site-key') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        "ReCAPTCHA disabled in development. Set a valid NEXT_PUBLIC_RECAPTCHA_SITE_KEY to test ReCAPTCHA."
      );
    }
    // Return children without the provider wrapper
    return <>{children}</>;
  }

  // Don't load ReCaptcha if not needed
  if (!shouldLoadRecaptcha) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "body",
        nonce: undefined,
      }}
      useEnterprise={false}
      useRecaptchaNet={false}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
};

export default ReCaptchaProvider; 