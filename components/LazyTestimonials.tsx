'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Testimonials = dynamic(() => import('./Testimonials'), {
  loading: () => <div className="min-h-[400px] bg-gray-100 animate-pulse" />,
  ssr: false,
});

export default function LazyTestimonials() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const element = document.getElementById('testimonials-trigger');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div id="testimonials-trigger">
      {shouldLoad ? <Testimonials /> : <div className="min-h-[400px]" />}
    </div>
  );
}