import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CONTENT } from '../../constants/content';

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);
  const { faq } = CONTENT;

  const handleToggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full max-w-3xl mx-auto px-6 py-20 bg-white">
      <div className="text-center mb-14">
        <h2 className="canva-text font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {faq.heading}
        </h2>
        <p className="canva-text text-lg text-gray-600">
          {faq.subheading}
        </p>
      </div>
      <div className="space-y-4" id="faq-list">
        {faq.items.map((item, idx) => {
          const isOpen = openIdx === idx;

          return (
            <div
              key={idx}
              onClick={() => handleToggle(idx)}
              className={`faq-item border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-purple-200 transition-colors ${
                isOpen ? 'open bg-purple-50/10 border-purple-100' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="canva-text font-medium text-gray-900 text-left font-sans select-none">
                  {item.q}
                </h3>
                <ChevronDown
                  className={`faq-chevron w-5 h-5 text-gray-400 shrink-0 ${
                    isOpen ? 'transform rotate-180 text-purple-600' : ''
                  }`}
                />
              </div>
              <div className="faq-answer text-left">
                <p className="canva-text text-sm text-gray-500 pt-3 leading-relaxed font-sans select-none">
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
