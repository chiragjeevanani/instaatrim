import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, User, Mail, Calendar } from 'lucide-react';
import { requestFirebaseToken } from '../../../shared/lib/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useCustomer();

  // Steps: 'phone' | 'otp' | 'profile'
  const [step, setStep] = useState(() => sessionStorage.getItem('instaatrim_auth_step') || 'phone');
  const [phoneNumber, setPhoneNumber] = useState(() => sessionStorage.getItem('instaatrim_auth_phone') || '');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(() => {
    const saved = sessionStorage.getItem('instaatrim_auth_countdown');
    return saved ? parseInt(saved, 10) : 60;
  });
  const [isNewUser, setIsNewUser] = useState(() => sessionStorage.getItem('instaatrim_auth_isNewUser') === 'true');

  // Profile form (Step 3 — for new users)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    gender: 'female',
    dob: '',
  });

  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Saved token after OTP verify (needed for profile save)
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('instaatrim_auth_token') || '');

  const otpInputsRef = useRef([]);

  // Persist state changes
  useEffect(() => {
    sessionStorage.setItem('instaatrim_auth_step', step);
    sessionStorage.setItem('instaatrim_auth_phone', phoneNumber);
    sessionStorage.setItem('instaatrim_auth_isNewUser', isNewUser);
    sessionStorage.setItem('instaatrim_auth_token', authToken);
  }, [step, phoneNumber, isNewUser, authToken]);

  useEffect(() => {
    sessionStorage.setItem('instaatrim_auth_countdown', countdown.toString());
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const clearAuthState = () => {
    sessionStorage.removeItem('instaatrim_auth_step');
    sessionStorage.removeItem('instaatrim_auth_phone');
    sessionStorage.removeItem('instaatrim_auth_countdown');
    sessionStorage.removeItem('instaatrim_auth_isNewUser');
    sessionStorage.removeItem('instaatrim_auth_token');
  };

  const handlePhoneChange = (val) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
      setError('');
    }
  };

  // ── Step 1: Send OTP ──
  const handleContinue = async () => {
    if (phoneNumber.length !== 10) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

      setIsNewUser(data.isNewUser || false);
      setStep('otp');
      setCountdown(60);
      setTimeout(() => {
        if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
      }, 150);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = async (digits) => {
    const otpString = digits.join('');
    if (otpString.length < 4) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp: otpString }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');

      // Save token
      if (data.token) {
        localStorage.setItem('instaatrim_token', data.token);
        localStorage.setItem('instaatrim_customer', JSON.stringify(data.customer));

        // Request FCM token and save to backend
        requestFirebaseToken().then((fcmToken) => {
          if (fcmToken) {
            fetch(`${API_URL}/auth/save-fcm-token`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
              },
              body: JSON.stringify({ token: fcmToken, platform: 'web' })
            }).then(r => r.json()).then(res => {
              console.log('%c Firebase FCM Token: ', 'background: #222; color: #00FF00; font-size: 16px;', fcmToken);
              console.log('FCM Token Save Result:', res);
              if (res.success) {
                console.log('%c ✅ SUCCESSFULLY SAVED FCM TOKEN IN DATABASE!', 'background: green; color: white; font-size: 16px; font-weight: bold;');
                alert('✅ Firebase Notification Token saved successfully in Database!');
              }
            }).catch(console.error);
          }
        });
      }

      if (data.isNewUser || !data.customer?.name || data.customer?.name === 'Customer') {
        // New user → show profile completion form
        setIsNewUser(true);
        setStep('profile');
      } else {
        // Existing user → directly login
        clearAuthState();
        login(phoneNumber, data.customer?.name || 'Customer');
        navigate('/customer');
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtpDigits(['', '', '', '']);
      setTimeout(() => {
        if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanDigit = value.slice(-1).replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanDigit;
    setOtpDigits(newDigits);
    setError('');

    if (cleanDigit && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (cleanDigit && index === 3 && newDigits.every((d) => d !== '')) {
      setTimeout(() => handleVerifyOtp(newDigits), 300);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtpDigits(['', '', '', '']);
    setError('');
    await handleContinue();
  };

  // ── Step 3: Save Profile (new users) ──
  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const token = authToken || localStorage.getItem('instaatrim_token');
      const res = await fetch(`${API_URL}/customers/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          email: profileForm.email.trim() || undefined,
          gender: profileForm.gender,
          dob: profileForm.dob || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not save profile');

      // Update stored customer
      localStorage.setItem('instaatrim_customer', JSON.stringify(data.customer));
      clearAuthState();
      login(phoneNumber, data.customer?.name || profileForm.name);
      navigate('/customer');
    } catch (err) {
      setError(err.message || 'Could not save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    clearAuthState();
    navigate('/customer');
  };

  const GENDER_OPTIONS = ['female', 'male', 'other'];

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
          {step !== 'phone' ? (
            <button
              aria-label="Go Back"
              onClick={() => {
                setError('');
                setOtpDigits(['', '', '', '']);
                setStep(step === 'profile' ? 'otp' : 'phone');
              }}
              className="p-1 rounded-full text-stone-700 hover:text-black active:scale-95 transition-all"
              type="button"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>
          ) : (
            <div></div>
          )}

          {step === 'phone' && (
            <button
              onClick={handleSkip}
              className="text-brand-maroon font-bold tracking-wide text-xs px-2 py-1 active:opacity-70 transition-opacity"
              type="button"
            >
              SKIP
            </button>
          )}
        </header>

        {/* Content Container */}
        <div className="flex-1 flex flex-col justify-center pb-10">

          {/* Brand Logo */}
          <div className="mb-5 flex items-center justify-center gap-2.5 w-full">
            <img src="/DrimStylelogo.png" alt="DrimStyle — Save Money Save Time" className="h-10 w-36 object-cover object-center" />
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step 1: Phone ── */}
            {step === 'phone' && (
              <motion.section
                key="phone-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col"
              >
                <h2 className="text-base font-bold text-stone-900 mb-1">Welcome to DrimStyle</h2>
                <p className="text-xs text-stone-500 mb-4">Enter your mobile number to login or sign up</p>

                <div className="relative w-full mb-3">
                  <div className="flex items-center border border-stone-300 focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon bg-white/90 rounded-xl px-3.5 py-2.5 transition-all">
                    <span className="text-stone-800 font-semibold text-xs pr-2.5 select-none">+91</span>
                    <div className="h-4 w-[1px] bg-stone-300 mr-2.5"></div>
                    <input
                      autoComplete="tel-national"
                      className="w-full bg-transparent border-0 p-0 text-stone-900 placeholder-stone-400 font-medium text-xs focus:ring-0 focus:outline-none"
                      inputMode="numeric"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="Mobile Number"
                      type="tel"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs mb-2 font-medium">{error}</p>}

                <button
                  disabled={phoneNumber.length !== 10 || isLoading}
                  onClick={handleContinue}
                  className={`w-full py-3 mt-2 rounded-xl font-bold text-xs shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    phoneNumber.length === 10 && !isLoading
                      ? 'bg-brand-maroon hover:bg-brand-darkMaroon text-white cursor-pointer active:scale-98'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                  type="button"
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</> : 'Continue'}
                </button>
              </motion.section>
            )}

            {/* ── Step 2: OTP ── */}
            {step === 'otp' && (
              <motion.section
                key="otp-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center text-center"
              >
                <h2 className="text-base font-bold text-stone-900 mb-1 w-full">
                  {isNewUser ? 'Verify & Sign Up' : 'Enter OTP'}
                </h2>
                <p className="text-xs text-stone-600 mb-4 leading-relaxed w-full">
                  We've sent a 4 digit code to{' '}
                  <span className="font-bold text-stone-900">{phoneNumber}</span>
                </p>

                <div className="flex justify-center items-center gap-3 mb-4 w-full" data-purpose="otp-input-group">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputsRef.current[index] = el)}
                      className={`otp-box w-12 h-12 text-center text-lg font-bold rounded-xl border bg-white focus:bg-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon focus:outline-none transition-all ${
                        error ? 'border-red-400' : 'border-stone-300'
                      }`}
                      maxLength={1}
                      type="number"
                      value={otpDigits[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {error && <p className="text-red-500 text-xs mb-2 font-medium w-full">{error}</p>}

                <div className="flex justify-center items-center text-xs text-stone-700 font-medium mb-1 space-x-1.5 w-full">
                  {isLoading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Verifying...</span></>
                    : <><Loader2 className="w-3.5 h-3.5 animate-spin text-stone-500" /><span>Auto verifying OTP</span></>
                  }
                </div>

                <p className="text-[11px] text-stone-400 w-full">Kindly check if mobile number entered is correct</p>

                <div className="mt-6 pt-3 border-t border-stone-300/50 text-center">
                  {countdown === 0 ? (
                    <button onClick={handleResendOtp} disabled={isLoading} className="text-xs text-brand-maroon font-bold hover:underline">
                      Resend OTP
                    </button>
                  ) : (
                    <p className="text-xs text-stone-400">
                      Didn't receive OTP? Resend in <span className="font-bold text-stone-600">{countdown}s</span>
                    </p>
                  )}
                </div>
              </motion.section>
            )}

            {/* ── Step 3: Profile Completion (new users only) ── */}
            {step === 'profile' && (
              <motion.section
                key="profile-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col"
              >
                <h2 className="text-base font-bold text-stone-900 mb-1">Complete Your Profile</h2>
                <p className="text-xs text-stone-500 mb-5">Tell us a bit about yourself to get started</p>

                {/* Full Name */}
                <div className="mb-3">
                  <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border border-stone-300 focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon bg-white/90 rounded-xl px-3.5 py-2.5 transition-all gap-2">
                    <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      className="w-full bg-transparent border-0 p-0 text-stone-900 placeholder-stone-400 font-medium text-xs focus:ring-0 focus:outline-none"
                      placeholder="Enter your full name"
                      value={profileForm.name}
                      onChange={(e) => { setProfileForm(f => ({ ...f, name: e.target.value })); setError(''); }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="text-xs font-semibold text-stone-700 mb-1.5 block">Email Address <span className="text-stone-400 font-normal">(optional)</span></label>
                  <div className="flex items-center border border-stone-300 focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon bg-white/90 rounded-xl px-3.5 py-2.5 transition-all gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <input
                      type="email"
                      className="w-full bg-transparent border-0 p-0 text-stone-900 placeholder-stone-400 font-medium text-xs focus:ring-0 focus:outline-none"
                      placeholder="Enter your email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="mb-3">
                  <label className="text-xs font-semibold text-stone-700 mb-1.5 block">Gender</label>
                  <div className="flex gap-2">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setProfileForm(f => ({ ...f, gender: g }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${
                          profileForm.gender === g
                            ? 'border-brand-maroon bg-brand-maroon/10 text-brand-maroon'
                            : 'border-stone-300 text-stone-600 bg-white/80'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                    Date of Birth <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <div className="flex items-center border border-stone-300 focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon bg-white/90 rounded-xl px-3.5 py-2.5 transition-all gap-2">
                    <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <input
                      type="date"
                      className="w-full bg-transparent border-0 p-0 text-stone-900 font-medium text-xs focus:ring-0 focus:outline-none"
                      value={profileForm.dob}
                      onChange={(e) => setProfileForm(f => ({ ...f, dob: e.target.value }))}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs mb-3 font-medium">{error}</p>}

                {/* Save Button */}
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading || !profileForm.name.trim()}
                  className={`w-full py-3 rounded-xl font-bold text-xs shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    !isLoading && profileForm.name.trim()
                      ? 'bg-brand-maroon hover:bg-brand-darkMaroon text-white cursor-pointer active:scale-98'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                  type="button"
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save & Continue'}
                </button>

                {/* Skip profile */}
                <button
                  onClick={() => { clearAuthState(); login(phoneNumber, 'Customer'); navigate('/customer'); }}
                  className="mt-3 text-center text-xs text-stone-400 hover:text-stone-600 w-full"
                  type="button"
                >
                  Skip for now
                </button>
              </motion.section>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Terms */}
        <footer className="w-full text-center text-[10.5px] text-stone-500 leading-relaxed px-2 pt-4">
          By continuing, you agree to our{' '}
          <a className="text-brand-maroon font-semibold hover:underline" href="#terms">Terms &amp; Conditions</a>{' '}
          and{' '}
          <a className="text-brand-maroon font-semibold hover:underline" href="#privacy">Privacy Policy</a>
        </footer>
      </main>
    </motion.div>
  );
};
