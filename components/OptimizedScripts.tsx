'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function OptimizedScripts() {
  const pathname = usePathname();
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);

  // Load immediately on conversion pages
  const isConversionPage = pathname === '/thank-you' || 
                          pathname === '/sell-your-business/thank-you';

  useEffect(() => {
    if (isConversionPage) {
      // Load immediately for conversion tracking
      setShouldLoadAnalytics(true);
    } else {
      // Load analytics after page becomes idle or after 3 seconds
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setShouldLoadAnalytics(true), { timeout: 3000 });
      } else {
        setTimeout(() => setShouldLoadAnalytics(true), 3000);
      }
    }
  }, [isConversionPage]);

  if (!shouldLoadAnalytics) return null;

  return (
    <>
      <Script
        id="gtag-base"
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=AW-17109864760"
      />
      <Script
        id="gtag-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Configure Google Ads with enhanced conversions
            gtag('config', 'AW-17109864760', {
              'allow_enhanced_conversions': true
            });
            
            // Mark gtag as ready
            window.gtagReady = true;
            
            // Configure Google Analytics if available
            if ('${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}') {
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            }
          `,
        }}
      />
    </>
  );
}