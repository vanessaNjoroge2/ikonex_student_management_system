import React from 'react';
import { Navbar } from './landing/Navbar';
import { HeroSection } from './landing/HeroSection';
import { StatsSection } from './landing/StatsSection';
import { TrustSection } from './landing/TrustSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { HowItWorksSection } from './landing/HowItWorksSection';
import { TestimonialSection } from './landing/TestimonialSection';
import { CTASection } from './landing/CTASection';
import { PricingSection } from './landing/PricingSection';
import { FAQSection } from './landing/FAQSection';
import { Footer } from './landing/Footer';

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-900 font-sans antialiased">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <TrustSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialSection />
      <CTASection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
