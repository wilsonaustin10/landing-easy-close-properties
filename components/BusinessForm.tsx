'use client';

import React, { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { ChevronRight, Building2, DollarSign, Calendar, Loader2 } from 'lucide-react';

interface FormData {
  businessType: string;
  annualRevenue: string;
  reasonForSelling: string;
  timeline: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  leadId: string;
}

const businessTypes = [
  'Restaurant/Food Service',
  'Retail Store',
  'Manufacturing',
  'Professional Services',
  'Healthcare/Medical',
  'Auto/Repair Shop',
  'E-commerce',
  'Other'
];

const revenueRanges = [
  'Under $500K',
  '$500K - $1M',
  '$1M - $3M',
  '$3M - $5M',
  '$5M - $10M',
  'Over $10M'
];

const reasons = [
  'Ready for Next Chapter',
  'Health Reasons',
  'Burnout/Lifestyle Change',
  'Financial Pressure',
  'Other Opportunities',
  'Other'
];

const timelines = [
  'ASAP (Within 30 days)',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  'Just exploring options'
];

export default function BusinessForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    businessType: '',
    annualRevenue: '',
    reasonForSelling: '',
    timeline: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    leadId: ''
  });

  const { executeRecaptcha } = useGoogleReCaptcha();

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const validatePhoneNumber = async (phone: string) => {
    // Remove formatting for validation
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    if (cleanPhone.length !== 10) {
      return { valid: false, message: 'Please enter a valid 10-digit phone number' };
    }

    // Numverify API integration would go here
    // For now, we'll do basic validation
    return { valid: true, message: '' };
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      setError('');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate phone number
      const phoneValidation = await validatePhoneNumber(formData.phone);
      if (!phoneValidation.valid) {
        setError(phoneValidation.message);
        setIsSubmitting(false);
        return;
      }

      // Execute reCAPTCHA
      if (!executeRecaptcha) {
        throw new Error('reCAPTCHA not available');
      }

      const recaptchaToken = await executeRecaptcha('submit_business_form');

      // Generate lead ID
      const leadId = `BIZ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Submit to API
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          leadId,
          recaptchaToken,
          submissionType: 'business_acquisition',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Redirect to business thank you page
      window.location.href = '/sell-your-business/thank-you';
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What type of business do you own?</h3>
            <div className="grid gap-3">
              {businessTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, businessType: type });
                    handleNext();
                  }}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-between group"
                >
                  <span className="flex items-center">
                    <Building2 className="h-5 w-5 mr-3 text-primary" />
                    {type}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What&apos;s your annual revenue?</h3>
            <div className="grid gap-3">
              {revenueRanges.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, annualRevenue: range });
                    handleNext();
                  }}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-between group"
                >
                  <span className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-3 text-primary" />
                    {range}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Why are you considering selling?</h3>
            <div className="grid gap-3">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, reasonForSelling: reason });
                    handleNext();
                  }}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-between group"
                >
                  <span>{reason}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What&apos;s your timeline for selling?</h3>
            <div className="grid gap-3">
              {timelines.map((timeline) => (
                <button
                  key={timeline}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, timeline });
                    handleNext();
                  }}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-between group"
                >
                  <span className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-primary" />
                    {timeline}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Almost done! Let&apos;s get your free valuation.</h3>
            <p className="text-gray-600 mb-4">100% Confidential - No obligation</p>
            
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
                required
              />
            </div>
            
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
              required
            />
            
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handlePhoneChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
              required
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary hover:bg-accent text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Processing...
                </>
              ) : (
                'Get My Free Business Valuation'
              )}
            </button>
          </form>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      {renderStep()}

      {/* Navigation */}
      {step > 1 && step < 5 && (
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 text-gray-600 hover:text-primary transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  );
}