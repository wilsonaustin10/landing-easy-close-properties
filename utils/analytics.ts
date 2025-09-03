declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    gtagReady?: boolean;
  }
}

export const initializeAnalytics = () => {
  if (typeof window !== 'undefined') {
    // Check if gtag is already loaded
    if (typeof window.gtag === 'function' && window.dataLayer) {
      window.gtagReady = true;
      return;
    }

    const script = document.createElement('script');
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    
    // Set up load handler to mark gtag as ready
    script.onload = () => {
      window.gtagReady = true;
      console.log('Google Analytics loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Analytics');
    };
    
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', gaId);
    
    // Configure Google Ads tag with enhanced conversions
    const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17109864760';
    window.gtag('config', googleAdsId, {
      allow_enhanced_conversions: true
    });
  }
};

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Track a Google Ads conversion
export const trackConversion = (conversionId: string, conversionLabel: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `${conversionId}/${conversionLabel}`,
      ...params
    });
  }
}; 