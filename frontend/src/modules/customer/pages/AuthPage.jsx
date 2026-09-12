import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useCustomer();

  const [isOtpScreen, setIsOtpScreen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(13);

  const otpInputsRef = useRef([]);

  useEffect(() => {
    let timer;
    if (isOtpScreen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpScreen, countdown]);

  const handlePhoneChange = (val) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
    }
  };


  const handleContinue = () => {
    if (phoneNumber.length === 10) {
      setIsOtpScreen(true);
      setCountdown(13);
      setTimeout(() => {
        if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
      }, 150);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanDigit = value.slice(-1).replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanDigit;
    setOtpDigits(newDigits);

    if (cleanDigit && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (cleanDigit && index === 3 && newDigits.every((d) => d !== '')) {
      setTimeout(() => {
        login(phoneNumber || '7000792773');
        navigate('/customer');
      }, 400);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleSkip = () => {
    navigate('/customer');
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
          {isOtpScreen ? (
            <button
              aria-label="Go Back"
              onClick={() => setIsOtpScreen(false)}
              className="p-1 rounded-full text-stone-700 hover:text-black active:scale-95 transition-all"
              type="button"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>
          ) : (
            <div></div>
          )}

          {!isOtpScreen && (
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
        <div className="flex-1 flex flex-col justify-start pt-4">
          {/* Brand Logo Header - InstaaTrim */}
          <div
            className="mb-5 cursor-pointer flex items-center gap-2.5"
            data-purpose="brand-logo"
            onClick={() => setIsOtpScreen(!isOtpScreen)}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-maroon to-purple-600 flex items-center justify-center text-white shadow-xs">
              <span className="font-serif font-black text-sm">IT</span>
            </div>
            <h1 className="text-2xl tracking-tight select-none font-serif">
              <span className="text-stone-900 font-bold">Instaa</span>
              <span className="text-brand-maroon font-black">Trim</span>
            </h1>
          </div>

          <AnimatePresence mode="wait">
            {!isOtpScreen ? (
              /* Phone Number View */
              <motion.section
                key="phone-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col"
              >
                <h2 className="text-base font-bold text-stone-900 mb-3">
                  Enter your 10-digit phone number
                </h2>

                {/* Phone Input */}
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
                    />
                  </div>
                </div>


                {/* Continue CTA */}
                <button
                  disabled={phoneNumber.length !== 10}
                  onClick={handleContinue}
                  className={`w-full py-3 mt-2 rounded-xl font-bold text-xs shadow-sm transition-all duration-200 ${
                    phoneNumber.length === 10
                      ? 'bg-brand-maroon hover:bg-brand-darkMaroon text-white cursor-pointer active:scale-98'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                  type="button"
                >
                  Continue
                </button>
              </motion.section>
            ) : (
              /* OTP View */
              <motion.section
                key="otp-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col"
              >
                <h2 className="text-base font-bold text-stone-900 mb-1">Enter OTP</h2>

                {/* Notification Subtitle */}
                <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                  We've sent a 4 digit code to{' '}
                  <span className="font-bold text-stone-900">{phoneNumber || '7000792773'}</span>
                </p>

                {/* 4-Digit OTP Boxes - Compact */}
                <div className="flex items-center gap-3 mb-4" data-purpose="otp-input-group">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputsRef.current[index] = el)}
                      className="otp-box w-12 h-12 text-center text-lg font-bold rounded-xl border border-stone-300 bg-white focus:bg-white focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon focus:outline-none transition-all shadow-none"
                      maxLength={1}
                      type="number"
                      value={otpDigits[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                  ))}
                </div>

                {/* Status & Timer */}
                <div className="flex items-center text-xs text-stone-700 font-medium mb-1 space-x-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-600" />
                  <span>Auto verifying OTP</span>
                  <span className="text-stone-500 pl-1">
                    Retry in <span className="font-bold text-stone-800">{countdown}s</span>
                  </span>
                </div>

                <p className="text-[11px] text-stone-400">
                  Kindly check if mobile number entered is correct
                </p>

                {/* Quick Auto-Fill */}
                <div className="mt-6 pt-3 border-t border-stone-300/50 text-center">
                  <button
                    onClick={() => {
                      setOtpDigits(['1', '2', '3', '4']);
                      setTimeout(() => {
                        login(phoneNumber || '7000792773');
                        navigate('/customer');
                      }, 250);
                    }}
                    className="text-xs text-brand-maroon font-bold hover:underline"
                  >
                    Quick Auto-Fill (1234) &amp; Verify
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
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
