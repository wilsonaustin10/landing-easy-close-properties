# Google Ads Conversion Tracking Implementation

## Overview
This document describes the enhanced Google Ads conversion tracking implementation for Easy Close Properties landing pages.

**IMPORTANT**: This implementation tracks conversions ONLY when users reach the thank-you page after completing the full form. Server-side tracking is DISABLED by default to ensure accurate conversion data.

## Key Improvements

### 1. Enhanced Conversion Tracking
- **File**: `utils/googleAdsConversion.ts`
- Implements enhanced conversions with user data hashing (SHA-256)
- Sends additional data (email, phone, name, address) for better matching
- Includes proper phone number normalization for international format

### 2. Client-Side Tracking (Thank You Pages)
- **Property Leads**: `app/thank-you/page.tsx`
- **Business Leads**: `app/sell-your-business/thank-you/page.tsx`
- Retrieves form data from sessionStorage
- Sends conversion with actual property/business value
- Includes complete user data for enhanced matching
- Fallback to basic tracking if no data available

### 3. Server-Side Tracking (DISABLED BY DEFAULT)
- **File**: `app/api/submit-form/route.ts`
- **STATUS**: Commented out and disabled by default
- Only enable via `ENABLE_SERVER_SIDE_CONVERSION=true` if experiencing issues
- Prevents duplicate conversion tracking
- When enabled, acts as a backup for missed thank-you page loads

### 4. Proper gtag Loading
- **Files**: `app/layout.tsx`, `utils/analytics.ts`
- Implements gtag ready state checking
- Waits for gtag to load before firing conversions
- Enables enhanced conversions globally
- Includes timeout handling (5 seconds)

### 5. Data Storage for Conversion Tracking
- **FormContext**: Stores form data in sessionStorage
- **BusinessForm**: Stores business data before redirect
- Data includes lead ID for transaction tracking

## Environment Variables

Add these to your `.env.local` or production environment:

```env
# Required
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-17109864760
NEXT_PUBLIC_PROPERTY_CONVERSION_LABEL=fLFZCLzz-fkYELD4yf8p
NEXT_PUBLIC_BUSINESS_CONVERSION_LABEL=bIZqCM3z-fkYELD4yf8p

# Optional (for server-side tracking via API)
GOOGLE_ADS_API_KEY=your_api_key
GOOGLE_ADS_CUSTOMER_ID=your_customer_id
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
```

## Conversion Labels

Your conversion labels are now configured:

1. **Property Lead Conversion**: 
   - Label: `_wUiCO6H2pMbELiiz94_`
   - Full conversion string: `AW-17109864760/_wUiCO6H2pMbELiiz94_`
   - Set in: `.env` file as `NEXT_PUBLIC_PROPERTY_CONVERSION_LABEL`

2. **Business Lead Conversion**:
   - Label: `_wUiCO6H2pMbELiiz94_` (using same as property for now)
   - Full conversion string: `AW-17109864760/_wUiCO6H2pMbELiiz94_`
   - Set in: `.env` file as `NEXT_PUBLIC_BUSINESS_CONVERSION_LABEL`

Note: If you have a separate conversion action for business leads, update `NEXT_PUBLIC_BUSINESS_CONVERSION_LABEL` with that specific label.

## Getting Your Conversion Labels

1. Go to your Google Ads account
2. Navigate to Tools & Settings → Measurement → Conversions
3. Create or select your conversions:
   - "Property Lead Submission"
   - "Business Lead Submission"
4. Click on the conversion name
5. Select "Tag setup" → "Use Google Tag Manager"
6. Find the conversion ID and label in the format: `AW-XXXXXXXXX/YYYYYYYYYYY`
   - `AW-XXXXXXXXX` is your Google Ads ID
   - `YYYYYYYYYYY` is your conversion label

## Conversion Values

The system assigns a fixed value of **$10 per qualified lead** for both property and business leads.

This represents the actual value of a lead to your business, not the property or business value itself. Google Ads uses this to optimize for leads that are worth $10 to your business based on your typical close rate and profit margins.

To adjust this value, update the `value` parameter in:
- Property leads: `app/thank-you/page.tsx`
- Business leads: `app/sell-your-business/thank-you/page.tsx`

## Conversion Deduplication

The implementation includes built-in deduplication:
- Each conversion is tracked with a unique transaction ID (leadId)
- Conversions are stored in sessionStorage to prevent duplicates
- If a user refreshes the thank-you page, the conversion won't fire twice
- Google Ads also uses transaction IDs for server-side deduplication

## Testing Your Implementation

1. **Check gtag is loading**:
   ```javascript
   // In browser console
   window.gtag // Should be a function
   window.dataLayer // Should be an array
   ```

2. **Use Google Tag Assistant**:
   - Install the Chrome extension
   - Navigate through your form flow
   - Verify conversions fire on thank-you pages

3. **Check Network Tab**:
   - Look for requests to `googleads.g.doubleclick.net`
   - Should include your conversion label
   - Should have enhanced conversion data

4. **Verify in Google Ads**:
   - Conversions should appear in Tools → Conversions
   - May take 24-48 hours for first conversions to show
   - Check "Diagnostics" tab for any issues

## Enhanced Conversions Benefits

1. **Better Match Rates**: User data helps Google match conversions to ad clicks
2. **Cross-Device Tracking**: Links conversions across user devices
3. **Privacy Compliant**: All data is hashed before sending
4. **Improved ROAS**: Better attribution leads to better optimization

## Troubleshooting

### Conversions Not Showing
1. Verify conversion labels are correct in environment variables
2. Check browser console for errors
3. Ensure gtag is loading (check for ad blockers)
4. Verify form data is being stored in sessionStorage
5. Check Google Ads conversion diagnostics

### Partial Data
1. Ensure all form fields are being captured
2. Check sessionStorage has complete data
3. Verify phone number format is correct

### Server-Side Tracking Issues
1. API credentials need to be set up in Google Ads API Center
2. Ensure all required permissions are granted
3. Check server logs for API errors

## Security Notes

- All sensitive data is hashed using SHA-256 before sending
- Phone numbers are normalized to E.164 format
- No raw PII is sent to Google
- Server-side tracking includes additional security via API authentication

## Next Steps

1. Update the conversion labels in your environment variables
2. Deploy to production
3. Test the complete flow
4. Monitor in Google Ads for 24-48 hours
5. Set up conversion-based bidding strategies once data flows