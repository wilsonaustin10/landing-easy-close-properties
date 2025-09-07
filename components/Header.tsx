'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/Easy Close Properties Logo.webp"
              alt="Easy Close Properties"
              width={160}
              height={42}
              sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 160px"
              priority
              className="hover:opacity-90 transition-opacity w-[120px] sm:w-[140px] md:w-[160px] h-auto"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAAAwAgCdASoKABgAAkA4JZwAAjnAAP7+FgAA"
            />
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-primary hover:text-accent font-medium text-lg transition-colors"
            >
              Home
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-primary hover:text-accent font-medium text-lg transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="#testimonials" 
              className="text-primary hover:text-accent font-medium text-lg transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <Link
              href="/sell-your-business"
              className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 border border-primary text-xs sm:text-sm md:text-base font-medium rounded-md text-primary bg-white hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors whitespace-nowrap"
            >
              <span className="hidden sm:inline">Sell Your </span>Business
            </Link>
            <Link
              href="/#property-form"
              className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 border border-transparent text-xs sm:text-sm md:text-base font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors whitespace-nowrap"
            >
              Get <span className="hidden sm:inline">Your </span>Offer
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 