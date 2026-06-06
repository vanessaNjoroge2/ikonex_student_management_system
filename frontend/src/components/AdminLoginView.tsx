import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldAlert, Shield, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from './Router';

interface AdminLoginViewProps {
  onLogin: (token: string, refreshToken: string, user: { id: string; name: string; email: string; role: string }) => void;
}

export default function AdminLoginView({ onLogin }: AdminLoginViewProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API server returned an invalid response. Please check if the backend is running.');
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Access Denied: Invalid credentials or insufficient privileges.');
      }

      const { token, refreshToken, user } = result.data;
      onLogin(token, refreshToken, user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Premium dark indigo glow background */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[150px]" />

      <div className="w-full max-w-md relative z-10 space-y-8 animate-in duration-500 fade-in slide-in-from-bottom-4">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-650 text-white rounded-2xl shadow-xl shadow-indigo-500/10 border border-indigo-500/20">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              Ikonex Admin Portal
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Official School Registries System Setup
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-950/80 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 backdrop-blur-md">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">Admin Sign In</h2>
            <p className="text-xs text-slate-400">Enter your credentials to manage academy accounts.</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-rose-950/45 border border-rose-900/60 p-4 rounded-xl text-rose-200 text-xs animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="leading-normal font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ikonex.edu"
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-xs outline-none transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-3 text-xs outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-650/50 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-lg shadow-indigo-500/10 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to Teacher Login */}
          <div className="text-center pt-2 border-t border-slate-900">
            <span className="text-xs text-slate-400">Looking for teacher portal? </span>
            <Link to="/login" className="text-xs font-bold text-indigo-400 hover:underline">
              Teacher Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
