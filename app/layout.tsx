import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import ClientProviders from '../components/ClientProviders';
import type { Metadata } from 'next';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
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
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.gstatic.com" />
        
        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for initial render */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; }
            .min-h-screen { min-height: 100vh; }
            .bg-gradient-to-b { background: linear-gradient(to bottom, #f9fafb, #ffffff); }
            .bg-gradient-to-br { background: linear-gradient(to bottom right, #002767, #bd0b31); }
            .text-white { color: white; }
            .text-center { text-align: center; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .max-w-6xl { max-width: 72rem; }
            .max-w-3xl { max-width: 48rem; }
            .pt-20 { padding-top: 5rem; }
            .pb-16 { padding-bottom: 4rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .text-4xl { font-size: 2.25rem; }
            .font-bold { font-weight: 700; }
            .text-xl { font-size: 1.25rem; }
            @media (min-width: 768px) {
              .md\:text-5xl { font-size: 3rem; }
            }
            @media (min-width: 1024px) {
              .lg\:text-6xl { font-size: 3.75rem; }
            }
          `
        }} />
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
      <body className={inter.className}>
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