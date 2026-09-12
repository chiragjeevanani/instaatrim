import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto bg-white/95 backdrop-blur-md border-t border-stone-200 z-50 shadow-nav px-2 py-1 box-border"
      data-purpose="app-navigation"
    >
      <div className="flex items-center justify-between relative">
        {/* Home Tab */}
        <button
          onClick={() => navigate('/customer')}
          className={`flex flex-col items-center justify-center flex-1 py-0.5 transition-colors ${
            currentPath === '/customer' || currentPath === '/customer/'
              ? 'text-brand-maroon'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Home className="w-4 h-4 stroke-[2.2] mb-0.5" />
          <span className="text-[9.5px] font-bold leading-none">Home</span>
          {(currentPath === '/customer' || currentPath === '/customer/') && (
            <div className="w-1 h-1 bg-brand-maroon rounded-full mt-0.5" />
          )}
        </button>

        {/* Sokora Skincare Tab */}
        <button
          onClick={() => navigate('/customer/skincare')}
          className={`flex flex-col items-center justify-center flex-1 py-0.5 transition-colors ${
            currentPath === '/customer/skincare'
              ? 'text-brand-maroon'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <span className="text-[7.5px] font-bold tracking-widest text-stone-400 uppercase leading-none">SOKORA</span>
          <span className="text-[10px] font-serif font-bold text-stone-800 leading-tight mt-0.5">Skincare</span>
          {currentPath === '/customer/skincare' && (
            <div className="w-1 h-1 bg-brand-maroon rounded-full mt-0.5" />
          )}
        </button>

        {/* Center Raised Floating Feature: K-Beauty Trends */}
        <div className="flex-1 flex justify-center -mt-5">
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/customer/trends')}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-200 via-[#eaddf3] to-purple-100 p-0.5 shadow-md border-2 border-white flex flex-col items-center justify-center"
            data-purpose="trend-center-button"
          >
            <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center p-0.5">
              <span className="text-[8px] font-serif font-bold text-stone-800 leading-none">K-Beauty</span>
              <span className="text-[7.5px] text-stone-600 font-medium leading-none mt-0.5">Trends</span>
            </div>
          </motion.button>
        </div>

        {/* Bookings Tab */}
        <button
          onClick={() => navigate('/customer/bookings')}
          className={`flex flex-col items-center justify-center flex-1 py-0.5 transition-colors ${
            currentPath === '/customer/bookings'
              ? 'text-brand-maroon'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calendar className="w-[18px] h-[18px] stroke-[1.6]" />
          <span className="text-[9.5px] font-medium leading-none mt-1">Bookings</span>
          {currentPath === '/customer/bookings' && (
            <div className="w-1 h-1 bg-brand-maroon rounded-full mt-0.5" />
          )}
        </button>

        {/* Account Tab */}
        <button
          onClick={() => navigate('/customer/account')}
          className={`flex flex-col items-center justify-center flex-1 py-0.5 transition-colors ${
            currentPath === '/customer/account'
              ? 'text-brand-maroon'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-[18px] h-[18px] stroke-[1.6]" />
          <span className="text-[9.5px] font-medium leading-none mt-1">Account</span>
          {currentPath === '/customer/account' && (
            <div className="w-1 h-1 bg-brand-maroon rounded-full mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
