import React from 'react';
import { CONTENT } from '../../constants/content';

export function HowItWorksSection() {
  const { howItWorks } = CONTENT;

  return (
    <section id="how-it-works" className="w-full bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="canva-text font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {howItWorks.heading}
          </h2>
          <p className="canva-text text-lg text-gray-600 max-w-2xl mx-auto">
            {howItWorks.subheading}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-left">
            {howItWorks.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-purple-700 font-bold">{idx + 1}</span>
                </div>
                <div>
                  <h3 className="canva-text font-bold text-gray-900 mb-1 font-sans">
                    {step.title}
                  </h3>
                  <p className="canva-text text-sm text-gray-500 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <img
              src={howItWorks.image}
              alt="Kenyan Teachers Compiling Grades on Ikonex Portal"
              className="canva-image w-full rounded-2xl shadow-xl object-cover aspect-[4/3]"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
