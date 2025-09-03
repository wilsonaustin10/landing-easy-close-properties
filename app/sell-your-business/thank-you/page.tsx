'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Phone, Shield, Users } from 'lucide-react';
import { trackEvent } from '../../../utils/analytics';
import { trackGoogleAdsConversion, getConversionLabel } from '../../../utils/googleAdsConversion';
import CalendarScheduler from '../../../components/CalendarScheduler';

interface BusinessFormData {
  leadId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  annualRevenue?: string;
}

export default function BusinessThankYouPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formData, setFormData] = useState<BusinessFormData | null>(null);

  useEffect(() => {
    trackEvent('business_thank_you_page_view');
    
    // Retrieve business form data from sessionStorage for enhanced conversion tracking
    const storedData = sessionStorage.getItem('businessFormData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setFormData(data);
        
        // Track conversion with enhanced data
        trackGoogleAdsConversion({
          conversionLabel: getConversionLabel('business'),
          value: parseInt(data.annualRevenue) || 1000000, // Use annual revenue as value
          transactionId: data.leadId || `business_${Date.now()}`,
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName
        }).then(success => {
          if (success) {
            console.log('Business conversion tracked successfully');
            // Clear the stored data after successful tracking
            sessionStorage.removeItem('businessFormData');
          }
        });
      } catch (error) {
        console.error('Error parsing stored business form data:', error);
        // Fallback to basic conversion tracking
        trackGoogleAdsConversion({
          conversionLabel: getConversionLabel('business'),
          value: 1000000, // Default value for business leads
          transactionId: `business_${Date.now()}`
        });
      }
    } else {
      // Fallback to basic conversion tracking if no stored data
      trackGoogleAdsConversion({
        conversionLabel: getConversionLabel('business'),
        value: 1000000, // Default value for business leads
        transactionId: `business_${Date.now()}`
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