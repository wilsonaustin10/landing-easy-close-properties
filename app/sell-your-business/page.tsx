import React from 'react';
import BusinessForm from '../../components/BusinessForm';
import BusinessTestimonials from '../../components/BusinessTestimonials';
// import TrustBadges from '../../components/TrustBadges';  // Kept for future use
// import { CheckCircle } from 'lucide-react';
import { BusinessBenefits } from '../../components/BusinessBenefits';
import { BusinessHowItWorks } from '../../components/BusinessHowItWorks';

export default function SellYourBusiness() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section id="business-form" className="pt-20 pb-16 px-4 bg-gradient-to-br from-primary to-secondary bg-opacity-90">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to Sell? We Buy Your Business in 30 Days or Less
            </h1>
            <p className="text-xl text-white mb-8">
              Fair offers for business owners - No broker fees, complete confidentiality, and we care about your legacy
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <BusinessForm />
          </div>
          <BusinessBenefits className="mx-auto mt-12" />
        </div>
      </section>

      {/* TrustBadges component removed but kept for future use */}
      {/* <TrustBadges /> */}
      
      {/* Benefits Section */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6 text-primary">
            Why Sell Your Business To Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Quick & Confidential',
                description: 'Complete discretion throughout the process with closing in 30 days or less'
              },
              {
                title: 'Fair Market Value',
                description: 'Get a fair valuation based on revenue, assets, and growth potential'
              },
              {
                title: 'No Broker Fees',
                description: 'Direct buyer means more money in your pocket - save 5-10% in broker commissions'
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-lg shadow-lg bg-white border-t-4 border-secondary">
                <h3 className="text-xl font-semibold mb-3 text-primary">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BusinessHowItWorks />
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-4 bg-gray-100">
        <BusinessTestimonials />
      </section>
    </main>
  );
}