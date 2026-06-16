// REFINED: pricing-section-4 — humanization + KES prices
"use client";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Single School",
    description:
      "Perfect for individual schools looking to automate administrative and scoring tasks.",
    price: 1500,
    yearlyPrice: 14400,
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    includes: [
      "Up to 500 Students",
      "Standard Report Cards",
      "Academic Stream Allocation",
      "Secure Student Registration",
    ],
  },
  {
    name: "Multi-Branch",
    description:
      "Best for school networks or multi-campus academies needing cross-branch visibility.",
    price: 6000,
    yearlyPrice: 57600,
    buttonText: "Get Started",
    buttonVariant: "default" as const,
    popular: true,
    includes: [
      "Unlimited Students",
      "Custom Branding & Templates",
      "Branch-Level Analytics",
      "24/7 Dedicated Support",
    ],
  },
  {
    name: "District-Wide",
    description:
      "For complete education systems, county-level, or district-wide management.",
    price: 12000,
    yearlyPrice: 115200,
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    includes: [
      "Regional Data Aggregation",
      "API Access for Gov Systems",
      "White-Label Portal",
      "Enterprise SLA & Custom Templates",
    ],
  },
];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return (
    <div className="py-24 bg-gradient-to-b from-[#F5F4FF] via-white to-[#F5F4FF] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(79,70,229,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(79,70,229,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      <div className="absolute top-1/4 left-[-10%] w-[50vw] h-[50vw] bg-purple-200/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-[-10%] w-[45vw] h-[45vw] bg-purple-200/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#7e22ce] px-[12px] py-[4px] rounded-full text-xs font-semibold mb-4 mx-auto">
            Pricing Plans
          </div>
          <h2 className="text-[40px] font-extrabold text-[#1E1B4B] hero-display-font text-center mb-6 leading-tight">
            Simple Pricing for Every School
          </h2>
          <p className="text-gray-500 text-base sm:text-lg text-center max-w-2xl mx-auto mb-10 leading-[1.7]">
            Trusted by schools across Kenya. No hidden fees.
          </p>

          {/* Switch */}
          <div className="flex justify-center">
            <div className="relative flex items-center bg-purple-100/60 border border-purple-200/50 p-1.5 rounded-full w-fit">
              <button
                onClick={() => setIsYearly(false)}
                className={`relative z-10 px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                  !isYearly ? "text-white bg-[#7e22ce] shadow-md shadow-purple-600/10" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`relative z-10 px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                  isYearly ? "text-white bg-[#7e22ce] shadow-md shadow-purple-600/10" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Yearly</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                  isYearly ? "bg-white text-[#7e22ce]" : "bg-purple-200/50 text-[#7e22ce]"
                }`}>
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => {
            const isPopular = plan.popular;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : index * 0.1, ease: "easeOut" }}
                className={`bg-white border rounded-2xl p-8 flex flex-col justify-between relative transition-all duration-300 hover:shadow-xl ${
                  isPopular
                    ? "border-[#7e22ce] ring-4 ring-[#7e22ce]/5 shadow-lg shadow-purple-600/5 hover:border-purple-500"
                    : "border-purple-100 hover:border-purple-200"
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7e22ce] text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}

                {/* Card Top */}
                <div className="text-left">
                  <h3 className="text-xl font-extrabold text-[#1E1B4B] mb-2 font-sans">{plan.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed min-h-[48px] mb-6 font-sans">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline mb-6 font-sans">
                    <span className="text-3xl font-extrabold text-[#1E1B4B]">
                      KES{" "}
                      <NumberFlow
                        format={{
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }}
                        value={isYearly ? plan.yearlyPrice : plan.price}
                        className="text-3xl font-extrabold"
                      />
                    </span>
                    <span className="text-gray-400 text-xs ml-1 font-bold uppercase">
                      /{isYearly ? "year" : "mo"}
                    </span>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <p className="text-xs font-extrabold text-[#1E1B4B] uppercase tracking-wider font-sans">
                      Features Included:
                    </p>
                    <ul className="space-y-3.5 list-none p-0">
                      {plan.includes.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2.5 text-left text-xs text-gray-600 font-sans">
                          <Check className="h-4.5 w-4.5 text-[#7e22ce] stroke-[2.5] flex-shrink-0 mt-0.5" />
                          <span className="leading-normal">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div className="mt-8 pt-4">
                  {isPopular ? (
                    <button
                      className="w-full bg-[#7e22ce] hover:bg-[#3B82F6] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 text-sm shadow-md shadow-purple-600/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer font-sans"
                    >
                      {plan.buttonText}
                    </button>
                  ) : (
                    <button
                      className="w-full bg-white border-2 border-purple-100 text-[#7e22ce] hover:border-purple-300 hover:bg-purple-50/5 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 text-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer font-sans"
                    >
                      {plan.buttonText}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
