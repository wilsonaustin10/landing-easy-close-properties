import React from 'react';
import { MessageSquare, Clock, HandshakeIcon, Banknote } from 'lucide-react';

export function BusinessHowItWorks() {
  const steps = [
    {
      icon: MessageSquare,
      title: 'Share Your Business Details',
      description: "Quick 2-minute confidential form"
    },
    {
      icon: Clock,
      title: 'Free Business Valuation',
      description: 'Our M&A experts analyze your business within 24 hours'
    },
    {
      icon: HandshakeIcon,
      title: 'Receive Your Fair Offer',
      description: 'Cash offer based on revenue, assets, and potential'
    },
    {
      icon: Banknote,
      title: 'Close on Your Timeline',
      description: 'Complete the sale in 30 days or on your schedule'
    }
  ];

  return (
    <section className="py-16 bg-gray-50" id="how-it-works">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Your Exit Strategy in 4 Simple Steps
        </h2>
        
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <div className="absolute -top-4 left-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
          <p className="text-center text-gray-700">
            <span className="font-semibold">Complete Confidentiality:</span> Your employees, customers, and competitors won&apos;t know until you&apos;re ready. We understand the sensitive nature of business sales.
          </p>
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
          <p className="text-lg text-gray-600">
            We&apos;ve helped over 200 business owners transition successfully. Our team handles all legal, financial, and operational aspects, ensuring your legacy continues while you enjoy your well-deserved retirement.
          </p>
        </div>
      </div>
    </section>
  );
}