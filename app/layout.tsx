import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClientProviders from '../components/ClientProviders';
import { criticalCSS } from '../lib/critical-css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import OptimizedScripts from '../components/OptimizedScripts';
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
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.gstatic.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
        
        {/* Critical CSS inlined to eliminate render-blocking */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* Preload key resources */}
        <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" 
              href="/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2" />
        
        {/* Prefetch non-critical resources */}
        <link rel="prefetch" href="/api/submit-form" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ClientProviders>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ClientProviders>
        <SpeedInsights />
        <OptimizedScripts />
      </body>
    </html>
  );
} 