import React from 'react';
import { CONTENT } from '../../constants/content';

export function StatsSection() {
  const { stats } = CONTENT;

  return (
    <section className="canva-section w-full py-12 bg-purple-50/50">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <p className="canva-text font-display text-3xl md:text-4xl font-bold text-purple-900">
              {stat.number}
            </p>
            <p className="canva-text text-sm font-medium text-purple-700 mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
