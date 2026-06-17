import React, { useState } from 'react';
import { Link } from '../Router';
import { CONTENT } from '../../constants/content';

export function Footer() {
  const [email, setEmail] = useState('');
  const [placeholder, setPlaceholder] = useState('Enter your email');
  const { brandName, footer } = CONTENT;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setEmail('');
      setPlaceholder('Subscribed! ✓');
      setTimeout(() => setPlaceholder('Enter your email'), 3000);
    }
  };

  return (
    <footer className="canva-footer w-full bg-slate-50 py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-left">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">iK</span>
            </div>
            <span className="font-bold text-lg text-gray-900">{brandName}</span>
          </div>
          <p className="canva-text text-sm text-gray-500 leading-relaxed font-sans">
            {footer.desc}
          </p>
        </div>
        <div>
          <h4 className="canva-text font-bold text-gray-900 mb-4 text-sm font-sans uppercase tracking-wider">
            {footer.col2Title}
          </h4>
          <ul className="space-y-2.5 p-0 list-none">
            <li>
              <a href="#features" className="canva-text text-sm text-gray-600 hover:text-purple-600 no-underline font-sans transition-colors">
                {footer.link1}
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="canva-text text-sm text-gray-600 hover:text-purple-600 no-underline font-sans transition-colors">
                {footer.link2}
              </a>
            </li>
            <li>
              <a href="#pricing" className="canva-text text-sm text-gray-600 hover:text-purple-600 no-underline font-sans transition-colors">
                {footer.link3}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="canva-text font-bold text-gray-900 mb-4 text-sm font-sans uppercase tracking-wider">
            {footer.col3Title}
          </h4>
          <ul className="space-y-2.5 p-0 list-none">
            <li>
              <a href="#contact" className="canva-text text-sm text-gray-600 hover:text-purple-600 no-underline font-sans transition-colors">
                {footer.link6}
              </a>
            </li>
            <li>
              <a href="#privacy" className="canva-text text-sm text-gray-600 hover:text-purple-600 no-underline font-sans transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#terms" className="canva-text text-sm text-gray-600 hover:text-purple-600 no-underline font-sans transition-colors">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="canva-text font-bold text-gray-900 mb-4 text-sm font-sans uppercase tracking-wider">
            {footer.newsletterTitle}
          </h4>
          <p className="canva-text text-sm text-gray-500 mb-4 font-sans">
            {footer.newsletterDesc}
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="canva-input flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-purple-600 bg-white text-gray-900 font-sans"
              required
            />
            <button
              type="submit"
              className="canva-button px-5 py-2 rounded-full text-sm font-medium bg-purple-600 text-white transition hover:opacity-90 font-sans"
            >
              {footer.newsletterBtn}
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="canva-text text-sm text-gray-500 font-sans">
          {footer.copy}
        </p>
        <p className="canva-text text-sm text-gray-500 font-sans font-medium">
          {footer.tagline}
        </p>
      </div>
    </footer>
  );
}
