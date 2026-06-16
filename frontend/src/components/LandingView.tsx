// HUMANIZED: LandingView — grid removed, editorial contrast, human copy
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import CountUp from 'react-countup';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { 
  GraduationCap, Users, Waves, FileSpreadsheet, ArrowRight, 
  CheckCircle, Award, FileText, Menu, X, BookOpen, Layers,
  ChevronRight, Calendar, BarChart3, Clock, Check, TrendingUp, ShieldAlert, Zap,
  Play, DollarSign, UserCheck, Twitter, Linkedin, Github
} from 'lucide-react';
import { Link } from './Router';

import 'swiper/css';
import 'swiper/css/pagination';

import ScrollVelocity from './ui/ScrollVelocity';
import LogoLoop from './ui/LogoLoop';
import PricingSection from './ui/pricing-section-4';
import { SiGoogle } from 'react-icons/si';
import { FaMicrosoft, FaAws } from 'react-icons/fa';

const GoogleIcon = SiGoogle as any;
const MicrosoftIcon = FaMicrosoft as any;
const AwsIcon = FaAws as any;

const partnerLogos = [
  { node: <div className="flex items-center gap-2 text-on-surface-variant/75 font-semibold"><GoogleIcon className="w-5 h-5 text-[#4285F4]" /> <span>Google Cloud</span></div>, title: "Google Cloud" },
  { node: <div className="flex items-center gap-2 text-on-surface-variant/75 font-semibold"><MicrosoftIcon className="w-5 h-5 text-[#F25022]" /> <span>Microsoft Education</span></div>, title: "Microsoft Education" },
  { node: <div className="flex items-center gap-2 text-on-surface-variant/75 font-semibold"><AwsIcon className="w-5 h-5 text-[#FF9900]" /> <span>AWS Educate</span></div>, title: "AWS Educate" },
  { node: <div className="text-on-surface-variant/75 font-semibold">Alliance High School</div>, title: "Alliance High" },
  { node: <div className="text-on-surface-variant/75 font-semibold">Loreto Limuru</div>, title: "Loreto Limuru" },
  { node: <div className="text-on-surface-variant/75 font-semibold">Hillcrest International</div>, title: "Hillcrest" },
  { node: <div className="text-on-surface-variant/75 font-semibold">Strathmore Academy</div>, title: "Strathmore" },
];

const ikonexTestimonials = [
  {
    quote: "Since switching to Ikonex, our end-of-term reporting takes hours instead of weeks. It's transformed how we run our school.",
    author: "Sister Mary Claire — Principal, St. Scholastica Academy",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
    alt: "Sister Mary Claire"
  },
  {
    quote: "Entering grades is so straightforward now. The system validator catches maximum marks errors instantly, preventing compilation recalculations.",
    author: "Joseph Kuria — Mathematics Teacher, Alliance High",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200",
    alt: "Joseph Kuria"
  },
  {
    quote: "Managing streams and registering student transfers is extremely easy. The interface is clean and doesn't require technical expertise.",
    author: "Florence Mutua — Academic Registrar, Loreto Limuru",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200",
    alt: "Florence Mutua"
  }
];

export default function LandingView() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // States and simulations for interactive mockup
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'students' | 'grades' | 'reports'>('overview');
  const [compiling, setCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileLog, setCompileLog] = useState<string>('System Idle');
  const [compileCompleted, setCompileCompleted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [currentTestimonialIdx, setCurrentTestimonialIdx] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const handleStartCompile = () => {
    if (compiling) return;
    setCompiling(true);
    setCompileProgress(0);
    setCompileCompleted(false);
    setCompileLog('Initializing compiler...');
    
    const steps = [
      { progress: 15, log: 'Loading Form 1-4 streams (24 streams)...' },
      { progress: 35, log: 'Validating subject thresholds & grades...' },
      { progress: 60, log: 'Calculating student rankings & mean scores...' },
      { progress: 85, log: 'Rendering print-ready PDF layouts...' },
      { progress: 100, log: 'Success! 124 Report Cards compiled' }
    ];
    
    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        const step = steps[stepIdx];
        setCompileProgress(step.progress);
        setCompileLog(step.log);
        stepIdx++;
      } else {
        clearInterval(interval);
        setCompiling(false);
        setCompileCompleted(true);
      }
    }, 800);
  };

  // Monitor scroll for navbar transitions
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Animations useEffect
  useEffect(() => {
    const gsapInstance = (window as any).gsap;
    const ScrollTriggerInstance = (window as any).ScrollTrigger;
    if (gsapInstance && ScrollTriggerInstance) {
      gsapInstance.registerPlugin(ScrollTriggerInstance);

      // Header slide-in (keep existing)
      gsapInstance.from('header', { y: -100, opacity: 0, duration: 1, ease: "power3.out" });

      // Hero content — staggered rise
      gsapInstance.from('.hero-content > *', {
        y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power2.out", delay: 0.2
      });

      // Hero floaters — pop in after hero content
      gsapInstance.from('.hero-floater', {
        scale: 0.85, opacity: 0, duration: 0.6, stagger: 0.2, ease: "back.out(1.4)", delay: 0.8
      });

      // All card-hover elements — rise on scroll (keep existing logic)
      gsapInstance.utils.toArray('.card-hover').forEach((card: any) => {
        gsapInstance.from(card, {
          scrollTrigger: { trigger: card, start: "top bottom-=80px", toggleActions: "play none none none" },
          y: 40, opacity: 0, duration: 0.7, ease: "power2.out"
        });
      });

      // Section headings — fade up
      gsapInstance.utils.toArray('section h3, section h2').forEach((el: any) => {
        gsapInstance.from(el, {
          scrollTrigger: { trigger: el, start: "top bottom-=60px", toggleActions: "play none none none" },
          y: 20, opacity: 0, duration: 0.6, ease: "power2.out"
        });
      });
    }
  }, []);

  return (
    <div 
      className="min-h-screen text-on-surface bg-background antialiased relative overflow-hidden" 
      style={{ 
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .display-font {
          font-family: 'Clash Display', 'Satoshi', sans-serif;
        }
        .hero-display-font {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .body-font {
          font-family: 'Inter', sans-serif;
        }
        .bento-glow:hover {
          box-shadow: 0 0 30px rgba(53, 37, 205, 0.08);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>

      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] bg-gradient-to-br from-purple-200/20 to-transparent rounded-full pointer-events-none gradient-blob -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50vw] h-[50vw] max-w-[700px] bg-gradient-to-tl from-purple-200/20 to-transparent rounded-full pointer-events-none gradient-blob -z-10" />

      {/* STICKY NAVBAR */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center ${
          scrolled 
            ? 'h-[70px] bg-white/90 backdrop-blur-md shadow-md shadow-slate-900/5 border-b border-slate-100' 
            : 'h-[80px] border-b border-transparent'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <span className="text-[#9333ea] flex items-center justify-center">
              <GraduationCap className="w-8 h-8 stroke-[2.5]" />
            </span>
            <span className="text-xl font-extrabold tracking-tight display-font text-[#0f172a]">Ikonex Academy</span>
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            <li><a href="#features" className="text-sm font-semibold text-[#64748b] hover:text-[#9333ea] transition-colors no-underline">Features</a></li>
            <li><a href="#how-it-works" className="text-sm font-semibold text-[#64748b] hover:text-[#9333ea] transition-colors no-underline">How It Works</a></li>
            <li><a href="#modules" className="text-sm font-semibold text-[#64748b] hover:text-[#9333ea] transition-colors no-underline">Modules</a></li>
            <li><a href="#analytics" className="text-sm font-semibold text-[#64748b] hover:text-[#9333ea] transition-colors no-underline">Analytics</a></li>
            <li><a href="#contact" className="text-sm font-semibold text-[#64748b] hover:text-[#9333ea] transition-colors no-underline">Contact</a></li>
          </ul>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-[#64748b] hover:text-[#9333ea] transition-colors no-underline px-3 py-2">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-[#9333ea] hover:bg-[#7e22ce] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-purple-600/10"
            >
              Get Started
            </Link>
          </div>

          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1 text-[#0f172a] focus:outline-none"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu drop */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed top-[70px] left-0 right-0 bottom-0 bg-[#F8F7F4] flex flex-col p-6 gap-6 md:hidden shadow-xl"
            >
              <a href="#features" onClick={() => setMenuOpen(false)} className="text-base font-bold text-[#0f172a] border-b border-[#e2e8f0] pb-3 no-underline">Features</a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-base font-bold text-[#0f172a] border-b border-[#e2e8f0] pb-3 no-underline">How It Works</a>
              <a href="#modules" onClick={() => setMenuOpen(false)} className="text-base font-bold text-[#0f172a] border-b border-[#e2e8f0] pb-3 no-underline">Modules</a>
              <a href="#analytics" onClick={() => setMenuOpen(false)} className="text-base font-bold text-[#0f172a] border-b border-[#e2e8f0] pb-3 no-underline">Analytics</a>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="text-base font-bold text-[#0f172a] border-b border-[#e2e8f0] pb-3 no-underline">Contact</a>
              <div className="flex flex-col gap-3 mt-6">
                <Link to="/login" className="w-full text-center border border-[#0f172a] text-[#0f172a] font-bold py-3 rounded-xl no-underline">
                  Sign In
                </Link>
                <Link to="/register" className="w-full text-center bg-[#9333ea] text-white font-bold py-3 rounded-xl no-underline">
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* 1 — HERO SECTION */}
      <section className="pt-36 pb-24 relative overflow-hidden bg-[#F5F4FF]">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-[40vw] h-[40vw] bg-purple-300/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-1/4 w-[35vw] h-[35vw] bg-purple-300/20 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          
          {/* Left Column (Text & CTAs): 7 cols on desktop */}
          <div className="w-full lg:col-span-7 flex flex-col items-start text-left">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 bg-[#EEF2FF] border border-purple-100 px-3 py-1 rounded-full text-[#7e22ce] text-xs font-semibold uppercase mb-6 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Institutional Grade SMS</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.1, ease: "easeOut" }}
              className="hero-display-font text-5xl sm:text-6xl lg:text-[56px] font-extrabold text-[#1E1B4B] tracking-tight leading-[1.1] mb-6"
            >
              <span className="font-extrabold tracking-tight">Modern Management</span>
              <br />
              <span className="font-light italic text-[#7e22ce]" 
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.01em' }}>
                for Modern Schools
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
              className="text-gray-600 text-base sm:text-lg lg:text-xl font-medium leading-relaxed max-w-2xl mb-8"
            >
              Bring student tracking, exam scoring, stream management, and automated PDF report cards into one clean platform — built by educators, for educators.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10"
            >
              <Link 
                to="/register" 
                className="bg-[#7e22ce] hover:bg-[#3B82F6] text-white text-base font-bold px-8 py-4 rounded-xl text-center shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 no-underline font-sans"
              >
                <span>Get Started Free →</span>
              </Link>
              <a 
                href="#how-it-works"
                className="border border-[#1E1B4B] text-[#1E1B4B] hover:bg-[#1E1B4B]/5 text-base font-bold px-8 py-4 rounded-xl text-center flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 no-underline cursor-pointer font-sans"
              >
                <span>See How It Works</span>
              </a>
            </motion.div>

            {/* Stats strip */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
              className="w-full border-t border-purple-200/60 pt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#1E1B4B]/80 font-bold"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7e22ce]" />
                <span>500+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7e22ce]" />
                <span>24 Streams</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7e22ce]" />
                <span>98% Accuracy</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column (Visual Mockup): 5 cols on desktop */}
          <div className="w-full lg:col-span-5 flex justify-center">
            {/* Main browser mockup card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : 0.2, type: "spring", stiffness: 100, damping: 15 }}
              className="w-full max-w-[500px] bg-[#0B0F19] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-slate-200 font-sans flex flex-col aspect-[4/3] sm:aspect-auto sm:min-h-[420px] relative hover:border-purple-500/30 transition-colors duration-300"
            >
              {/* Browser bar */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                </div>
                <div className="bg-slate-900 text-[10px] text-slate-400 px-6 py-0.5 rounded-md flex items-center gap-1 border border-slate-800/50">
                  <span className="text-[#7e22ce] font-bold">ikonex.academy</span>
                  <span className="text-slate-600">/admin/portal</span>
                </div>
                <div className="w-10" />
              </div>

              {/* Inner Dashboard Layout */}
              <div className="flex flex-1 overflow-hidden min-h-0">
                {/* Sidebar */}
                <div className="w-[80px] sm:w-[130px] bg-slate-950/70 border-r border-slate-900 p-2 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 px-2 py-1.5 mb-2 text-white font-bold text-xs">
                    <span className="w-5 h-5 rounded-md bg-[#7e22ce] flex items-center justify-center text-xs">I</span>
                    <span className="hidden sm:inline text-[11px] tracking-tight">IKONEX</span>
                  </div>
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'students', label: 'Students', icon: Users },
                    { id: 'grades', label: 'Grades Entry', icon: FileSpreadsheet },
                    { id: 'reports', label: 'PDF Reports', icon: FileText }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = dashboardTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setDashboardTab(item.id as any)}
                        className={`flex items-center justify-center sm:justify-start gap-2.5 px-2 py-2 rounded-lg transition-all text-xs font-semibold ${
                          isActive 
                            ? 'bg-[#7e22ce] text-white shadow-md shadow-purple-600/10' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline text-[11px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Dashboard Main Content Panel */}
                <div className="flex-1 bg-slate-900/40 p-3 sm:p-4 overflow-y-auto flex flex-col gap-3 min-h-0">
                  {/* Content Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/50">
                    <div>
                      <h4 className="text-xs font-bold text-white capitalize">{dashboardTab}</h4>
                      <p className="text-[9px] text-slate-500">Ikonex SMS Portal</p>
                    </div>
                    <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold uppercase tracking-wider">
                      2026 Term 2
                    </span>
                  </div>

                  {/* Tab Rendering */}
                  {dashboardTab === 'overview' && (
                    <div className="flex flex-col gap-3 animate-fadeIn">
                      {/* Mini Stats Widgets */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-xl flex flex-col">
                          <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Total Enrolled</span>
                          <span className="text-sm font-extrabold text-white mt-0.5 font-sans">524 Students</span>
                          <span className="text-[8px] text-[#10B981] mt-0.5 flex items-center gap-0.5 font-bold">
                            <TrendingUp className="w-2.5 h-2.5" /> +12% vs last term
                          </span>
                        </div>
                        <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-xl flex flex-col">
                          <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Class Streams</span>
                          <span className="text-sm font-extrabold text-white mt-0.5 font-sans">24 Streams</span>
                          <span className="text-[8px] text-purple-400 mt-0.5 font-bold">
                            Form 1A - Form 4D
                          </span>
                        </div>
                      </div>

                      {/* SVG Bar Chart Card */}
                      <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] text-slate-400 font-bold">Performance Breakdown</span>
                          <span className="text-[8px] text-slate-500">Mean: 74.2%</span>
                        </div>
                        {/* Mock SVG Chart */}
                        <div className="h-16 flex items-end justify-between px-2 pt-2 gap-1.5">
                          {[
                            { name: 'F1', val: 78, color: '#7e22ce' },
                            { name: 'F2', val: 62, color: '#7e22ce' },
                            { name: 'F3', val: 74, color: '#7C3AED' },
                            { name: 'F4', val: 88, color: '#7C3AED' }
                          ].map((bar, idx) => (
                            <div key={idx} className="flex flex-col items-center flex-1 gap-1.5">
                              <div className="w-full bg-slate-800/50 rounded-t-sm h-12 relative flex items-end">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${bar.val}%` }}
                                  transition={{ duration: prefersReducedMotion ? 0 : 1, delay: prefersReducedMotion ? 0 : 0.1 * idx }}
                                  className="w-full rounded-t-sm"
                                  style={{ backgroundColor: bar.color }}
                                />
                              </div>
                              <span className="text-[8px] text-slate-500 font-bold">{bar.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {dashboardTab === 'students' && (
                    <div className="flex flex-col gap-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-slate-400 font-bold">Class Stream List</span>
                        <span className="text-[8px] text-slate-500">3 Active Streams selected</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {[
                          { name: 'Vanessa Njoroge', stream: 'Form 4 East', adm: '4887', status: 'Active' },
                          { name: 'Kamau Mwangi', stream: 'Form 3 West', adm: '5012', status: 'Active' },
                          { name: 'Amina Omondi', stream: 'Form 4 East', adm: '4902', status: 'Active' }
                        ].map((student, idx) => (
                          <div 
                            key={idx} 
                            className="bg-slate-950/30 border border-slate-800/50 px-2.5 py-2 rounded-lg flex items-center justify-between text-[10px] hover:border-slate-700 transition"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-200">{student.name}</span>
                              <span className="text-[8px] text-slate-500">ADM {student.adm} · {student.stream}</span>
                            </div>
                            <span className="text-[8px] text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded font-bold">
                              {student.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dashboardTab === 'grades' && (
                    <div className="flex flex-col gap-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-slate-400 font-bold">Marksheet Input</span>
                        <span className="text-[8px] text-[#10B981] font-bold">All calculations live</span>
                      </div>
                      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="bg-slate-950 text-[8px] uppercase tracking-wider text-slate-400 border-b border-slate-800/60">
                              <th className="p-1.5 font-bold">Student</th>
                              <th className="p-1.5 font-bold">Stream</th>
                              <th className="p-1.5 font-bold text-center">Score</th>
                              <th className="p-1.5 font-bold text-center">Grade</th>
                              <th className="p-1.5 font-bold text-center">Rank</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { name: 'Vanessa Njoroge', stream: 'F4 East', score: '84.5%', grade: 'A', rank: '#1' },
                              { name: 'Amina Omondi', stream: 'F4 East', score: '75.1%', grade: 'B+', rank: '#12' },
                              { name: 'Kamau Mwangi', stream: 'F3 West', score: '78.2%', grade: 'A-', rank: '#5' }
                            ].map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/30 text-[9px] text-slate-300">
                                <td className="p-1.5 font-semibold text-white">{row.name}</td>
                                <td className="p-1.5 text-slate-400">{row.stream}</td>
                                <td className="p-1.5 text-center font-semibold text-slate-200">{row.score}</td>
                                <td className="p-1.5 text-center font-bold text-[#10B981]">{row.grade}</td>
                                <td className="p-1.5 text-center font-bold text-purple-400">{row.rank}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {dashboardTab === 'reports' && (
                    <div className="flex flex-col gap-2.5 animate-fadeIn">
                      <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl text-center space-y-2 flex flex-col justify-center items-center">
                        <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-white block">Automated Report Compiler</span>
                          <span className="text-[8px] text-slate-500">Auto-calculate totals, averages, grades & streams</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl space-y-2">
                        {/* Simulation Progress bar */}
                        {compiling || compileCompleted ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-bold">
                              <span className={compileCompleted ? "text-[#10B981]" : "text-slate-300 text-[8px]"}>
                                {compileLog}
                              </span>
                              <span className="text-slate-400">{compileProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-[#7e22ce] to-[#7C3AED] rounded-full"
                                style={{ width: `${compileProgress}%` }}
                              />
                            </div>
                            {compileCompleted && (
                              <button 
                                onClick={() => {
                                  setCompileCompleted(false);
                                  setCompileProgress(0);
                                  setCompileLog('System Idle');
                                }}
                                className="w-full text-center text-[8px] font-bold text-[#10B981] hover:underline"
                              >
                                Reset Compiler
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={handleStartCompile}
                            className="w-full bg-[#7e22ce] hover:bg-[#3B82F6] text-white text-[10px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer font-sans"
                          >
                            <span>Compile Term 2 Reports</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating micro widgets to add depth */}
              {/* Floating widget 1: Validator Status */}
              <div className="absolute top-[28%] -left-8 bg-slate-950/90 border border-slate-800/90 rounded-xl px-2.5 py-2 shadow-2xl flex items-center gap-2 z-20 pointer-events-none hover:scale-105 transition-transform hidden sm:flex">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-extrabold text-white">Validator Active</span>
                  <span className="text-[7px] text-slate-500">98% Accuracy Assured</span>
                </div>
              </div>

              {/* Floating widget 2: Performance metrics */}
              <div className="absolute bottom-[20%] -right-8 bg-slate-950/90 border border-slate-800/90 rounded-xl px-2.5 py-2 shadow-2xl flex items-center gap-2 z-20 pointer-events-none hover:scale-105 transition-transform hidden sm:flex">
                <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-extrabold text-white">Mean Grade B+</span>
                  <span className="text-[7px] text-slate-500">Form 4 East Top Stream</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2 — STATS TICKER */}
      <section className="bg-primary text-white py-2 overflow-hidden border-y border-outline-variant relative z-10">
        <ScrollVelocity 
          texts={[
            "10,000+ students managed  ·  500+ schools trust us  ·  98% satisfaction  ·  500+ parent logins daily",
            "Real-time gradebook  ·  Automated PDF reports  ·  Stream allocations  ·  Exam performance matrices"
          ]}
          velocity={40}
          className="text-white font-semibold uppercase tracking-wider mx-2 text-2xl"
          parallaxClassName="py-1"
          scrollerClassName="flex gap-4 whitespace-nowrap"
        />
      </section>

      {/* 3 — FEATURES SECTION */}
      <section className="py-24 bg-white" id="features">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#7e22ce] px-[12px] py-[4px] rounded-full text-xs font-semibold mb-4">
              Platform Modules
            </div>
            <h3 className="text-[40px] font-extrabold text-[#1E1B4B] hero-display-font text-center mb-6 leading-tight">
              Everything You Need to Run a School
            </h3>
            <p className="text-gray-500 text-base sm:text-lg text-center max-w-2xl mx-auto leading-[1.7]">
              Six powerful modules working together in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Enrolment",
                desc: "Register & manage learners across streams",
                icon: Users,
              },
              {
                title: "Scoring",
                desc: "Record & validate exam and CA scores",
                icon: CheckCircle,
              },
              {
                title: "Processing",
                desc: "Rank & grade students automatically",
                icon: Zap,
              },
              {
                title: "Curriculum",
                desc: "Assign subjects to class streams",
                icon: BookOpen,
              },
              {
                title: "Reports",
                desc: "Generate individual PDF report cards",
                icon: FileText,
              },
              {
                title: "Streams",
                desc: "Manage Form 1A, 1B, 2A and more",
                icon: Layers,
              },
            ].map((module, idx) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : idx * 0.1, ease: "easeOut" }}
                  className="bg-white/80 backdrop-blur-sm shadow-[0_1px_8px_rgba(79,70,229,0.07)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.12)] hover:-translate-y-2 transition-all duration-500 p-[32px] rounded-[20px] flex flex-col items-start text-left border border-purple-50/60"
                >
                  <div className="bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] text-[#7e22ce] p-3 rounded-2xl mb-6 flex items-center justify-center w-12 h-12 shadow-sm shadow-purple-100">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h4 className="text-lg font-bold text-[#1E1B4B] mb-2 font-sans">{module.title}</h4>
                  <p className="text-sm text-gray-500 leading-[1.7] font-sans">{module.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 — PARTNERS STRIP */}
      <section className="py-10 bg-surface-container-low border-t border-outline-variant overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-6">
          <p className="text-center text-label-sm text-on-surface-variant uppercase tracking-widest mb-6 font-semibold">Trusted by Administrators & Integrated with Technology Leaders</p>
          <LogoLoop 
            logos={partnerLogos} 
            speed={40} 
            gap={48} 
            logoHeight={24}
            pauseOnHover={true}
            fadeOut={true}
            className="w-full"
          />
        </div>
      </section>

      {/* 5 — TESTIMONIALS SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#7e22ce] px-[12px] py-[4px] rounded-full text-xs font-semibold mb-4 mx-auto">
            Voices of Success
          </div>
          <h3 className="text-[40px] font-extrabold text-[#1E1B4B] hero-display-font text-center mb-16 leading-tight">
            Trusted by School Leaders Across Kenya
          </h3>
          
          {/* Testimonial Card */}
          <div className="w-full max-w-[720px] bg-white border border-purple-50/60 rounded-2xl p-8 sm:p-12 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            {/* Faint Quotation Mark Decoration in Background */}
            <span className="absolute text-[#EEF2FF] text-[200px] font-serif leading-none select-none pointer-events-none top-[-50px] left-8 z-0">“</span>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonialIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                className="flex flex-col items-center gap-8 relative z-10"
              >
                <p className="text-lg sm:text-xl font-medium leading-[1.7] text-[#1E1B4B]/90 font-sans max-w-2xl">
                  {ikonexTestimonials[currentTestimonialIdx].quote}
                </p>
                
                <div className="flex items-center gap-4 text-left border-t border-gray-100 pt-6 w-full justify-center">
                  {/* Initials Avatar circle */}
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-[#7e22ce] flex items-center justify-center font-bold text-base border border-purple-100 flex-shrink-0">
                    {ikonexTestimonials[currentTestimonialIdx].author.split(' ')[0][0] + 
                     (ikonexTestimonials[currentTestimonialIdx].author.split(' ').filter(Boolean)[1]?.[0] || '')}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[#1E1B4B] font-sans">
                      {ikonexTestimonials[currentTestimonialIdx].author.split(' — ')[0]}
                    </span>
                    <span className="text-xs text-gray-400 font-sans">
                      {ikonexTestimonials[currentTestimonialIdx].author.split(' — ')[1]}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots navigation */}
            <div className="flex items-center gap-2 mt-8">
              {ikonexTestimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonialIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentTestimonialIdx === idx 
                      ? 'bg-[#7e22ce] w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6 — PRICING SECTION */}
      <PricingSection />

      {/* 7 — CTA BANNER */}
      <section className="py-24 bg-[#1E1B4B] text-center relative overflow-hidden z-10" id="contact">
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-0 translate-x-[-20%] translate-y-[-20%]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-0 translate-x-[20%] translate-y-[20%]" />
        
        <div className="w-full max-w-[600px] mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <h2 className="text-[48px] font-extrabold hero-display-font tracking-tight text-white mb-6 leading-[1.15]">
            Your teachers didn't train for years to fill in spreadsheets.
          </h2>
          <p className="text-white/75 text-[20px] font-normal mb-10 max-w-xl mx-auto leading-[1.7]">
            Ikonex handles the admin. They get back to teaching.
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-[#7e22ce] hover:bg-[#3B82F6] text-white font-bold px-8 py-4 rounded-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-lg shadow-purple-600/10 no-underline text-base cursor-pointer font-sans"
          >
            Get Started Free →
          </Link>
          <div className="text-xs text-purple-300/80 mt-4 font-semibold font-sans">No credit card required · Set up in minutes.</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0D0D1A] text-slate-400 py-20 border-t border-white/5">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 items-start">
            {/* Logo + Description Column: 1.5x width of other columns */}
            <div className="col-span-12 md:col-span-6 lg:col-span-5 flex flex-col items-start">
              <Link to="/" className="flex items-center gap-3 no-underline mb-6 text-white">
                <span className="text-purple-400 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 stroke-[2.5]" />
                </span>
                <span className="text-base font-extrabold tracking-tight display-font">Ikonex Academy</span>
              </Link>
              <div className="max-w-[300px]">
                <p className="text-[#94A3B8] text-xs leading-[1.7] font-sans">
                  We built Ikonex for the registrars, teachers, and principals who were still compiling results by hand. There's a better way.
                </p>
              </div>
              {/* Social icons below description */}
              <div className="flex items-center gap-4 mt-6">
                {[
                  { icon: Twitter, href: "https://twitter.com/ikonex", label: "Twitter" },
                  { icon: Linkedin, href: "https://linkedin.com/company/ikonex", label: "LinkedIn" },
                  { icon: Github, href: "https://github.com/ikonex", label: "GitHub" }
                ].map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-white transition-colors duration-150 p-1 rounded-md"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Product link column */}
            <div className="col-span-12 sm:col-span-4 md:col-span-2 flex flex-col items-start">
              <h4 className="text-[13px] uppercase font-semibold text-[#CBD5E1] tracking-wider mb-5">Product</h4>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0 text-left">
                <li><a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 no-underline font-sans">Features</a></li>
                <li><a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 no-underline font-sans">How It Works</a></li>
                <li><a href="#modules" className="text-sm text-slate-400 hover:text-white transition-colors no-underline font-sans">Modules</a></li>
                <li><Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 no-underline font-sans">Sign In</Link></li>
              </ul>
            </div>

            {/* Company link column */}
            <div className="col-span-12 sm:col-span-4 md:col-span-2 flex flex-col items-start">
              <h4 className="text-[13px] uppercase font-semibold text-[#CBD5E1] tracking-wider mb-5">Company</h4>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0 text-left">
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 no-underline font-sans">About Us</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 no-underline font-sans">Careers</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 no-underline font-sans">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 no-underline font-sans">Terms of Service</a></li>
              </ul>
            </div>

            {/* Support link column */}
            <div className="col-span-12 sm:col-span-4 md:col-span-2 flex flex-col items-start">
              <h4 className="text-[13px] uppercase font-semibold text-[#CBD5E1] tracking-wider mb-5">Support</h4>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0 text-left">
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 no-underline font-sans">Help Center</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 no-underline font-sans">Documentation</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 no-underline font-sans">Contact Support</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors duration-150 no-underline font-sans">Status Page</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] text-[#475569]">
            <span>&copy; 2026 Ikonex Academy. All rights reserved.</span>
            <span>Made for East African Schools. 🇰🇪</span>
          </div>
        </div>
      </footer>

      {/* DEMO VIDEO MODAL POPUP */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl border border-slate-200"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-[#0d1b4b]">Ikonex Academy Dashboard Tour</span>
                <button 
                  onClick={() => setShowVideoModal(false)}
                  className="p-1 hover:bg-slate-200 rounded-full transition"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="aspect-video bg-[#0B0F19] flex items-center justify-center text-center p-6">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#9333ea] text-white flex items-center justify-center mx-auto shadow-lg cursor-pointer hover:bg-[#7e22ce] transition">
                    <Play className="w-6 h-6 fill-white stroke-none" style={{ transform: 'translateX(2px)' }} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white display-font">Administrative Walkthrough Video</h5>
                    <p className="text-[11px] text-gray-400 max-w-xs mx-auto mt-1">A brief guided tour showing stream allocations, score validators, and print-ready report sheets.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
