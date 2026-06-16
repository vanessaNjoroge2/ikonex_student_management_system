import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from '../Router';
import { CONTENT } from '../../constants/content';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { brandName, nav } = CONTENT;

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 no-underline text-gray-900">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">iK</span>
          </div>
          <span className="font-bold text-lg text-gray-900">{brandName}</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {nav.links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-purple-600 transition no-underline"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <Link
          to="/login"
          className="hidden md:inline-flex bg-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition hover:opacity-90 no-underline shadow-sm hover:shadow"
        >
          {nav.cta}
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-1 text-gray-600 hover:text-purple-600 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 flex flex-col gap-4 animate-fadeIn">
          {nav.links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-gray-600 hover:text-purple-600 transition no-underline py-1.5 border-b border-gray-50"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="w-full text-center bg-purple-600 text-white py-2.5 rounded-full text-sm font-medium transition hover:opacity-90 no-underline block"
          >
            {nav.cta}
          </Link>
        </div>
      )}
    </nav>
  );
}
