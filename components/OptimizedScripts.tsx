'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function OptimizedScripts() {
  const pathname = usePathname();
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Load immediately on conversion pages
  const isConversionPage = pathname === '/thank-you' || 
                          pathname === '/sell-your-business/thank-you';

  useEffect(() => {
    // Track user interaction for lazy loading
    const handleInteraction = () => {
      setUserInteracted(true);
      // Remove listeners after first interaction
      ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
    };

    if (isConversionPage) {
      // Load immediately for conversion tracking
      setShouldLoadAnalytics(true);
    } else {
      // Add interaction listeners
      ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event => {
        window.addEventListener(event, handleInteraction, { once: true, passive: true });
      });

      // Fallback: Load after 5 seconds if no interaction
      const fallbackTimer = setTimeout(() => setShouldLoadAnalytics(true), 5000);

      return () => {
        clearTimeout(fallbackTimer);
        ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(event => {
          window.removeEventListener(event, handleInteraction);
        });
      };
    }
  }, [isConversionPage]);

  useEffect(() => {
    if (userInteracted && !isConversionPage) {
      // Load analytics after user interaction with slight delay
      const timer = setTimeout(() => setShouldLoadAnalytics(true), 100);
      return () => clearTimeout(timer);
    }
  }, [userInteracted, isConversionPage]);

  if (!shouldLoadAnalytics) return null;

  return (
    <>
      <Script
        id="gtag-base"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=AW-17109864760`}
      />
      <Script
        id="gtag-config"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Configure Google Ads with enhanced conversions
            gtag('config', 'AW-17109864760', {
              'allow_enhanced_conversions': true,
              'send_page_view': false
            });
            
            // Mark gtag as ready
            window.gtagReady = true;
            
            // Send page view after configuration
            gtag('event', 'page_view');
            
            // Configure Google Analytics if available
            if ('${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}') {
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                'send_page_view': false
              });
              gtag('event', 'page_view');
            }
          `,
        }}
      />
    </>
  );
}