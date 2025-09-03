import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import ClientProviders from '../components/ClientProviders';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

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
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=AW-17109864760"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
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
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`}
          strategy="lazyOnload"
        />
        <Script
          id="google-maps-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.initGoogleMaps = function() {
                console.log('Google Maps initialized');
                window.dispatchEvent(new Event('google-maps-loaded'));
              };
            `,
          }}
        />
      </body>
    </html>
  );
} 