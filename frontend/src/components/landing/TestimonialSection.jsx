import React from 'react';
import { CONTENT } from '../../constants/content';

export function TestimonialSection() {
  const { testimonial } = CONTENT;

  return (
    <section className="canva-section w-full py-20 bg-purple-50/40 border-y border-purple-100/40">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-5 gap-10 items-center">
        <div className="md:col-span-2 flex justify-center">
          <img
            src={testimonial.photo}
            alt={testimonial.name}
            className="canva-image w-56 h-56 md:w-64 md:h-64 rounded-2xl object-cover shadow-xl border-4 border-white"
            loading="lazy"
          />
        </div>
        <div className="md:col-span-3 text-left">
          {/* Custom Quote SVG */}
          <svg
            className="w-10 h-10 text-purple-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M11 7H7a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h1a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4H4m16-14h-4a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h1a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4h-1" />
          </svg>
          <blockquote className="canva-text text-2xl md:text-3xl leading-snug mb-6 font-display font-semibold text-purple-955">
            "{testimonial.quote}"
          </blockquote>
          <p className="canva-text font-bold text-gray-900 font-sans">
            {testimonial.name}
          </p>
          <p className="canva-text text-sm text-purple-700 font-sans">
            {testimonial.role}
          </p>
        </div>
      </div>
    </section>
  );
}
