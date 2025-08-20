'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { FormProvider } from '../context/FormContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import ReCaptchaProvider from '../components/ReCaptchaProvider';

const inter = Inter({ subsets: ['latin'] });

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
              gtag('config', 'AW-17109864760');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ReCaptchaProvider>
          <FormProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </FormProvider>
        </ReCaptchaProvider>
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