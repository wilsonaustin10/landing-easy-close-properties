'use client';

import { useEffect, useRef } from 'react';
import { useGoogleMaps } from './useGoogleMaps';

declare global {
  namespace google.maps.places {
    interface AutocompleteOptions {
      componentRestrictions?: ComponentRestrictions;
      fields?: string[];
      types?: string[];
      sessionToken?: google.maps.places.AutocompleteSessionToken;
    }
  }
}

export interface AddressData {
  formattedAddress: string;
  placeId?: string;
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export function useGooglePlaces(
  inputRef: React.RefObject<HTMLInputElement>,
  onAddressSelect: (addressData: AddressData) => void,
  readOnly?: boolean
) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const { isLoaded, loadGoogleMaps } = useGoogleMaps();
  const hasInitiatedLoad = useRef(false);

  useEffect(() => {
    // If readOnly is true, or dependencies are not ready, do not initialize
    if (readOnly || !inputRef.current) {
      if (readOnly) {
        console.log('Google Places Autocomplete skipped due to readOnly mode.');
      }
      return;
    }

    // Lazy load Google Maps on first focus
    const handleFocus = () => {
      if (!hasInitiatedLoad.current && !isLoaded) {
        hasInitiatedLoad.current = true;
        loadGoogleMaps();
      }
    };

    inputRef.current?.addEventListener('focus', handleFocus, { once: true });

    return () => {
      inputRef.current?.removeEventListener('focus', handleFocus);
    };
  }, [readOnly, loadGoogleMaps, isLoaded]);

  useEffect(() => {
    if (!isLoaded || readOnly || !inputRef.current) {
      return;
    }

    // Initialize autocomplete once Maps is loaded
    const initAutocomplete = () => {
      if (!window.google?.maps?.places || !inputRef.current) {
        return;
      }

      try {
        // Create a new session token
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();

        // Initialize autocomplete with session token
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            componentRestrictions: { country: 'us' },
            fields: ['address_components', 'formatted_address', 'place_id'],
            types: ['address'],
            sessionToken: sessionTokenRef.current
          }
        );

        // Add place_changed listener
        const listener = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (!place?.formatted_address) return;

          const addressData: AddressData = {
            formattedAddress: place.formatted_address,
            placeId: place.place_id
          };

          // Parse address components
          place.address_components?.forEach(component => {
            const type = component.types[0];
            switch (type) {
              case 'street_number': addressData.streetNumber = component.long_name; break;
              case 'route': addressData.street = component.long_name; break;
              case 'locality': addressData.city = component.long_name; break;
              case 'administrative_area_level_1': addressData.state = component.short_name; break;
              case 'postal_code': addressData.postalCode = component.long_name; break;
            }
          });

          onAddressSelect(addressData);
          
          // Create a new session token after selection
          sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
        });

        console.log('Google Places Autocomplete initialized successfully');
      } catch (error) {
        console.error('Error initializing Places Autocomplete:', error);
      }
    };

    // Try to initialize immediately if Google Maps is already loaded
    if (window.google?.maps?.places) {
      initAutocomplete();
    } else {
      // Listen for the custom event
      const handleGoogleMapsLoaded = () => {
        initAutocomplete();
      };
      window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      
      // Cleanup
      return () => {
        window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded);
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
        sessionTokenRef.current = null;
      };
    }
  }, [inputRef, onAddressSelect, readOnly, isLoaded]);
} 