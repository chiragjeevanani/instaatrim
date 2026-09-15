import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../shared/services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export const SalonLoginPage = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = loginId.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.salons.login(loginId.trim(), password);
      navigate('/salon');
    } catch (err) {
      setError(err.message || 'Incorrect email/mobile or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (email) => {
    setLoginId(email);
    setPassword('demo1234');
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full min-h-screen bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] text-stone-900 flex justify-center antialiased select-none overflow-x-hidden"
    >
      <main className="w-full max-w-[480px] min-w-0 min-h-screen bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] flex flex-col justify-between px-5 pt-3 pb-6 relative border-x border-purple-200/50 box-border">
        {/* Top Navigation */}
        <header className="w-full flex items-center justify-between min-h-[36px]">
          <button
            aria-label="Go Back"
            onClick={() => navigate('/customer')}
            className="p-1 -ml-1 rounded-full text-stone-700 hover:text-black active:scale-95 transition-all"
            type="button"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>

          <button
            onClick={() => navigate('/salon/register')}
            className="text-brand-maroon font-bold tracking-wide text-xs px-2 py-1 active:opacity-70 transition-opacity"
            type="button"
          >
            REGISTER SALON
          </button>
        </header>

        {/* Content Container — vertically centered exactly like Customer Auth */}
        <div className="flex-1 flex flex-col justify-center pb-10">
          {/* Brand Logo Header */}
          <div className="mb-5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-maroon to-purple-600 flex items-center justify-center text-white shadow-xs">
              <span className="font-serif font-black text-sm">IT</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl tracking-tight select-none font-serif">
                <span className="text-stone-900 font-bold">Instaa</span>
                <span className="text-brand-maroon font-black">Trim</span>
              </h1>
              <span className="text-[9.5px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-900 text-white">
                Partner
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            <h2 className="text-base font-bold text-stone-900 mb-3">
              Partner Portal Login
            </h2>

            {/* Email / Mobile Input */}
            <div className="relative w-full mb-2.5">
              <div className="flex items-center border border-stone-300 focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon bg-white/90 rounded-xl px-3.5 py-2.5 transition-all">
                <input
                  type="text"
                  autoComplete="username"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Registered Email or Mobile"
                  className="w-full bg-transparent border-0 p-0 text-stone-900 placeholder-stone-400 font-medium text-xs focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative w-full mb-3">
              <div className="flex items-center border border-stone-300 focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon bg-white/90 rounded-xl px-3.5 py-2.5 transition-all">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Password"
                  className="w-full bg-transparent border-0 p-0 text-stone-900 placeholder-stone-400 font-medium text-xs focus:ring-0 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-stone-400 hover:text-stone-700 shrink-0 ml-1.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-700 leading-snug">{error}</p>
              </div>
            )}

            {/* Login CTA */}
            <button
              disabled={!canSubmit}
              type="submit"
              className={`w-full py-3 mt-1 rounded-xl font-bold text-xs shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                canSubmit
                  ? 'bg-brand-maroon hover:bg-brand-darkMaroon text-white cursor-pointer active:scale-98'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>

            {/* Registration Link */}
            <p className="mt-4 text-center text-xs text-stone-600">
              New salon partner?{' '}
              <button
                type="button"
                onClick={() => navigate('/salon/register')}
                className="text-brand-maroon font-bold hover:underline"
              >
                Register your salon
              </button>
            </p>

            {/* Quick Demo Autofill (Clean 1-liner like customer AuthPage) */}
            <div className="mt-6 pt-3 border-t border-stone-300/50 text-center">
              <span className="text-[11px] text-stone-400 mr-1.5">Demo fill:</span>
              <button
                type="button"
                onClick={() => fillDemo('luxeglow@instaatrim.com')}
                className="text-xs text-brand-maroon font-bold hover:underline mr-2"
              >
                Luxe Glow
              </button>
              <span className="text-stone-300 mr-2">•</span>
              <button
                type="button"
                onClick={() => fillDemo('enrich@instaatrim.com')}
                className="text-xs text-brand-maroon font-bold hover:underline mr-2"
              >
                Enrich
              </button>
              <span className="text-stone-300 mr-2">•</span>
              <button
                type="button"
                onClick={() => fillDemo('aura@instaatrim.com')}
                className="text-xs text-brand-maroon font-bold hover:underline"
              >
                Aura Spa
              </button>
            </div>
          </form>
        </div>

        {/* Footer Terms */}
        <footer className="w-full text-center text-[10.5px] text-stone-500 leading-relaxed px-2 pt-4">
          By continuing, you agree to our{' '}
          <a className="text-brand-maroon font-semibold hover:underline" href="#terms">
            Terms &amp; Conditions
          </a>{' '}
          and{' '}
          <a className="text-brand-maroon font-semibold hover:underline" href="#privacy">
            Privacy Policy
          </a>
        </footer>
      </main>
    </motion.div>
  );
};
