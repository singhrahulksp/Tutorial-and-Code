import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useBlog } from '../context/BlogContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { SEOHead } from '../components/SEOHead';
import {
  Shield,
  KeyRound,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, isAdminAuthenticated } = useBlog();
  const { navigate } = useRouter();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number | null>(null);

  // If already authenticated, redirect to /admin
  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimeLeft === null || lockoutTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimeLeft((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeLeft !== null && lockoutTimeLeft > 0) {
      setError(`Security cooldown active. Please wait ${lockoutTimeLeft}s.`);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await loginAdmin(password);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.reason || 'Authentication failed. Please verify your administrator passkey.');
        if (res.lockoutSeconds && res.lockoutSeconds > 0) {
          setLockoutTimeLeft(res.lockoutSeconds);
        }
      }
    } catch {
      setError('An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-100 dark:bg-[#070707] text-neutral-900 dark:text-neutral-100 p-4 sm:p-6 transition-colors duration-200">
      <SEOHead
        title="Admin Authentication | Tutorials and Code CMS"
        robots="noindex, nofollow"
      />

      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <button
          id="login-back-btn"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tutorials & Code
        </button>
        <ThemeToggle />
      </header>

      {/* Center Login Box */}
      <main className="max-w-md w-full mx-auto my-8">
        <div className="bg-white dark:bg-[#0f0f0f] p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xl font-mono mx-auto shadow-md">
              TC
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Tutorials & Code CMS Gateway
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Server-authoritative session authentication and rate-limited credential verification.
            </p>
          </div>

          {lockoutTimeLeft !== null && lockoutTimeLeft > 0 ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-spin" />
                <span>Security Lockout Active</span>
              </div>
              <p>
                Too many unsuccessful login attempts. Cooldown in progress: <strong>{lockoutTimeLeft}s</strong> remaining.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Admin Passkey
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="admin-passkey-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter secure master passkey..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all disabled:opacity-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                id="authenticate-session-btn"
                type="submit"
                disabled={isSubmitting || !password.trim()}
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Tier Badge */}
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Bcrypt Server Verification & Brute-Force Rate Limiting</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-400 dark:text-zinc-500 font-mono">
        Tutorials and Code Editorial Engine • Server-Authoritative Security
      </footer>

    </div>
  );
};
