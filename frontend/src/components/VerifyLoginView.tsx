import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, ShieldAlert, Check, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { Link, useNavigate } from './Router';

interface VerifyLoginViewProps {
  onLogin: (token: string, refreshToken: string, user: { id: string; name: string; email: string; role: string }) => void;
}

export default function VerifyLoginView({ onLogin }: VerifyLoginViewProps) {
  const navigate = useNavigate();

  // Extract email from query params
  const [email, setEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || '';
  });

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return; // Only allow numbers

    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1); // Get last typed character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace back-focus
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length !== 6 || isNaN(Number(pastedData))) return;

    const newCode = pastedData.split('');
    setCode(newCode);
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    if (timeLeft <= 0) {
      setError('2FA login code has expired. Please request a new one.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-login-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Verification failed.');
      }

      setSuccess('Verification successful! Logging you in...');
      
      const { token, refreshToken, user } = result.data;

      // Clean up sessionStorage
      sessionStorage.removeItem('temp_login_email');
      sessionStorage.removeItem('temp_login_password');

      setTimeout(() => {
        onLogin(token, refreshToken, user);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Incorrect verification code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) return; // Prevent resending before countdown reaches 0

    setError(null);
    setResending(true);

    const tempPassword = sessionStorage.getItem('temp_login_password') || '';
    if (!email || !tempPassword) {
      setError('Unable to resend code. Please return to login page.');
      setResending(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-login-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: tempPassword }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to resend code.');
      }

      setCode(['', '', '', '', '', '']);
      setTimeLeft(300); // Reset timer to 5 minutes
      inputRefs.current[0]?.focus();
      triggerResendAlert();

    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const [resendAlert, setResendAlert] = useState(false);
  const triggerResendAlert = () => {
    setResendAlert(true);
    setTimeout(() => setResendAlert(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative premium gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-200/20 blur-[120px]" />

      <div className="w-full max-w-md relative z-10 space-y-8 animate-in duration-500 fade-in slide-in-from-bottom-4">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-[#3525cd] text-white rounded-2xl shadow-xl shadow-indigo-600/10 border border-indigo-700/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
              Ikonex Academy
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Two-Factor Authentication
            </p>
          </div>
        </div>

        {/* Verification Card */}
        <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="space-y-1.5 text-center">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Enter Verification Code</h2>
            <p className="text-xs text-slate-400 leading-relaxed px-4">
              We've sent a 6-digit login code to <span className="font-semibold text-slate-700">{email}</span>.
            </p>
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

          {resendAlert && (
            <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-[#3525cd] text-xs animate-in fade-in duration-200">
              <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-normal font-bold">A new code was sent to your email.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 6 code boxes */}
            <div className="flex justify-between gap-2.5">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  onChange={(e) => handleInputChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className="w-12 h-14 bg-slate-50 border-2 border-slate-200 focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd]/30 text-slate-800 placeholder-slate-400 rounded-xl text-center text-xl font-bold outline-none transition"
                />
              ))}
            </div>

            {/* Timer and Resend link */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <div className="text-xs text-slate-400">
                  Code expires in <span className="font-mono font-bold text-slate-700">{formatTime(timeLeft)}</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResendCode}
                  className="text-xs font-bold text-[#3525cd] hover:underline flex items-center justify-center gap-1.5 mx-auto transition cursor-pointer"
                >
                  {resending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Resend Login Code</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-[#3525cd] hover:bg-[#4f46e5] disabled:bg-[#3525cd]/50 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify and Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to login */}
          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">Back to </span>
            <Link to="/login" className="text-xs font-bold text-[#3525cd] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
