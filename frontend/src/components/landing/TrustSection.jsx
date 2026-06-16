import React from 'react';
import { CONTENT } from '../../constants/content';

export function TrustSection() {
  const { trust } = CONTENT;
  
  // Combine schools twice to ensure a seamless infinite scroll loop
  const tickerItems = [...trust.schools, ...trust.schools, ...trust.schools];

  return (
    <section className="canva-section w-full py-8 border-y border-gray-200 bg-white">
      <p className="canva-text text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">
        {trust.heading}
      </p>
      <div className="overflow-hidden relative max-w-5xl mx-auto px-6">
        <div className="trust-scroll flex items-center gap-16 whitespace-nowrap w-max">
          {tickerItems.map((school, idx) => (
            <span
              key={idx}
              className="canva-text font-display text-lg font-bold text-purple-900/60 hover:text-purple-900 transition duration-300"
            >
              {school}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
