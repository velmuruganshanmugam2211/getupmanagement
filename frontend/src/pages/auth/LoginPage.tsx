import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('velu@getupdigital.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to app
  React.useEffect(() => {
    if (isAuthenticated) {
      const destination = (location.state as any)?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(email.trim(), password.trim());
      const destination = (location.state as any)?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickSwitch = (demoEmail: string, roleName: UserRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#0B0F17] relative overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#008000]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl p-8 shadow-xl shadow-black/5">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#008000] text-white shadow-md shadow-[#008000]/20 mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Sign in to GETUP MANAGEMENT
            </h1>
            {/* <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              Internal Marketing Agency Operations & Management Suite
            </p> */}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                Agency Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMessage(null); }}
                  placeholder="name@getupdigital.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#008000] focus:ring-1 focus:ring-[#008000] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Password
                </label>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Default: <code className="font-mono text-[#008000]">password123</code>
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
                  placeholder="••••••••"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#008000] focus:ring-1 focus:ring-[#008000] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#008000] focus:ring-[#008000]"
                />
                <span className="text-[#64748B] dark:text-[#94A3B8]">Remember session</span>
              </label>

              <span className="text-[#008000] text-[11px] font-semibold">
                Protected by JWT + bcrypt
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center mt-2"
              isLoading={isSubmitting}
            >
              Sign In to Agency Suite
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              <Sparkles className="w-3 h-3 text-[#008000]" />
              <span>Quick Role Demo Switcher</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => quickSwitch('velu@getupdigital.com', 'Super Admin')}
                className="text-left px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#008000] dark:hover:border-[#008000] bg-[#F8FAFC] dark:bg-[#1E293B]/50 transition-all text-[11px]"
              >
                <div className="font-semibold text-[#0F172A] dark:text-white">Velu</div>
                <div className="text-[10px] text-[#008000]">Super Admin</div>
              </button>

              <button
                type="button"
                onClick={() => quickSwitch('suresh@getupdigital.com', 'Admin')}
                className="text-left px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#008000] dark:hover:border-[#008000] bg-[#F8FAFC] dark:bg-[#1E293B]/50 transition-all text-[11px]"
              >
                <div className="font-semibold text-[#0F172A] dark:text-white">Suresh</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400">Admin</div>
              </button>

              <button
                type="button"
                onClick={() => quickSwitch('arun@getupdigital.com', 'Digital Marketer')}
                className="text-left px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#008000] dark:hover:border-[#008000] bg-[#F8FAFC] dark:bg-[#1E293B]/50 transition-all text-[11px]"
              >
                <div className="font-semibold text-[#0F172A] dark:text-white">Arun</div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400">Digital Marketer</div>
              </button>

              <button
                type="button"
                onClick={() => quickSwitch('karthik@getupdigital.com', 'Video Editor')}
                className="text-left px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#008000] dark:hover:border-[#008000] bg-[#F8FAFC] dark:bg-[#1E293B]/50 transition-all text-[11px]"
              >
                <div className="font-semibold text-[#0F172A] dark:text-white">Karthik</div>
                <div className="text-[10px] text-purple-600 dark:text-purple-400">Video Editor</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-4 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          GETUP OS v2.6 &bull; Secure Internal Access Only
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
