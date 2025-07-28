'use client';

import React, { useEffect } from 'react';
import { CheckCircle, Clock, Phone, Shield, Users } from 'lucide-react';
import { trackEvent } from '../../../utils/analytics';
import CalendarScheduler from '../../../components/CalendarScheduler';

export default function BusinessThankYouPage() {
  useEffect(() => {
    trackEvent('business_thank_you_page_view');
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17109864760/business-conversion-id', // Update with actual conversion ID
      });
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thank You! We&apos;ve Received Your Business Information
          </h1>
          <p className="text-xl text-gray-600">
            Our M&A specialists will prepare your confidential business valuation within 24 hours
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">What Happens Next?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Confidential Business Analysis</h3>
                <p className="text-gray-600">
                  Our team will analyze your business metrics and prepare a fair market valuation
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Private Consultation Call</h3>
                <p className="text-gray-600">
                  We&apos;ll discuss your retirement plans, business legacy, and answer all your questions
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Employee & Legacy Protection</h3>
                <p className="text-gray-600">
                  We&apos;ll work with you to ensure your team and business legacy are preserved
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Close in 30 Days or Less</h3>
                <p className="text-gray-600">
                  Once terms are agreed, we can complete the acquisition quickly and efficiently
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Scheduling Widget */}
        <div className="mb-8">
          <CalendarScheduler 
            onSchedule={() => trackEvent('schedule_consultation_click')}
          />
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">Need Immediate Assistance?</h3>
          <p className="text-gray-600 mb-4">
            Our business acquisition specialists are standing by
          </p>
          <a 
            href="tel:(302) 592-3436" 
            className="inline-flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => trackEvent('business_thank_you_page_call_click')}
          >
            <Phone className="h-5 w-5" />
            <span>(302) 592-3436</span>
          </a>
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p className="font-semibold mb-2">Your Privacy is Our Priority</p>
          <p>
            All information shared is kept strictly confidential. Your employees, customers, 
            and competitors will not know about this process until you&apos;re ready.
          </p>
        </div>
      </div>
    </main>
  );
}