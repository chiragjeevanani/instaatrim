import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Store, Sparkles, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/customer',
      icon: Home,
      exact: true
    },
    {
      id: 'salons',
      label: 'Salons',
      path: '/customer/salons',
      icon: Store
    },
    {
      id: 'offers',
      label: 'Offers',
      path: '/customer/trends', // Offers / Deals & curated trends
      icon: Sparkles
    },
    {
      id: 'bookings',
      label: 'Bookings',
      path: '/customer/bookings',
      icon: Calendar
    },
    {
      id: 'account',
      label: 'Account',
      path: '/customer/account',
      icon: User
    }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto bg-white/95 backdrop-blur-md border-t border-stone-200/90 z-50 shadow-nav px-3 py-2 box-border pb-3"
      data-purpose="app-navigation"
    >
      <div className="flex items-center justify-between relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? currentPath === '/customer' || currentPath === '/customer/'
            : currentPath.startsWith(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer relative ${
                isActive
                  ? 'text-brand-maroon font-semibold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
              <div className="h-2 flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="w-1.5 h-1.5 bg-brand-maroon rounded-full"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
