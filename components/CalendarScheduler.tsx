'use client';

import React, { useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface CalendarSchedulerProps {
  calendlyUrl?: string;
  onSchedule?: () => void;
}

export default function CalendarScheduler({ 
  calendlyUrl = 'https://calendly.com/your-business-acquisition-team/consultation',
  onSchedule 
}: CalendarSchedulerProps) {
  useEffect(() => {
    // Load Calendly widget script if using Calendly
    if (calendlyUrl && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [calendlyUrl]);

  const handleScheduleClick = () => {
    if (onSchedule) {
      onSchedule();
    }

    // If using Calendly
    if (calendlyUrl && typeof window !== 'undefined' && window.Calendly) {
      window.Calendly.initPopupWidget({
        url: calendlyUrl,
        text: 'Schedule Your Consultation',
        color: '#5b5a99',
        textColor: '#ffffff',
        branding: false
      });
    } else {
      // Fallback: open calendar link in new tab
      window.open(calendlyUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-lg text-center">
      <Calendar className="h-16 w-16 text-primary mx-auto mb-4" />
      <h3 className="text-2xl font-semibold mb-4">Ready to Schedule Your Consultation?</h3>
      <p className="text-gray-600 mb-6">
        Pick a time that works best for you. Our M&A specialists are available for confidential discussions.
      </p>
      
      <button
        onClick={handleScheduleClick}
        className="inline-flex items-center justify-center space-x-2 bg-secondary hover:bg-accent text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg"
      >
        <Calendar className="h-5 w-5" />
        <span>Schedule My Free Consultation</span>
      </button>

      <p className="text-sm text-gray-500 mt-4">
        Average consultation time: 30-45 minutes
      </p>

      {/* Alternative: Embed Calendly inline */}
      {/* 
      <div 
        className="calendly-inline-widget" 
        data-url={calendlyUrl}
        style={{ minWidth: '320px', height: '630px' }}
      />
      */}
    </div>
  );
}

// TypeScript declaration for Calendly
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: {
        url: string;
        text?: string;
        color?: string;
        textColor?: string;
        branding?: boolean;
      }) => void;
    };
  }
}