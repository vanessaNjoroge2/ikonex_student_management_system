import React from 'react';
import { Link } from '../Router';
import { CONTENT } from '../../constants/content';

export function CTASection() {
  const { ctaBlock } = CONTENT;

  return (
    <section id="contact" className="w-full py-20 px-6 bg-white">
      <div className="canva-section max-w-4xl mx-auto text-center rounded-3xl p-12 md:p-16 bg-gradient-to-br from-purple-700 to-purple-900 text-white shadow-xl relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="canva-text font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 max-w-2xl mx-auto leading-tight">
            {ctaBlock.heading}
          </h2>
          <p className="canva-text text-lg text-purple-100 mb-8 max-w-xl mx-auto leading-relaxed">
            {ctaBlock.subtext}
          </p>
          <Link
            to="/register"
            className="canva-button inline-block px-8 py-4 bg-white text-purple-700 rounded-full font-medium text-lg transition hover:opacity-90 shadow-lg hover:scale-[1.02] active:scale-[0.98] duration-300 no-underline"
          >
            {ctaBlock.buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
