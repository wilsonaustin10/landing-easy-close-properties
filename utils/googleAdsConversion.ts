import crypto from 'crypto';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    gtagReady?: boolean;
  }
}

interface ConversionData {
  conversionLabel: string;
  value?: number;
  currency?: string;
  transactionId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

interface ServerConversionData extends ConversionData {
  userAgent?: string;
  ipAddress?: string;
  acceptLanguage?: string;
}

function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return `+${cleaned}`;
}

export function waitForGtag(timeout = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const checkInterval = 100;
    let elapsed = 0;
    
    const check = setInterval(() => {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function' && window.dataLayer) {
        clearInterval(check);
        window.gtagReady = true;
        resolve(true);
      }
      
      elapsed += checkInterval;
      if (elapsed >= timeout) {
        clearInterval(check);
        console.warn('gtag not loaded within timeout period');
        resolve(false);
      }
    }, checkInterval);
    
    if (typeof window !== 'undefined' && typeof window.gtag === 'function' && window.dataLayer) {
      clearInterval(check);
      window.gtagReady = true;
      resolve(true);
    }
  });
}

export async function trackGoogleAdsConversion(data: ConversionData): Promise<boolean> {
  try {
    // Deduplication: Check if this conversion was already tracked
    const conversionKey = `conversion_${data.conversionLabel}_${data.transactionId}`;
    if (typeof window !== 'undefined') {
      const tracked = sessionStorage.getItem(conversionKey);
      if (tracked) {
        console.log('Conversion already tracked, skipping duplicate:', conversionKey);
        return true; // Return true since it was already successfully tracked
      }
    }
    
    const gtagReady = await waitForGtag();
    
    if (!gtagReady) {
      console.error('gtag not available for conversion tracking');
      return false;
    }
    
    const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17109864760';
    const conversionEvent: any = {
      send_to: `${googleAdsId}/${data.conversionLabel}`,
      value: data.value || 1.0,
      currency: data.currency || 'USD',
      transaction_id: data.transactionId || `${Date.now()}`,
    };
    
    if (data.email || data.phone || data.firstName || data.lastName || data.address) {
      const enhancedData: any = {};
      
      if (data.email) {
        enhancedData.email = data.email.toLowerCase().trim();
        enhancedData.sha256_email_address = hashData(data.email);
      }
      
      if (data.phone) {
        const normalizedPhone = normalizePhoneNumber(data.phone);
        enhancedData.phone_number = normalizedPhone;
        enhancedData.sha256_phone_number = hashData(normalizedPhone);
      }
      
      if (data.firstName) {
        enhancedData.first_name = data.firstName.toLowerCase().trim();
        enhancedData.sha256_first_name = hashData(data.firstName);
      }
      
      if (data.lastName) {
        enhancedData.last_name = data.lastName.toLowerCase().trim();
        enhancedData.sha256_last_name = hashData(data.lastName);
      }
      
      if (data.address) {
        if (data.address.street) {
          enhancedData.street = data.address.street.toLowerCase().trim();
        }
        if (data.address.city) {
          enhancedData.city = data.address.city.toLowerCase().trim();
          enhancedData.sha256_city = hashData(data.address.city);
        }
        if (data.address.state) {
          enhancedData.region = data.address.state.toLowerCase().trim();
          enhancedData.sha256_region = hashData(data.address.state);
        }
        if (data.address.postalCode) {
          enhancedData.postal_code = data.address.postalCode.trim();
          enhancedData.sha256_postal_code = hashData(data.address.postalCode);
        }
        if (data.address.country) {
          enhancedData.country = data.address.country.toLowerCase().trim();
        }
      }
      
      conversionEvent.user_data = enhancedData;
    }
    
    window.gtag('event', 'conversion', conversionEvent);
    
    window.gtag('event', 'page_view', {
      send_to: googleAdsId,
      value: data.value || 1.0,
      items: [{
        id: data.transactionId || 'lead',
        google_business_vertical: 'real_estate'
      }]
    });
    
    // Mark this conversion as tracked to prevent duplicates
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(conversionKey, 'true');
    }
    
    console.log('Google Ads conversion tracked successfully:', {
      conversionLabel: data.conversionLabel,
      transactionId: conversionEvent.transaction_id
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking Google Ads conversion:', error);
    return false;
  }
}

export async function trackServerSideConversion(data: ServerConversionData): Promise<boolean> {
  try {
    if (!process.env.GOOGLE_ADS_API_KEY || !process.env.GOOGLE_ADS_CUSTOMER_ID) {
      console.log('Google Ads API credentials not configured for server-side tracking');
      return false;
    }
    
    const userIdentifiers: Array<{
      hashed_email?: string;
      hashed_phone_number?: string;
      user_identifier_source: string;
    }> = [];
    
    if (data.email) {
      userIdentifiers.push({
        hashed_email: hashData(data.email),
        user_identifier_source: 'FIRST_PARTY'
      });
    }
    
    if (data.phone) {
      userIdentifiers.push({
        hashed_phone_number: hashData(normalizePhoneNumber(data.phone)),
        user_identifier_source: 'FIRST_PARTY'
      });
    }
    
    const payload = {
      conversions: [{
        gclid: data.transactionId,
        conversion_action: `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/conversionActions/${data.conversionLabel}`,
        conversion_date_time: new Date().toISOString().replace('Z', '+00:00'),
        conversion_value: data.value || 1.0,
        currency_code: data.currency || 'USD',
        user_identifiers: userIdentifiers
      }]
    };
    
    const response = await fetch(
      `https://googleads.googleapis.com/v15/customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}:uploadOfflineUserDataJobs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GOOGLE_ADS_API_KEY}`,
          'Content-Type': 'application/json',
          'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''
        },
        body: JSON.stringify(payload)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Ads API error:', errorText);
      return false;
    }
    
    console.log('Server-side Google Ads conversion tracked successfully');
    return true;
    
  } catch (error) {
    console.error('Error tracking server-side conversion:', error);
    return false;
  }
}

export function initializeEnhancedConversions(): void {
  if (typeof window === 'undefined') return;
  
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17109864760';
  
  window.gtag('config', googleAdsId, {
    allow_enhanced_conversions: true
  });
  
  window.gtag('set', 'user_data', {
    email: undefined,
    phone_number: undefined,
    address: {
      first_name: undefined,
      last_name: undefined,
      street: undefined,
      city: undefined,
      region: undefined,
      postal_code: undefined,
      country: undefined
    }
  });
}

export function getConversionLabel(type: 'property' | 'business'): string {
  const labels = {
    property: process.env.NEXT_PUBLIC_PROPERTY_CONVERSION_LABEL || '_wUiCO6H2pMbELiiz94_',
    business: process.env.NEXT_PUBLIC_BUSINESS_CONVERSION_LABEL || 'bIZqCM3z-fkYELD4yf8p'
  };
  
  return labels[type];
}