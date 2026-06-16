import React from 'react';
import * as Icons from 'lucide-react';
import { CONTENT } from '../../constants/content';

export function FeaturesSection() {
  const { features } = CONTENT;

  return (
    <section id="features" className="w-full max-w-7xl mx-auto px-6 py-20 bg-white">
      <div className="text-center mb-14">
        <h2 className="canva-text font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {features.heading}
        </h2>
        <p className="canva-text text-lg text-gray-600 max-w-2xl mx-auto">
          {features.subheading}
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.cards.map((card, idx) => {
          // Dynamically resolve the Lucide icon component
          const IconComponent = Icons[card.icon] || Icons.HelpCircle;

          return (
            <div
              key={idx}
              className="canva-card rounded-2xl p-6 border border-gray-100 bg-white transition hover:shadow-lg hover:-translate-y-1 duration-300 flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 shrink-0 shadow-sm shadow-purple-100">
                <IconComponent className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="canva-text font-bold text-lg text-gray-900 mb-2 font-sans">
                {card.title}
              </h3>
              <p className="canva-text text-sm text-gray-500 leading-relaxed font-sans">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
