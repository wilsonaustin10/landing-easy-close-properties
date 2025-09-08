/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  // Enable static optimization
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  // Configure SWC to target modern browsers only
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Webpack configuration to reduce polyfills
  webpack: (config, { isServer }) => {
    // Skip polyfills for modern browser features
    config.resolve.alias = {
      ...config.resolve.alias,
      'core-js/modules/es.array.at': false,
      'core-js/modules/es.array.flat': false,
      'core-js/modules/es.array.flat-map': false,
      'core-js/modules/es.object.from-entries': false,
      'core-js/modules/es.object.has-own': false,
      'core-js/modules/es.string.trim-end': false,
      'core-js/modules/es.string.trim-start': false,
    };
    
    // Target modern JavaScript
    if (!isServer) {
      config.target = ['web', 'es2020'];
    }
    
    return config;
  },
  // Configure image domains if needed
  images: {
    domains: ['localhost', 'offer.goservebig.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Add domain for Maps API
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' https://offer.goservebig.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.googletagmanager.com https://*.googleadservices.com https://*.googlesyndication.com https://*.doubleclick.net; script-src-elem 'self' 'unsafe-inline' https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.googletagmanager.com https://*.googleadservices.com https://*.googlesyndication.com https://*.doubleclick.net https://googleads.g.doubleclick.net; img-src 'self' data: https: https://*.google.com https://*.googleadservices.com https://*.googlesyndication.com https://*.doubleclick.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.google.com https://*.googleapis.com https://*.gstatic.com https://*.googletagmanager.com https://*.google-analytics.com https://*.googleadservices.com https://*.googlesyndication.com https://*.doubleclick.net https://googleads.g.doubleclick.net;`
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

module.exports = withBundleAnalyzer(nextConfig)