import { useEffect, useState } from 'react';

declare global {
  interface Window {
    initGoogleMaps?: () => void;
    googleMapsLoaded?: boolean;
    googleMapsLoading?: boolean;
  }
}

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadGoogleMaps = () => {
    if (window.googleMapsLoaded) {
      setIsLoaded(true);
      return;
    }

    if (window.googleMapsLoading) {
      // Wait for existing load
      const checkInterval = setInterval(() => {
        if (window.googleMapsLoaded) {
          clearInterval(checkInterval);
          setIsLoaded(true);
        }
      }, 100);
      return;
    }

    window.googleMapsLoading = true;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    window.initGoogleMaps = () => {
      window.googleMapsLoaded = true;
      window.googleMapsLoading = false;
      setIsLoaded(true);
      window.dispatchEvent(new Event('google-maps-loaded'));
    };

    document.head.appendChild(script);
  };

  return { isLoaded, loadGoogleMaps };
};