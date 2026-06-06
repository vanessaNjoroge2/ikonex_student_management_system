import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import CountUp from 'react-countup';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { 
  GraduationCap, Users, Waves, FileSpreadsheet, ArrowRight, 
  CheckCircle, Award, FileText, Menu, X, BookOpen, Layers,
  ChevronRight, Calendar, BarChart3, Clock, Check, TrendingUp, ShieldAlert, Zap,
  Play, DollarSign, UserCheck
} from 'lucide-react';
import { Link } from './Router';

import 'swiper/css';
import 'swiper/css/pagination';

export default function LandingView() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'students' | 'performance' | 'reports'>('students');
  const [showVideoModal, setShowVideoModal] = useState(false);

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

  // Workflow scroll progress configurations
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });
  
  // Transform scroll progress to line height percentage
  const timelineLineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div 
      className="min-h-screen text-[#0f172a] antialiased relative overflow-hidden" 
      style={{ 
        fontFamily: "'Inter', sans-serif", 
        backgroundColor: '#F8F7F4' 
      }}
    >
      <style>{`
        .display-font {
          font-family: 'Clash Display', 'Satoshi', sans-serif;
        }
        .body-font {
          font-family: 'Inter', sans-serif;
        }
        .bento-glow:hover {
          box-shadow: 0 0 30px rgba(53, 37, 205, 0.08);
        }
      `}</style>

      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] bg-gradient-to-br from-indigo-200/20 to-transparent rounded-full pointer-events-none gradient-blob -z-10" />
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
            <span className="text-[#3525cd] flex items-center justify-center">
              <GraduationCap className="w-8 h-8 stroke-[2.5]" />
            </span>
            <span className="text-xl font-extrabold tracking-tight display-font text-[#0f172a]">Ikonex Academy</span>
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            <li><a href="#features" className="text-sm font-semibold text-[#64748b] hover:text-[#3525cd] transition-colors no-underline">Features</a></li>
            <li><a href="#how-it-works" className="text-sm font-semibold text-[#64748b] hover:text-[#3525cd] transition-colors no-underline">How It Works</a></li>
            <li><a href="#modules" className="text-sm font-semibold text-[#64748b] hover:text-[#3525cd] transition-colors no-underline">Modules</a></li>
            <li><a href="#analytics" className="text-sm font-semibold text-[#64748b] hover:text-[#3525cd] transition-colors no-underline">Analytics</a></li>
            <li><a href="#contact" className="text-sm font-semibold text-[#64748b] hover:text-[#3525cd] transition-colors no-underline">Contact</a></li>
          </ul>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-[#64748b] hover:text-[#3525cd] transition-colors no-underline px-3 py-2">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-[#3525cd] hover:bg-[#4f46e5] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-600/10"
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
                <Link to="/register" className="w-full text-center bg-[#3525cd] text-white font-bold py-3 rounded-xl no-underline">
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-24 relative overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          
          {/* Hero Content Left */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            <div className="bg-[#dad7ff] text-[#3525cd] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 display-font">
              East African Schools Native OS
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#0f172a] tracking-tight leading-none mb-6 display-font">
              Streamline school education with <span className="text-[#3525cd] italic font-medium">precision.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-[#64748b] mb-8 font-medium leading-relaxed max-w-xl">
              Bring student tracking, exam performance configurations, classroom stream management, and automated report compiles into one premium interface. Built by educators, for educators.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
              <Link 
                to="/register" 
                className="bg-[#3525cd] hover:bg-[#4f46e5] text-white text-sm font-bold px-8 py-4 rounded-xl transition-all duration-300 text-center hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => setShowVideoModal(true)}
                className="border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[#0f172a] text-sm font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4 text-[#3525cd] fill-[#3525cd]" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Micro Trust badge */}
            <div className="flex items-center gap-3 border-t border-slate-200 pt-6 w-full">
              <div className="flex -space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-[8px] font-black">SC</div>
                <div className="w-7 h-7 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-[8px] font-black">VN</div>
                <div className="w-7 h-7 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-[8px] font-black">AM</div>
              </div>
              <span className="text-xs font-semibold text-[#64748b]">
                Empowering administrators in Nairobi, Kampala & Dar es Salaam.
              </span>
            </div>
          </motion.div>

          {/* Hero Visual Right */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, cubicBezier: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative w-full max-w-[540px] mx-auto hero-visual-wrapper"
          >
            {/* Tilted dashboard preview */}
            <div 
              className="w-full bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden flex flex-col shadow-2xl relative"
              style={{
                transform: 'rotateX(6deg) rotateY(-10deg) rotateZ(2deg)',
                aspectRatio: '1.35'
              }}
            >
              <div className="h-12 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#f87171]" />
                  <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
                  <div className="w-2 h-2 rounded-full bg-[#34d399]" />
                </div>
                <div className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase display-font">Ikonex Core OS</div>
                <div className="w-10" />
              </div>

              <div className="flex-1 grid grid-cols-[70px_1fr] bg-gray-50">
                <div className="border-r border-[#e2e8f0] py-6 flex flex-col items-center gap-5 bg-white">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#3525cd]">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-4 overflow-hidden justify-between">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase block">Total Students</span>
                      <span className="text-xl font-bold text-[#0f172a] display-font block mt-1">1,248</span>
                    </div>
                    <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase block">Active Streams</span>
                      <span className="text-xl font-bold text-[#3525cd] display-font block mt-1">12 Streams</span>
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-[#e2e8f0] rounded-xl p-4 flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-center text-xs font-bold text-[#0f172a]">
                      <span>Average Performance Index</span>
                      <span className="text-emerald-500 font-extrabold flex items-center gap-0.5"><TrendingUp className="w-3.5 h-3.5" /> +1.8%</span>
                    </div>
                    <div className="flex items-end justify-between h-20 pt-2 gap-2">
                      <div className="flex-1 bg-slate-100 rounded-t-[4px] h-[55%]" />
                      <div className="flex-1 bg-[#3525cd] rounded-t-[4px] h-[72%] opacity-90" />
                      <div className="flex-1 bg-slate-100 rounded-t-[4px] h-[40%]" />
                      <div className="flex-1 bg-[#3525cd] rounded-t-[4px] h-[92%] opacity-90" />
                      <div className="flex-1 bg-slate-100 rounded-t-[4px] h-[60%]" />
                      <div className="flex-1 bg-emerald-500 rounded-t-[4px] h-[84%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating absolute metrics badges */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-4 -left-6 bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-lg flex items-center gap-2.5 z-30 pointer-events-none"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[#64748b] uppercase">Attendance logged</span>
                <span className="text-xs font-bold text-[#0f172a]">96.8% rate</span>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -right-6 bg-white border border-[#e2e8f0] rounded-xl p-3.5 shadow-lg flex items-center gap-3 z-30 pointer-events-none"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#3525cd]">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[#64748b] uppercase">End of Term 3</span>
                <span className="text-xs font-bold text-[#0f172a]">Reports Compiled</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* TRUST / METRICS BAR */}
      <section className="bg-white border-y border-[#e2e8f0] py-14">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-[#3525cd] display-font block mb-1">
                <CountUp end={10000} duration={3} enableScrollSpy scrollSpyOnce />+
              </span>
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Students Managed</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-[#3525cd] display-font block mb-1">
                <CountUp end={500} duration={3} enableScrollSpy scrollSpyOnce />+
              </span>
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Schools Trusting Us</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-[#3525cd] display-font block mb-1">
                <CountUp end={98} duration={3} enableScrollSpy scrollSpyOnce />%
              </span>
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Satisfaction Rate</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-[#3525cd] display-font block mb-1">
                <CountUp end={95} duration={3} enableScrollSpy scrollSpyOnce />%
              </span>
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Faster Reporting</span>
            </div>

          </div>
        </div>
      </section>

      {/* PROBLEM vs SOLUTION COMPARISON */}
      <section className="py-24 bg-[#F8F7F4] relative" id="features">
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch relative z-10">
          
          {/* Left Column: Manual Processes */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-[#e2e8f0] rounded-3xl p-10 flex flex-col justify-between shadow-sm relative overflow-hidden"
          >
            <div className="mb-10">
              <span className="text-xs uppercase font-extrabold text-red-500 tracking-wider block mb-2 display-font">The Paper Route</span>
              <h2 className="text-3xl font-extrabold text-[#0f172a] display-font">Manual Administrative Friction</h2>
              <p className="text-xs text-[#64748b] mt-2 leading-relaxed">Paper logs and isolated local systems strain resources and cause friction.</p>
            </div>
            
            <ul className="flex flex-col gap-6 list-none p-0">
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 font-bold text-sm">✗</div>
                <div>
                  <h4 className="text-base font-bold text-[#0f172a] mb-1">Manual Attendance Registers</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Roll calls logged on physical books. Hard to monitor stream-level patterns and easy to misplace.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 font-bold text-sm">✗</div>
                <div>
                  <h4 className="text-base font-bold text-[#0f172a] mb-1">Isolated Excel Spreadsheets</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Grades entered across multiple USB drives. Compiling term positions takes days of error-prone formulas.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 font-bold text-sm">✗</div>
                <div>
                  <h4 className="text-base font-bold text-[#0f172a] mb-1">Delayed End of Term Reports</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Administrators spend weeks handwriting card remarks and summing scores instead of focusing on curriculum planning.</p>
                </div>
              </li>
            </ul>
            <div />
          </motion.div>

          {/* Right Column: Automated Solution */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#f0effe] border border-[#dad7ff] rounded-3xl p-10 flex flex-col justify-between shadow-md relative overflow-hidden"
          >
            <div className="mb-10">
              <span className="text-xs uppercase font-extrabold text-[#3525cd] tracking-wider block mb-2 display-font">The Ikonex Solution</span>
              <h2 className="text-3xl font-extrabold text-[#0f172a] display-font">Automated School Management</h2>
              <p className="text-xs text-[#3525cd] mt-2 leading-relaxed font-semibold">One unified operating registry designed to automate data entry.</p>
            </div>
            
            <ul className="flex flex-col gap-6 list-none p-0">
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-[#3525cd] text-white flex items-center justify-center flex-shrink-0 font-bold text-[10px]">✓</div>
                <div>
                  <h4 className="text-base font-bold text-[#0f172a] mb-1">Digital Student Records</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Secure pupil bios, profile files, and stream allocations synced and accessible with one click.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-[#3525cd] text-white flex items-center justify-center flex-shrink-0 font-bold text-[10px]">✓</div>
                <div>
                  <h4 className="text-base font-bold text-[#0f172a] mb-1">Performance Analytics</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Log marks with limits validator check. Cohort position rankings are computed instantly by the system.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-[#3525cd] text-white flex items-center justify-center flex-shrink-0 font-bold text-[10px]">✓</div>
                <div>
                  <h4 className="text-base font-bold text-[#0f172a] mb-1">Instant Report Cards</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Dynamically compile student transcript indexes and class summaries to print-ready PDF attachment downloads.</p>
                </div>
              </li>
            </ul>
            <div />
          </motion.div>

        </div>
      </section>

      {/* CORE MODULES (BENTO GRID) */}
      <section className="py-24 bg-white" id="modules">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold text-[#3525cd] tracking-widest block mb-3">System Modules</span>
            <h2 className="text-4xl font-extrabold text-[#0f172a] tracking-tight mb-4 display-font">Built to Empower Academic Managers</h2>
            <p className="text-[#64748b] text-sm">Configure grading scale matrices, organize classroom cohorts, log marks, and export transcripts seamlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1 - Student Management (spans 2 columns) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 bg-[#F8F7F4] border border-[#e2e8f0] rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group bento-card-react bento-glow"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#dad7ff] text-[#3525cd] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">Student Management</h3>
                <p className="text-[#64748b] text-sm leading-relaxed max-w-md">
                  Enroll new students, document detailed biographical profiles, record extracurricular fields, and log statuses dynamically in a clean database.
                </p>
              </div>
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 mt-8 shadow-sm">
                <div className="flex gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex justify-between items-center text-xs flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#3525cd] text-white flex items-center justify-center text-[9px] font-black">VN</div>
                      <span className="font-bold">Vanessa Njoroge</span>
                    </div>
                    <span className="bg-[#dad7ff] text-[#3525cd] px-2 py-0.5 rounded font-bold text-[9px]">Form 4A</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex justify-between items-center text-xs flex-1 hidden sm:flex">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">AM</div>
                      <span className="font-bold">Alan Mwangi</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold text-[9px]">Form 3B</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 2 - Performance Tracking */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#F8F7F4] border border-[#e2e8f0] rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group bento-card-react bento-glow"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#dad7ff] text-[#3525cd] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">Performance Tracking</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  Log scores for continuous assessments and terminal examinations. Check entry constraints and track position ranks instantly.
                </p>
              </div>
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 mt-8 flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Math</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full mx-3 overflow-hidden">
                    <div className="h-full bg-[#3525cd]" style={{ width: '88%' }} />
                  </div>
                  <span>88%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Chem</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full mx-3 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '74%' }} />
                  </div>
                  <span>74%</span>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 3 - Stream Management */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#F8F7F4] border border-[#e2e8f0] rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group bento-card-react bento-glow"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#dad7ff] text-[#3525cd] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">Stream Management</h3>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  Group student cohorts into classroom streams. Allocate class teachers, configure rules, and check room codes.
                </p>
              </div>
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 mt-8 grid grid-cols-2 gap-2 shadow-sm">
                <div className="bg-slate-50 border border-slate-100 rounded p-1.5 text-center">
                  <span className="block text-xs font-extrabold text-[#0d1b4b]">Form 4A</span>
                  <span className="text-[9px] text-[#64748b] block mt-0.5">38 Pupils</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded p-1.5 text-center">
                  <span className="block text-xs font-extrabold text-[#0d1b4b]">Form 3B</span>
                  <span className="text-[9px] text-[#64748b] block mt-0.5">42 Pupils</span>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 4 - Report Generation (spans 2 columns) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="md:col-span-2 bg-[#F8F7F4] border border-[#e2e8f0] rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group bento-card-react bento-glow"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#dad7ff] text-[#3525cd] flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">Report Generation</h3>
                <p className="text-[#64748b] text-sm leading-relaxed max-w-md">
                  Review metrics instantly, compile student performance briefs, and export clean registry reports dynamically in professional PDF format.
                </p>
              </div>
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 mt-8 flex items-center justify-between text-xs shadow-sm">
                <div className="flex items-center gap-2 font-bold text-[#0f172a]">
                  <FileSpreadsheet className="w-4 h-4 text-red-500" />
                  <span>ReportCard_VN4502.pdf</span>
                </div>
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" /> Fully Compiled
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE TABBED PREVIEW AREA */}
      <section className="py-24 bg-[#F8F7F4] border-t border-[#e2e8f0]">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold text-[#3525cd] tracking-widest block mb-3">Live Tour</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] display-font mb-4">Explore the Admin Dashboard</h2>
            <p className="text-gray-500 text-sm">Experience school administration at its best. Explore the sections teachers use daily.</p>
          </div>

          {/* Tabs switch */}
          <div className="flex justify-center gap-2 p-1.5 bg-slate-200/50 border border-[#e2e8f0] rounded-2xl max-w-md mx-auto mb-12">
            <button 
              onClick={() => setActiveShowcaseTab('students')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                activeShowcaseTab === 'students' 
                  ? 'bg-white text-[#3525cd] shadow' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Student Directory
            </button>
            <button 
              onClick={() => setActiveShowcaseTab('performance')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                activeShowcaseTab === 'performance' 
                  ? 'bg-white text-[#3525cd] shadow' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Gradebook entry
            </button>
            <button 
              onClick={() => setActiveShowcaseTab('reports')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                activeShowcaseTab === 'reports' 
                  ? 'bg-white text-[#3525cd] shadow' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              PDF Reports
            </button>
          </div>

          {/* Showcase panels */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto min-h-[360px] flex flex-col justify-between overflow-hidden">
            <AnimatePresence mode="wait">
              {activeShowcaseTab === 'students' && (
                <motion.div 
                  key="students-showcase"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4 w-full"
                >
                  <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-4">
                    <div>
                      <h4 className="text-base font-extrabold text-[#0f172a]">Student Directory</h4>
                      <p className="text-[11px] text-[#64748b] mt-0.5">Filter, edit, and trace active candidates enrolled across streams.</p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-[#0f172a] font-bold px-2.5 py-1 rounded">1,248 Candidates</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#e2e8f0] text-[#64748b] font-bold">
                          <th className="py-2.5 px-3">Student Name</th>
                          <th className="py-2.5 px-3">Admission No</th>
                          <th className="py-2.5 px-3">Form level</th>
                          <th className="py-2.5 px-3">Stream</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold">Vanessa Njoroge</td>
                          <td className="py-3 px-3 font-mono text-gray-500">#ADM-2024-04502</td>
                          <td className="py-3 px-3">Form 4</td>
                          <td className="py-3 px-3 font-semibold text-[#3525cd]">Stream A</td>
                          <td className="py-3 px-3 text-right"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold text-[9px]">Active</span></td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold">Alan Mwangi</td>
                          <td className="py-3 px-3 font-mono text-gray-500">#ADM-2024-01890</td>
                          <td className="py-3 px-3">Form 3</td>
                          <td className="py-3 px-3 font-semibold text-[#3525cd]">Stream B</td>
                          <td className="py-3 px-3 text-right"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold text-[9px]">Active</span></td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold">Julianne Moore</td>
                          <td className="py-3 px-3 font-mono text-gray-500">#ADM-2023-09805</td>
                          <td className="py-3 px-3">Form 4</td>
                          <td className="py-3 px-3 font-semibold text-[#3525cd]">Stream A</td>
                          <td className="py-3 px-3 text-right"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold text-[9px]">Active</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === 'performance' && (
                <motion.div 
                  key="performance-showcase"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-5 w-full"
                >
                  <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-4">
                    <div>
                      <h4 className="text-base font-extrabold text-[#0f172a]">Gradebook Score entry</h4>
                      <p className="text-[11px] text-[#64748b] mt-0.5">Input continuous assessments (CA) and end-of-term exams.</p>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-[#3525cd] font-bold px-2.5 py-1 rounded">Score Constraints Active</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-[#e2e8f0] rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase">Continuous Assessment (CA)</span>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-400 block mb-1">Score</label>
                          <input type="text" readOnly value="24" className="w-full bg-white border border-[#e2e8f0] rounded-lg p-2.5 font-bold text-xs outline-none" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-400 block mb-1">Max Marks</label>
                          <input type="text" readOnly value="30" className="w-full bg-slate-100 border border-[#e2e8f0] text-gray-400 rounded-lg p-2.5 font-bold text-xs outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="border border-[#e2e8f0] rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase">End of Term Examination</span>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-400 block mb-1">Score</label>
                          <input type="text" readOnly value="58" className="w-full bg-white border border-[#e2e8f0] rounded-lg p-2.5 font-bold text-xs outline-none" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-gray-400 block mb-1">Max Marks</label>
                          <input type="text" readOnly value="70" className="w-full bg-slate-100 border border-[#e2e8f0] text-gray-400 rounded-lg p-2.5 font-bold text-xs outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 flex items-center gap-2.5 text-[10px] text-emerald-800 font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Validator Sync: Score entry 58 matches the limit constraint under maximum exam score (70). Entry validated successfully.</span>
                  </div>
                </motion.div>
              )}

              {activeShowcaseTab === 'reports' && (
                <motion.div 
                  key="reports-showcase"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-5 w-full"
                >
                  <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-4">
                    <div>
                      <h4 className="text-base font-extrabold text-[#0f172a]">PDF Transcript compiler</h4>
                      <p className="text-[11px] text-[#64748b] mt-0.5">Generate official, layout-perfect student report cards.</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded">Print Ready</span>
                  </div>

                  <div className="border border-[#e2e8f0] rounded-2xl p-5 bg-[#fafbfc] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-xs text-[#0f172a] block">ReportCard_VanessaNjoroge_Term3.pdf</strong>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Size: 242 KB · Generated on: 2026-06-06</span>
                      </div>
                    </div>
                    <button className="bg-[#3525cd] hover:bg-[#4f46e5] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition duration-300 shadow">
                      Download PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-slate-100 bg-white rounded-xl p-3 text-center">
                      <span className="text-[9px] text-[#64748b] block font-bold">Class Mean</span>
                      <strong className="text-sm text-[#0d1b4b] block mt-1">82.4%</strong>
                    </div>
                    <div className="border border-slate-100 bg-white rounded-xl p-3 text-center">
                      <span className="text-[9px] text-[#64748b] block font-bold">Class Position</span>
                      <strong className="text-sm text-[#3525cd] block mt-1">#2 of 38</strong>
                    </div>
                    <div className="border border-slate-100 bg-white rounded-xl p-3 text-center">
                      <span className="text-[9px] text-[#64748b] block font-bold">Promoted to</span>
                      <strong className="text-sm text-[#0f172a] block mt-1">Form 4</strong>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* WORKFLOW TIMELINE */}
      <section className="py-24 bg-white" id="how-it-works">
        <div className="w-full max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold text-[#3525cd] tracking-widest block mb-3">Onboarding Roadmap</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] display-font mb-4">Simple Setup, Powerful Results</h2>
            <p className="text-gray-500 text-sm">Follow the straightforward steps to fully integrate your academy registration logs.</p>
          </div>

          <div ref={timelineRef} className="relative max-w-3xl mx-auto pl-8 sm:pl-0">
            {/* Center line */}
            <div className="absolute left-0 sm:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 transform sm:-translate-x-1/2 -z-10" />
            
            {/* Animating progress line overlay */}
            <motion.div 
              className="absolute left-0 sm:left-1/2 top-0 w-0.5 bg-[#3525cd] transform sm:-translate-x-1/2 origin-top -z-10"
              style={{ height: timelineLineHeight }}
            />

            <div className="flex flex-col gap-12 sm:gap-20">
              
              {/* Step 1 */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between sm:even:flex-row-reverse">
                <div className="absolute left-[-32px] sm:left-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#3525cd] flex items-center justify-center font-bold text-xs text-[#3525cd] transform sm:-translate-x-1/2 z-20 shadow">
                  1
                </div>
                <div className="w-full sm:w-[44%] bg-[#F8F7F4] border border-[#e2e8f0] p-6 rounded-2xl shadow-sm">
                  <h4 className="text-base font-extrabold text-[#0f172a] mb-2">Register School</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Create a secure official academy directory. Log details and default terms configurations.</p>
                </div>
                <div className="hidden sm:block w-[44%]" />
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between sm:even:flex-row-reverse">
                <div className="absolute left-[-32px] sm:left-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#3525cd] flex items-center justify-center font-bold text-xs text-[#3525cd] transform sm:-translate-x-1/2 z-20 shadow">
                  2
                </div>
                <div className="w-full sm:w-[44%] bg-[#F8F7F4] border border-[#e2e8f0] p-6 rounded-2xl shadow-sm">
                  <h4 className="text-base font-extrabold text-[#0f172a] mb-2">Add Students</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Enroll candidates, catalog biographical profiles, and record emergency teacher contacts.</p>
                </div>
                <div className="hidden sm:block w-[44%]" />
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between sm:even:flex-row-reverse">
                <div className="absolute left-[-32px] sm:left-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#3525cd] flex items-center justify-center font-bold text-xs text-[#3525cd] transform sm:-translate-x-1/2 z-20 shadow">
                  3
                </div>
                <div className="w-full sm:w-[44%] bg-[#F8F7F4] border border-[#e2e8f0] p-6 rounded-2xl shadow-sm">
                  <h4 className="text-base font-extrabold text-[#0f172a] mb-2">Create Streams</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Organize grades into distinct classroom streams (e.g., Stream A, Stream B) and assign teachers.</p>
                </div>
                <div className="hidden sm:block w-[44%]" />
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between sm:even:flex-row-reverse">
                <div className="absolute left-[-32px] sm:left-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#3525cd] flex items-center justify-center font-bold text-xs text-[#3525cd] transform sm:-translate-x-1/2 z-20 shadow">
                  4
                </div>
                <div className="w-full sm:w-[44%] bg-[#F8F7F4] border border-[#e2e8f0] p-6 rounded-2xl shadow-sm">
                  <h4 className="text-base font-extrabold text-[#0f172a] mb-2">Record Attendance</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Log daily student presence. The dashboard aggregates term averages automatically.</p>
                </div>
                <div className="hidden sm:block w-[44%]" />
              </div>

              {/* Step 5 */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between sm:even:flex-row-reverse">
                <div className="absolute left-[-32px] sm:left-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#3525cd] flex items-center justify-center font-bold text-xs text-[#3525cd] transform sm:-translate-x-1/2 z-20 shadow">
                  5
                </div>
                <div className="w-full sm:w-[44%] bg-[#F8F7F4] border border-[#e2e8f0] p-6 rounded-2xl shadow-sm">
                  <h4 className="text-base font-extrabold text-[#0f172a] mb-2">Enter Results</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Teachers enter assessment and exam scores. Limit constraints keep data validated.</p>
                </div>
                <div className="hidden sm:block w-[44%]" />
              </div>

              {/* Step 6 */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between sm:even:flex-row-reverse">
                <div className="absolute left-[-32px] sm:left-1/2 w-8 h-8 rounded-full bg-white border-2 border-[#3525cd] flex items-center justify-center font-bold text-xs text-[#3525cd] transform sm:-translate-x-1/2 z-20 shadow">
                  6
                </div>
                <div className="w-full sm:w-[44%] bg-[#F8F7F4] border border-[#e2e8f0] p-6 rounded-2xl shadow-sm">
                  <h4 className="text-base font-extrabold text-[#0f172a] mb-2">Generate Reports</h4>
                  <p className="text-xs text-[#64748b] leading-relaxed">Compile grades and ranks at the end of terms and export certified PDF card sheets instantly.</p>
                </div>
                <div className="hidden sm:block w-[44%]" />
              </div>

              {/* Step 7 */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between sm:even:flex-row-reverse">
                <div className="absolute left-[-32px] sm:left-1/2 w-8 h-8 rounded-full bg-[#3525cd] flex items-center justify-center font-bold text-xs text-white transform sm:-translate-x-1/2 z-20 shadow-lg shadow-indigo-700/25">
                  7
                </div>
                <div className="w-full sm:w-[44%] bg-[#dad7ff] border border-[#3525cd]/20 p-6 rounded-2xl shadow-sm">
                  <h4 className="text-base font-extrabold text-[#3525cd] mb-2">Monitor Performance</h4>
                  <p className="text-xs text-[#0f172a] leading-relaxed font-semibold">Track stream averages, subject rankings, and term statistics from one main page.</p>
                </div>
                <div className="hidden sm:block w-[44%]" />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS SECTION (DARK THEME) */}
      <section className="py-24 bg-[#0B0F19] text-white" id="analytics">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <span className="text-xs uppercase font-extrabold text-[#dad7ff] tracking-widest block mb-3">Live Analytics</span>
            <h2 className="text-3xl md:text-4xl font-extrabold display-font mb-4">Monitor Performance in Real Time</h2>
            <p className="text-gray-400 text-sm">Aggregated school stats are compiled dynamically to keep managers updated.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Large Card: Attendance Rate Gauge */}
            <div className="md:col-span-4 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Attendance Rate</span>
                <span className="text-3xl font-bold display-font block mt-2">96.8%</span>
                <p className="text-xs text-gray-500 mt-2">Aggregate attendance rate across all levels this term.</p>
              </div>
              
              <div className="h-28 w-full flex items-center justify-center mt-6">
                {/* Visual Gauge SVG */}
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#3525cd]" strokeWidth="2.5" strokeDasharray="96.8, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
            </div>

            {/* Medium Card: Demographic split */}
            <div className="md:col-span-5 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Student Population</span>
                <span className="text-3xl font-bold display-font block mt-2">1,248</span>
                <p className="text-xs text-gray-500 mt-2">Enrolled student split log ratios across streams.</p>
              </div>
              
              <div className="flex flex-col gap-3 mt-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span>Male Pupils (52%)</span>
                    <span>648 Candidates</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3525cd]" style={{ width: '52%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span>Female Pupils (48%)</span>
                    <span>600 Candidates</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '48%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Small Card: Exam mean & Fee status */}
            <div className="md:col-span-3 flex flex-col gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg flex-1 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Teacher Engagement</span>
                <div className="flex justify-between items-baseline mt-4">
                  <span className="text-3xl font-bold display-font">24</span>
                  <span className="text-[10px] font-bold text-[#10b981] flex items-center"><UserCheck className="w-3.5 h-3.5" /> Logged In</span>
                </div>
                <span className="text-[9px] text-gray-500 block mt-1">Class teachers actively updating score lists.</span>
              </div>
              
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-lg flex-1 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Fee Collection</span>
                <div className="flex justify-between items-baseline mt-4">
                  <span className="text-3xl font-bold display-font">92%</span>
                  <span className="text-[10px] font-bold text-gray-400">Term 3</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-[#3525cd]" style={{ width: '92%' }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SWIPER TESTIMONIAL CAROUSEL */}
      <section className="py-24 bg-white">
        <div className="w-full max-w-4xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold text-[#3525cd] tracking-widest block mb-3">Case Studies</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] display-font">Trusted by East African Leaders</h2>
          </div>

          <div className="relative">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              spaceBetween={40}
              slidesPerView={1}
              className="pb-16"
            >
              {/* Slide 1: Principal */}
              <SwiperSlide>
                <div className="bg-[#F8F7F4] border border-[#e2e8f0] rounded-3xl p-10 sm:p-12 relative text-center">
                  <span className="absolute top-4 left-6 text-[10rem] leading-none text-[#dad7ff] select-none pointer-events-none display-font opacity-30">“</span>
                  <blockquote className="text-lg sm:text-xl font-medium text-[#0f172a] leading-relaxed mb-8 relative z-10 display-font">
                    "Since switching to Ikonex, our end-of-term reporting takes hours instead of weeks. It's transformed how we run our school and parents appreciate the printed report cards."
                  </blockquote>
                  <div className="w-11 h-11 rounded-full bg-[#dad7ff] text-[#3525cd] flex items-center justify-center font-bold text-sm mx-auto mb-3 border-2 border-white">
                    SC
                  </div>
                  <div className="text-sm font-bold text-[#0f172a]">Sister Mary Claire</div>
                  <div className="text-[11px] font-bold text-[#64748b] mt-0.5">Principal, St. Scholastica Academy</div>
                </div>
              </SwiperSlide>

              {/* Slide 2: Teacher */}
              <SwiperSlide>
                <div className="bg-[#F8F7F4] border border-[#e2e8f0] rounded-3xl p-10 sm:p-12 relative text-center">
                  <span className="absolute top-4 left-6 text-[10rem] leading-none text-[#dad7ff] select-none pointer-events-none display-font opacity-30">“</span>
                  <blockquote className="text-lg sm:text-xl font-medium text-[#0f172a] leading-relaxed mb-8 relative z-10 display-font">
                    "Entering grades is so straightforward now. The system validator catches maximum marks errors instantly, preventing compilation recalculations later."
                  </blockquote>
                  <div className="w-11 h-11 rounded-full bg-emerald-100 text-[#10b981] flex items-center justify-center font-bold text-sm mx-auto mb-3 border-2 border-white">
                    JK
                  </div>
                  <div className="text-sm font-bold text-[#0f172a]">Joseph Kuria</div>
                  <div className="text-[11px] font-bold text-[#64748b] mt-0.5">Mathematics Teacher, Alliance High</div>
                </div>
              </SwiperSlide>

              {/* Slide 3: Administrator */}
              <SwiperSlide>
                <div className="bg-[#F8F7F4] border border-[#e2e8f0] rounded-3xl p-10 sm:p-12 relative text-center">
                  <span className="absolute top-4 left-6 text-[10rem] leading-none text-[#dad7ff] select-none pointer-events-none display-font opacity-30">“</span>
                  <blockquote className="text-lg sm:text-xl font-medium text-[#0f172a] leading-relaxed mb-8 relative z-10 display-font">
                    "Managing streams and registering student transfers is extremely easy. The interface is clean and doesn't require technical expertise to navigate."
                  </blockquote>
                  <div className="w-11 h-11 rounded-full bg-amber-100 text-[#F59E0B] flex items-center justify-center font-bold text-sm mx-auto mb-3 border-2 border-white">
                    FM
                  </div>
                  <div className="text-sm font-bold text-[#0f172a]">Florence Mutua</div>
                  <div className="text-[11px] font-bold text-[#64748b] mt-0.5">Academic Registrar, Loreto Limuru</div>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-28 bg-[#F8F7F4] text-center border-t border-[#e2e8f0]" id="contact">
        <div className="w-full max-w-3xl mx-auto px-6 fade-in-up-react">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight display-font text-[#0f172a] leading-tight">
            Spend Less Time Managing Paperwork.<br />
            <span className="text-[#3525cd]">Spend More Time Educating Students.</span>
          </h2>
          <p className="text-[#64748b] text-base mb-10 max-w-xl mx-auto leading-relaxed">
            Join hundreds of administrators modernizing class registers, exam positioning configurations, and term summaries. Onboard your academy now.
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-[#3525cd] hover:bg-[#4f46e5] text-white text-base font-bold px-10 py-4 rounded-xl transition-all duration-300 shadow-xl shadow-indigo-900/30 hover:scale-[1.02] active:scale-[0.98] no-underline"
          >
            Get Started Free →
          </Link>
          <div className="text-xs text-[#64748b] mt-4 font-semibold">No credit card required · Set up in minutes.</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0D1B4B] text-[rgba(255,255,255,0.7)] py-20">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 no-underline mb-6 text-white">
                <span className="text-[#dad7ff] flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 stroke-[2.5]" />
                </span>
                <span className="text-base font-extrabold tracking-tight display-font">Ikonex Academy</span>
              </Link>
              <p className="text-[rgba(255,255,255,0.6)] text-xs leading-relaxed max-w-xs">
                A next-generation school administration platform built to simplify student directories, grading thresholds, and term analytics.
              </p>
            </div>

            <div>
              <h4 className="text-[11px] uppercase font-extrabold text-white tracking-wider mb-5">Product</h4>
              <ul className="flex flex-col gap-3 list-none p-0">
                <li><a href="#features" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">Features</a></li>
                <li><a href="#how-it-works" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">How It Works</a></li>
                <li><a href="#modules" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">Modules</a></li>
                <li><Link to="/login" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] uppercase font-extrabold text-white tracking-wider mb-5">Company</h4>
              <ul className="flex flex-col gap-3 list-none p-0">
                <li><a href="#" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">About Us</a></li>
                <li><a href="#" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">Careers</a></li>
                <li><a href="#" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">Privacy Policy</a></li>
                <li><a href="#" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] uppercase font-extrabold text-white tracking-wider mb-5">Support</h4>
              <ul className="flex flex-col gap-3 list-none p-0">
                <li><a href="#" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">Help Center</a></li>
                <li><a href="#" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">Documentation</a></li>
                <li><a href="#" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">Contact Support</a></li>
                <li><a href="#" className="text-xs text-[rgba(255,255,255,0.6)] hover:text-white transition-colors no-underline">Status Page</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.1)] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[rgba(255,255,255,0.4)]">
            <span>&copy; 2026 Ikonex Academy. All rights reserved.</span>
            <span className="font-bold text-[#dad7ff]">Made for East African Schools</span>
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
                  <div className="w-14 h-14 rounded-full bg-[#3525cd] text-white flex items-center justify-center mx-auto shadow-lg cursor-pointer hover:bg-[#4f46e5] transition">
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
