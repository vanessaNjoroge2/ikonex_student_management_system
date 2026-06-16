import React, { useState, useEffect } from 'react';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldAlert, Check, User, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from './Router';

export default function RegisterView() {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Too Weak', color: 'bg-rose-500' });

  // Calculate password strength on password change
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, text: 'Too Weak', color: 'bg-slate-200' });
      return;
    }
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let text = 'Too Weak';
    let color = 'bg-rose-500';

    if (score >= 4) {
      text = 'Strong';
      color = 'bg-emerald-500';
    } else if (score >= 2) {
      text = 'Medium';
      color = 'bg-amber-500';
    }

    setPasswordStrength({ score, text, color });
  }, [password]);

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (name.trim().length < 2) {
      setError('Full Name must be at least 2 characters.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API server returned an invalid response. Please check if the backend is running.');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to register.');
      }

      setSuccess('Account created successfully! Redirecting to email verification...');
      
      // Redirect after showing success state
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative premium gradients matching the dashboard style */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-200/20 blur-[120px]" />

      <div className="w-full max-w-md relative z-10 space-y-8 animate-in duration-500 fade-in slide-in-from-bottom-4">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-[#9333ea] text-white rounded-2xl shadow-xl shadow-purple-600/10 border border-purple-700/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
              Ikonex Academy
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Create Administrator Account
            </p>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Get Started</h2>
            <p className="text-xs text-slate-400">Create an admin account to manage the academy database.</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-600 text-xs animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-normal font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-600 text-xs animate-in fade-in duration-200">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span className="leading-normal font-bold">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea]/30 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 text-xs outline-none transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doe@ikonex.edu"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea]/30 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 text-xs outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea]/30 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-10 py-3 text-xs outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Strength Indicator */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className={passwordStrength.text === 'Strong' ? 'text-emerald-600' : passwordStrength.text === 'Medium' ? 'text-amber-500' : 'text-rose-500'}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 transition-all ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea]/30 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-10 py-3 text-xs outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full mt-2 bg-[#9333ea] hover:bg-[#7e22ce] disabled:bg-[#9333ea]/50 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-lg shadow-purple-600/10 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">Already registered? </span>
            <Link to="/login" className="text-xs font-bold text-[#9333ea] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
