import React from 'react';
import Link from 'next/link';
import { Phone, Clock, Shield, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export default function BusinessFooter() {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/Easy Close Properties Transparent.png"
                alt="Easy Close Properties"
                width={100}
                height={26}
                className="mr-2"
              />
            </div>
            <p className="text-white/90">
              We acquire profitable businesses from owners ready to move on. Quick closings, fair valuations, and we preserve your legacy.
            </p>
            <div className="space-y-2">
              <a 
                href="tel: (302) 592-3436"
                className="flex items-center space-x-2 text-white/80 hover:text-red-400 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>(302) 592-3436</span>
              </a>
            </div>
          </div>

          {/* Business Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">We Buy</h3>
            <ul className="space-y-2">
              <li className="text-white/80">Restaurants & Food Service</li>
              <li className="text-white/80">Retail Businesses</li>
              <li className="text-white/80">Manufacturing Companies</li>
              <li className="text-white/80">Professional Services</li>
              <li className="text-white/80">Healthcare Practices</li>
              <li className="text-white/80">E-commerce Businesses</li>
            </ul>
          </div>

          {/* Why Sell To Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Why Sell To Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <Clock className="h-4 w-4 mt-1 flex-shrink-0 text-red-400" />
                <span className="text-white/80">Close in 30 days or less</span>
              </li>
              <li className="flex items-start space-x-2">
                <Shield className="h-4 w-4 mt-1 flex-shrink-0 text-red-400" />
                <span className="text-white/80">100% Confidential</span>
              </li>
              <li className="flex items-start space-x-2">
                <TrendingUp className="h-4 w-4 mt-1 flex-shrink-0 text-red-400" />
                <span className="text-white/80">No broker fees</span>
              </li>
              <li className="text-white/80">• We preserve your legacy</li>
              <li className="text-white/80">• Smooth transition for employees</li>
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Ready to Sell?</h3>
            <p className="text-white/90 mb-4">
              Get a free, confidential business valuation today. No obligation.
            </p>
            <Link
              href="/sell-your-business#business-form"
              className="inline-block bg-accent text-white px-6 py-2 rounded-lg hover:bg-red-500 transition-colors"
            >
              Get Free Valuation
            </Link>
            <div className="mt-6">
              <Link 
                href="/"
                className="text-white/80 hover:text-red-400 transition-colors text-sm"
              >
                ← Selling a Property Instead?
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/80">
          <p>© {new Date().getFullYear()} Easy Close Properties. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-red-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-red-400 transition-colors">
              Terms of Service
            </Link>
            <span className="text-white/60">|</span>
            <span className="text-white/60">Business Acquisitions Division</span>
          </div>
        </div>
      </div>
    </footer>
  );
}