import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldAlert, Sparkles, Eye, EyeOff, X } from 'lucide-react';
import { Link, useNavigate } from './Router';

interface LoginViewProps {
  onLogin: (token: string, refreshToken: string, user: { id: string; name: string; email: string; role: string }) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password flow states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    }
    if (!validateEmail(forgotEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotError(null);
    setForgotSuccess(null);
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API server returned an invalid response. Please check if the backend is running.');
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to send reset code.');
      }
      setForgotStep(2);
      setForgotSuccess('A password recovery code has been sent to your email.');
    } catch (err: any) {
      setForgotError(err.message || 'Something went wrong.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCode || !newPassword || !confirmPassword) {
      setForgotError('Please fill in all fields.');
      return;
    }
    if (forgotCode.length !== 6) {
      setForgotError('Verification code must be 6 digits.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotError(null);
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          code: forgotCode,
          newPassword
        })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API server returned an invalid response. Please check if the backend is running.');
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to reset password.');
      }
      setForgotSuccess(null);
      alert('Password reset successfully! You can now sign in.');
      setShowForgotModal(false);

      // Reset state and prefill fields
      setEmail(forgotEmail);
      setPassword('');
      setForgotEmail('');
      setForgotStep(1);
      setForgotCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setForgotError(err.message || 'Something went wrong.');
    } finally {
      setForgotLoading(false);
    }
  };

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
      const response = await fetch('/api/auth/send-login-code', {
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
        throw new Error(result.error?.message || 'Invalid email or password.');
      }

      sessionStorage.setItem('temp_login_email', email);
      sessionStorage.setItem('temp_login_password', password);

      navigate(`/verify-login?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    setError(null);
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
              Student Management Portal
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400">Sign in to access your administrative dashboard.</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-600 text-xs animate-in fade-in duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-normal font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
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
                  placeholder="name@ikonex.edu"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea]/30 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 text-xs outline-none transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotError(null);
                    setForgotSuccess(null);
                    setForgotStep(1);
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-[10px] font-bold text-[#9333ea] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#9333ea] hover:bg-[#7e22ce] disabled:bg-[#9333ea]/50 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-lg shadow-purple-600/10 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to Register & Admin Portal */}
          <div className="text-center pt-2 border-t border-slate-100 space-y-2">
            <div>
              <span className="text-xs text-slate-400">Don't have an account? </span>
              <Link to="/register" className="text-xs font-bold text-[#9333ea] hover:underline">
                Create an account
              </Link>
            </div>
            <div className="pt-1.5">
              <span className="text-[11px] text-slate-400">School Administrator? </span>
              <Link to="/admin-login" className="text-[11px] font-bold text-[#9333ea] hover:underline">
                Admin Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Accounts Panel — add content here if needed */}

      </div>{/* ✅ closes: w-full max-w-md relative z-10 */}

      {/* Forgot Password Modal Overlay */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#9333ea] text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#dad7ff]" />
                <h3 className="text-sm font-black">Password Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotError(null);
                  setForgotSuccess(null);
                  setForgotStep(1);
                }}
                className="p-1 hover:bg-white/10 rounded-full text-purple-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {forgotError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}
              {forgotSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotRequest} className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Enter the email address associated with your Ikonex Academy account. We will send you a 6-digit verification code to reset your password.
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="teacher@ikonex.edu"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea]/30 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs outline-none transition font-semibold"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-[#9333ea] text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-purple-600/10 cursor-pointer hover:bg-[#7e22ce] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Recovery Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotReset} className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Enter the 6-digit recovery code sent to your inbox and choose a new secure password.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">6-Digit Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea]/30 text-slate-800 text-center tracking-[4px] rounded-xl px-3.5 py-3 text-xs outline-none transition font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea]/30 text-slate-800 rounded-xl px-3.5 py-3 text-xs outline-none transition font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#9333ea] focus:ring-1 focus:ring-[#9333ea]/30 text-slate-800 rounded-xl px-3.5 py-3 text-xs outline-none transition font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-[#9333ea] text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-purple-600/10 cursor-pointer hover:bg-[#7e22ce] active:scale-[0.98] transition-all flex items-center justify-center"
                  >
                    {forgotLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError(null);
                      setForgotSuccess(null);
                      setForgotCode('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="w-full text-slate-500 hover:text-[#9333ea] font-bold text-[10px] tracking-wide uppercase py-1 transition cursor-pointer"
                  >
                    Resend code / Change email
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}