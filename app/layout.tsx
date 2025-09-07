import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import ClientProviders from '../components/ClientProviders';
import { criticalCSS } from '../lib/critical-css';
import type { Metadata } from 'next';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Easy Close Properties - We Buy Houses Fast',
  description: 'Sell your house fast for cash. We buy houses in any condition. Get a fair cash offer today!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to critical third-party origins - prioritized */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.gstatic.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.gstatic.com" />
        
        {/* Critical CSS inlined to eliminate render-blocking */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* Preload key resources */}
        <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" 
              href="/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2" />
        
        {/* Prefetch non-critical resources */}
        <link rel="prefetch" href="/api/submit-partial" />
        <link rel="prefetch" href="/api/submit-form" />
        
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=AW-17109864760"
        />
        <Script
          id="gtag-init"
          strategy="lazyOnload"
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
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ClientProviders>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
} 