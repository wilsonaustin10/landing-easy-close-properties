# Deployment Guide for Sell Your Business Landing Page

## Quick Start

This Next.js application is ready for deployment. Follow these steps:

### 1. Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com) and import your repository
3. Configure environment variables (see below)
4. Deploy!

**Vercel Settings:**
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: `18.x` or higher

### 2. Required Environment Variables

At minimum, you need:

```env
# For address autocomplete functionality
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# For form submissions (choose one):
# Option A: Zapier Webhook
ZAPIER_WEBHOOK_URL=your_zapier_webhook_url

# Option B: Google Sheets Integration
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account"...} # Full JSON key
GOOGLE_SHEETS_BUSINESS_ID=your_google_sheet_id
```

### 3. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain(s)

### 4. Google Sheets Integration (Optional)

If using Google Sheets for lead storage:

1. Create a Google Cloud service account
2. Enable Google Sheets API
3. Share your Google Sheet with the service account email
4. Add the service account JSON key to environment variables

### 5. Production Checklist

- [x] All TypeScript errors resolved
- [x] Build completes successfully (`npm run build`)
- [x] Environment variables configured
- [x] Google Maps API key restricted to production domain
- [x] ReCAPTCHA configured (optional but recommended)
- [x] Analytics tracking codes added (GA, Facebook Pixel, etc.)

## Deployment Platforms

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the .next folder
```

### Self-Hosted (Docker)
```bash
docker build -t business-landing .
docker run -p 3000:3000 --env-file .env.production business-landing
```

### AWS/Azure/GCP
The app is configured with `output: 'standalone'` in next.config.js for containerized deployments.

## Post-Deployment

1. **Test the forms:** Submit test data through the business form
2. **Verify integrations:** Check that leads appear in your CRM/Google Sheets
3. **Monitor performance:** Use Vercel Analytics or Google Analytics
4. **Set up alerts:** Configure uptime monitoring

## Environment Variables Reference

See `.env.production` for a complete list with descriptions.

## Troubleshooting

### Form submissions not working
- Check ZAPIER_WEBHOOK_URL or Google Sheets credentials
- Verify API routes are accessible (`/api/submit-form`)
- Check browser console for errors

### Google Maps not loading
- Verify API key is correct
- Check that Places API is enabled
- Ensure domain is whitelisted in API key restrictions

### Build failures
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors with `npm run lint`
- Verify all environment variables are set

## Support

For deployment issues, check:
1. Vercel deployment logs
2. Browser developer console
3. API route responses in Network tab

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Enable ReCAPTCHA for production to prevent spam
- Regularly update dependencies with `npm audit fix`