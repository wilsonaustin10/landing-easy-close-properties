'use client';

import React from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const ReCaptchaProvider = ({ children }: { children: React.ReactNode }) => {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

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

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey}
      scriptProps={{
        async: false, // Use 'false' if you need the script to load synchronously
        defer: false, // Use 'false' with async: false
        appendTo: "head",
        nonce: undefined, // You can provide a nonce if you have a CSP
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
};

export default ReCaptchaProvider; 