interface NumverifyResponse {
  valid: boolean;
  number: string;
  local_format: string;
  international_format: string;
  country_prefix: string;
  country_code: string;
  country_name: string;
  location: string;
  carrier: string;
  line_type: string;
}

export class NumverifyClient {
  private apiKey: string;
  private baseUrl = 'http://apilayer.net/api/validate';

  constructor() {
    this.apiKey = process.env.NUMVERIFY_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Numverify API key not configured - phone validation will be skipped');
    }
  }

  async validatePhone(phoneNumber: string, countryCode: string = 'US'): Promise<{
    valid: boolean;
    formatted: string;
    lineType: string;
    carrier?: string;
    error?: string;
  }> {
    // If no API key, do basic validation
    if (!this.apiKey) {
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      const isValid = cleanPhone.length === 10 && /^[2-9]\d{9}$/.test(cleanPhone);
      
      return {
        valid: isValid,
        formatted: phoneNumber,
        lineType: 'unknown',
        error: isValid ? undefined : 'Invalid phone number format'
      };
    }

    try {
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      const url = new URL(this.baseUrl);
      url.searchParams.append('access_key', this.apiKey);
      url.searchParams.append('number', cleanPhone);
      url.searchParams.append('country_code', countryCode);
      url.searchParams.append('format', '1');

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Numverify API error: ${response.statusText}`);
      }

      const data: NumverifyResponse = await response.json();

      // Check if it's a valid mobile or fixed line
      const validLineTypes = ['mobile', 'fixed_line', 'fixed_line_or_mobile'];
      const isValidType = validLineTypes.includes(data.line_type);

      return {
        valid: data.valid && isValidType,
        formatted: data.international_format || phoneNumber,
        lineType: data.line_type,
        carrier: data.carrier,
        error: !data.valid ? 'Invalid phone number' : 
               !isValidType ? 'Please provide a valid mobile or landline number' : 
               undefined
      };
    } catch (error) {
      console.error('Numverify validation error:', error);
      
      // Fallback to basic validation
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      const isValid = cleanPhone.length === 10 && /^[2-9]\d{9}$/.test(cleanPhone);
      
      return {
        valid: isValid,
        formatted: phoneNumber,
        lineType: 'unknown',
        error: 'Phone validation service temporarily unavailable'
      };
    }
  }

  // Cache validation results for 24 hours to avoid excessive API calls
  private cache = new Map<string, { result: any; timestamp: number }>();
  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours

  async validatePhoneWithCache(phoneNumber: string, countryCode: string = 'US') {
    const cacheKey = `${phoneNumber}-${countryCode}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }

    const result = await this.validatePhone(phoneNumber, countryCode);
    this.cache.set(cacheKey, { result, timestamp: Date.now() });

    return result;
  }
}

export const numverifyClient = new NumverifyClient();