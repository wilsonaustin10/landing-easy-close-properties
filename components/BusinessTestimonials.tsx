'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Michael Chen",
    location: "Restaurant Owner, San Francisco",
    text: "After 30 years running my restaurant, I was ready to retire. They gave me a fair valuation and kept all my staff employed. The whole process took just 3 weeks!",
    rating: 5
  },
  {
    name: "Jennifer Adams",
    location: "Manufacturing CEO, Detroit",
    text: "Health issues forced me to sell quickly. They understood my urgency, maintained complete confidentiality, and closed in 15 days. No brokers, no drama.",
    rating: 5
  },
  {
    name: "David Martinez",
    location: "Auto Shop Owner, Phoenix",
    text: "I was burned out after 20 years. They valued my business fairly, including all equipment and customer base. Now I'm enjoying retirement while my shop continues to thrive.",
    rating: 5
  }
];

export default function BusinessTestimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">
          What Our Clients Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg transition-transform hover:scale-105 border-b-4 border-primary"
            >
              <div className="flex items-center mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-primary">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i}
                      className="h-5 w-5 text-secondary fill-current"
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}