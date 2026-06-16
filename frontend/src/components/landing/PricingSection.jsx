import React from 'react';
import { Check } from 'lucide-react';
import { Link } from '../Router';
import { CONTENT } from '../../constants/content';

export function PricingSection() {
  const { pricing } = CONTENT;

  return (
    <section id="pricing" className="w-full bg-slate-50 py-20">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="canva-text font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {pricing.heading}
          </h2>
          <p className="canva-text text-lg text-gray-600">
            {pricing.subheading}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
            {pricing.tiers.map((tier, idx) => {
              const isHighlighted = idx === 1; // Middle tier

              return (
                <div
                  key={tier.id}
                  className={`canva-card rounded-2xl p-8 bg-white text-left flex flex-col justify-between ${
                    isHighlighted
                      ? 'border-2 border-purple-600 shadow-xl relative pt-14'
                      : 'border border-gray-200'
                  }`}
                >
                  {isHighlighted && (
                    <span className="canva-tag absolute top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md uppercase tracking-wider">
                      {tier.badge}
                    </span>
                  )}
                  <div>
                    <h3 className="canva-text font-bold text-xl text-gray-900 mb-2 font-sans">
                      {tier.name}
                    </h3>
                    <p className="canva-text text-3xl font-extrabold text-purple-900 mb-1 font-display">
                      {tier.price}
                    </p>
                    <p className="canva-text text-sm text-gray-500 mb-6 font-sans">
                      {tier.period}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, fIdx) => (
                        <li
                          key={fIdx}
                          className="canva-text text-sm flex items-start gap-2 font-sans text-gray-600"
                        >
                          <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    to="/register"
                    className={`canva-button w-full py-3 rounded-full font-medium text-center transition hover:opacity-90 no-underline font-sans ${
                      isHighlighted
                        ? 'bg-purple-600 text-white shadow-md hover:shadow-lg'
                        : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    {tier.buttonText}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-center mt-10 max-w-xl mx-auto">
          <p className="canva-text text-base text-gray-500 font-sans leading-relaxed">
            {pricing.customText}
          </p>
        </div>
      </div>
    </section>
  );
}
