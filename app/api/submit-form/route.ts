import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { LeadFormData } from '@/types';
import { rateLimit } from '@/utils/rateLimit';
import { ghlIntegration } from '@/utils/ghlIntegration';
import { numverifyClient } from '@/utils/numverify';
import { googleSheetsClient, initializeGoogleSheets } from '@/utils/googleSheets';
import { trackServerSideConversion, getConversionLabel } from '@/utils/googleAdsConversion';

// Business form data interface
interface BusinessFormData {
  businessType: string;
  annualRevenue: string;
  reasonForSelling: string;
  timeline: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  leadId: string;
  submissionType: string;
  timestamp: string;
  recaptchaToken?: string;
}

// Validate complete property form data
function validatePropertyFormData(data: Partial<LeadFormData>): data is LeadFormData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Required fields validation
  const requiredFields: (keyof LeadFormData)[] = [
    'address', 'phone', 'firstName', 'lastName', 
    'email', 'propertyCondition', 'timeframe', 'price',
    'leadId'
  ];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Phone number validation
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(data.phone as string)) {
    throw new Error('Invalid phone number format');
  }

  return true;
}

// Validate business form data
function validateBusinessFormData(data: Partial<BusinessFormData>): data is BusinessFormData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  // Required fields validation
  const requiredFields: (keyof BusinessFormData)[] = [
    'businessType', 'annualRevenue', 'reasonForSelling', 
    'timeline', 'firstName', 'lastName', 'email', 'phone', 'leadId'
  ];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }

  return true;
}

// Verify reCAPTCHA token
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('reCAPTCHA secret key not configured');
    return true; // Allow submission in development
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    return data.success && data.score >= 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Send data to Zapier webhook (for backward compatibility)
async function sendToZapier(data: LeadFormData | BusinessFormData) {
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('Zapier webhook URL not configured, skipping...');
    return;
  }

  try {
    const formattedTimestamp = new Date().toLocaleString();
    
    const payload = {
      ...data,
      formattedTimestamp,
      phoneRaw: data.phone ? data.phone.replace(/\D/g, '') : '',
      fullName: `${data.firstName} ${data.lastName}`
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zapier webhook error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
    }
  } catch (error) {
    console.error('Error in sendToZapier:', error);
  }
}

/**
 * API Route for saving form submissions
 * Handles both property and business acquisition forms
 */
export async function POST(request: Request) {
  try {
    // Log incoming request
    console.log('Received form submission request');

    // 1. Rate limiting check
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    // const timestamp = new Date().toISOString();
    
    const rateLimitResult = await rateLimit(ip);
    if (!rateLimitResult.success) {
      console.log('Rate limit exceeded for IP:', ip);
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // 2. Parse request data
    let data;
    try {
      data = await request.json();
      console.log('Received form data:', {
        submissionType: data.submissionType,
        leadId: data.leadId
      });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // 3. Verify reCAPTCHA if token provided
    if (data.recaptchaToken) {
      const isValidRecaptcha = await verifyRecaptcha(data.recaptchaToken);
      if (!isValidRecaptcha) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }

    // 4. Handle based on submission type
    if (data.submissionType === 'business_acquisition') {
      // Validate business form
      if (!validateBusinessFormData(data)) {
        return NextResponse.json(
          { error: 'Invalid form data - Missing required fields' },
          { status: 400 }
        );
      }

      // Validate phone with numverify
      const phoneValidation = await numverifyClient.validatePhoneWithCache(data.phone);
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { error: phoneValidation.error || 'Invalid phone number' },
          { status: 400 }
        );
      }

      // Update phone with formatted version
      data.phone = phoneValidation.formatted;

      // Send to new business acquisition webhook (skip in local development)
      if (process.env.NODE_ENV === 'production') {
        try {
          const response = await fetch('https://api.monopolymoney.ca/api/webhooks/easy-close-business-acquisition', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...data,
              formattedTimestamp: new Date().toLocaleString(),
              phoneRaw: data.phone.replace(/\D/g, ''),
              fullName: `${data.firstName} ${data.lastName}`
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Business acquisition webhook error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            });
            
            // Fallback to GHL if new webhook fails
            const ghlSuccess = await ghlIntegration.submitBusinessLead(data);
            if (!ghlSuccess) {
              console.error('Failed to submit to both new webhook and GHL');
            }
          } else {
            console.log('Successfully sent business lead to new webhook');
          }
        } catch (error) {
          console.error('Error sending to business acquisition webhook:', error);
          
          // Fallback to GHL if new webhook fails
          const ghlSuccess = await ghlIntegration.submitBusinessLead(data);
          if (!ghlSuccess) {
            console.error('Failed to submit to both new webhook and GHL');
          }
        }
      } else {
        // In development, just log the data that would be sent
        console.log('Development mode - Would send to business acquisition webhook:', {
          ...data,
          formattedTimestamp: new Date().toLocaleString(),
          phoneRaw: data.phone.replace(/\D/g, ''),
          fullName: `${data.firstName} ${data.lastName}`
        });
        
        // Still try GHL in development if configured
        const ghlSuccess = await ghlIntegration.submitBusinessLead(data);
        if (!ghlSuccess) {
          console.log('GHL not configured or failed in development');
        }
      }

      // Also send to Zapier for backup
      await sendToZapier(data);

      // Send to Google Sheets
      try {
        await initializeGoogleSheets(); // Ensure headers are set
        const googleSheetsSuccess = await googleSheetsClient.appendBusinessLead(data);
        if (!googleSheetsSuccess) {
          console.log('Failed to send business lead to Google Sheets (non-critical)');
        }
      } catch (error) {
        console.error('Error sending business lead to Google Sheets:', error);
        // Don't fail the request if Google Sheets fails
      }

      // Server-side conversion tracking DISABLED by default
      // Only use this as a backup if client-side tracking fails
      // Uncomment the code below ONLY if you're experiencing issues with thank-you page tracking
      
      /* BACKUP SERVER-SIDE TRACKING (DISABLED)
      try {
        // Only track if explicitly enabled via environment variable
        if (process.env.ENABLE_SERVER_SIDE_CONVERSION === 'true') {
          await trackServerSideConversion({
            conversionLabel: getConversionLabel('business'),
            value: parseInt(data.annualRevenue) || 1000000,
            transactionId: data.leadId,
            email: data.email,
            phone: data.phone,
            firstName: data.firstName,
            lastName: data.lastName,
            userAgent: headersList.get('user-agent') || undefined,
            ipAddress: ip,
            acceptLanguage: headersList.get('accept-language') || undefined
          });
        }
      } catch (error) {
        console.error('Error tracking server-side business conversion:', error);
        // Don't fail the request if conversion tracking fails
      }
      */

      return NextResponse.json({ 
        success: true,
        leadId: data.leadId,
        message: 'Business inquiry submitted successfully'
      });

    } else {
      // Handle property form (existing logic)
      if (!validatePropertyFormData(data)) {
        return NextResponse.json(
          { error: 'Invalid form data - Missing required fields or invalid format' },
          { status: 400 }
        );
      }

      // Send to Zapier webhook
      await sendToZapier(data);

      // Send to Google Sheets
      try {
        await initializeGoogleSheets(); // Ensure headers are set
        const googleSheetsSuccess = await googleSheetsClient.appendPropertyLead(data);
        if (!googleSheetsSuccess) {
          console.log('Failed to send property lead to Google Sheets (non-critical)');
        }
      } catch (error) {
        console.error('Error sending property lead to Google Sheets:', error);
        // Don't fail the request if Google Sheets fails
      }

      // Server-side conversion tracking DISABLED by default
      // Only use this as a backup if client-side tracking fails
      // Uncomment the code below ONLY if you're experiencing issues with thank-you page tracking
      
      /* BACKUP SERVER-SIDE TRACKING (DISABLED)
      try {
        // Only track if explicitly enabled via environment variable
        if (process.env.ENABLE_SERVER_SIDE_CONVERSION === 'true') {
          await trackServerSideConversion({
            conversionLabel: getConversionLabel('property'),
            value: parseInt(data.price) || 250000,
            transactionId: data.leadId,
            email: data.email,
            phone: data.phone,
            firstName: data.firstName,
            lastName: data.lastName,
            userAgent: headersList.get('user-agent') || undefined,
            ipAddress: ip,
            acceptLanguage: headersList.get('accept-language') || undefined,
            address: {
              street: data.streetAddress,
              city: data.city,
              state: data.state,
              postalCode: data.postalCode,
              country: 'US'
            }
          });
        }
      } catch (error) {
        console.error('Error tracking server-side property conversion:', error);
        // Don't fail the request if conversion tracking fails
      }
      */

      return NextResponse.json({ 
        success: true,
        leadId: data.leadId
      });
    }

  } catch (error) {
    console.error('Error submitting form:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}