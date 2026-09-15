import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../shared/services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

// Salon partners previously reached the dashboard directly from the
// customer app's "Salon Partner App" tile with no credential check at
// all — /salon was open to anyone. This is the real gate: email +
// password against each salon's partnerLoginId/partnerPassword,
// checked in shared/services/api.js's salons.login, which sets the
// partnerSession that SalonRoutes now requires for every other route.
export const SalonLoginPage = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = loginId.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.salons.login(loginId.trim(), password);
      navigate('/salon');
    } catch (err) {
      setError(err.message || 'Could not log in. Please check your details and try again.');
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
      <main className="w-full max-w-[480px] min-w-0 min-h-screen flex flex-col justify-between px-5 pt-3 pb-6 relative border-x border-purple-200/50 box-border">
        {/* Top Navigation */}
        <header className="w-full flex items-center justify-between min-h-[36px]">
          <button
            aria-label="Back to customer app"
            onClick={() => navigate('/customer')}
            className="p-1 -ml-1 rounded-full text-stone-700 hover:text-black active:scale-95 transition-all"
            type="button"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <span className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider">Partner Portal</span>
        </header>

        {/* Content Container — vertically centered like the customer auth screen */}
        <div className="flex-1 flex flex-col justify-center pb-10">
          {/* Brand Logo Header */}
          <div className="mb-5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-900 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <span className="font-serif font-black text-sm">IT</span>
            </div>
            <h1 className="text-2xl tracking-tight select-none font-serif">
              <span className="text-stone-900 font-bold">Instaa</span>
              <span className="text-brand-maroon font-black">Trim</span>
              <span className="ml-1.5 align-middle text-[10px] font-sans font-bold text-white bg-stone-900 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Partner
              </span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            <h2 className="text-base font-bold text-stone-900 mb-3">Log in to your salon dashboard</h2>

            <div className="space-y-2.5">
              <div>
                <label htmlFor="partner-login-id" className="text-[10.5px] font-bold text-stone-600 block mb-1">
                  Registered Email
                </label>
                <input
                  id="partner-login-id"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="yoursalon@instaatrim.com"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/90 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-medium text-xs transition-all outline-none"
                />
              </div>

              <div>
                <label htmlFor="partner-password" className="text-[10.5px] font-bold text-stone-600 block mb-1">
                  Password
                </label>
                <div className="flex items-center border border-stone-300 focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon bg-white/90 rounded-xl px-3.5 py-2.5 transition-all">
                  <input
                    id="partner-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-0 p-0 text-stone-900 placeholder-stone-400 font-medium text-xs focus:ring-0 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-stone-400 hover:text-stone-700 shrink-0"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-700 leading-snug">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3 mt-4 rounded-xl font-bold text-xs shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
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
          </form>

          <button
            onClick={() => navigate('/salon/onboarding')}
            className="mt-4 text-center text-xs text-stone-600"
            type="button"
          >
            New salon partner?{' '}
            <span className="text-brand-maroon font-bold hover:underline">Start Partner Onboarding</span>
          </button>

          {/* Demo environment helper — this build has no real partner
              registration yet, so every demo salon's credentials are
              surfaced plainly rather than hidden behind a "magic" auto-fill
              shortcut. */}
          <div className="mt-6 pt-4 border-t border-stone-300/50">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Demo Partner Accounts
            </p>
            <div className="space-y-1">
              {[
                { name: 'Luxe Glow Salon & Spa', email: 'luxeglow@instaatrim.com' },
                { name: 'Enrich Glamour Studio', email: 'enrich@instaatrim.com' },
                { name: 'Aura Wellness & Spa', email: 'aura@instaatrim.com' },
                { name: 'The Glam Bar & Nail Studio', email: 'glambar@instaatrim.com' }
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => fillDemo(demo.email)}
                  className="w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg bg-white/70 border border-stone-200 hover:bg-white transition-colors"
                >
                  <span className="text-[10.5px] font-semibold text-stone-700">{demo.name}</span>
                  <span className="text-[9.5px] text-stone-400 font-mono">{demo.email}</span>
                </button>
              ))}
            </div>
            <p className="text-[9.5px] text-stone-400 mt-1.5">Password for every demo account: <span className="font-mono">demo1234</span></p>
          </div>
        </div>
      </main>
    </motion.div>
  );
};
