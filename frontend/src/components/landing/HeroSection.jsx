import React from 'react';
import { Link } from '../Router';
import { CONTENT } from '../../constants/content';

export function HeroSection() {
  const { hero } = CONTENT;

  return (
    <header className="w-full max-w-7xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="text-left">
          <span className="canva-tag inline-block text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 mb-4 px-3.5 py-1.5 rounded-full">
            {hero.tag}
          </span>
          <h1 className="canva-text font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
            {hero.title}
          </h1>
          <p className="canva-text text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
            {hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="canva-button bg-purple-600 hover:bg-purple-700 text-white px-7 py-3.5 rounded-full font-medium text-base transition hover:opacity-90 shadow-lg shadow-purple-200 no-underline"
            >
              {hero.ctaPrimary}
            </Link>
            <a
              href="#pricing"
              className="canva-button border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-7 py-3.5 rounded-full font-medium text-base transition hover:opacity-90 no-underline text-center"
            >
              {hero.ctaSecondary}
            </a>
          </div>
        </div>
        <div className="relative">
          <img
            src={hero.mainImage}
            alt="Kenyan Classroom Learning"
            className="canva-image w-full h-auto rounded-2xl shadow-2xl object-cover aspect-[4/3]"
            loading="lazy"
          />
          <div className="absolute -bottom-6 -left-6 w-2/3 rounded-xl shadow-xl overflow-hidden border-4 border-white">
            <img
              src={hero.mockupImage}
              alt="Ikonex Academy App Dashboard UI Mockup"
              className="canva-image w-full h-auto object-cover aspect-[4/3]"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
