import React, { useEffect } from 'react';
import { useNavigate, useRouter } from './Router';

interface AuthGuardProps {
  token: string | null;
  children: React.ReactNode;
  requireAuth?: boolean; // true = dashboard routes, false = login/register routes
}

export default function AuthGuard({ token, children, requireAuth = true }: AuthGuardProps) {
  const navigate = useNavigate();
  const { path } = useRouter();

  const activeToken = localStorage.getItem('ikonex_access_token') || token;

  useEffect(() => {
    const currentToken = localStorage.getItem('ikonex_access_token') || token;
    if (requireAuth && !currentToken) {
      navigate('/login');
    } else if (!requireAuth && currentToken) {
      navigate('/dashboard');
    }
  }, [token, requireAuth, navigate, path]);

  // Prevent layout shifts or raw viewing of guarded layout
  if (requireAuth && !activeToken) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!requireAuth && activeToken) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
