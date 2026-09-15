import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { LayoutDashboard, Calendar, Scissors, BarChart3, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const SalonBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { metrics, isAnyModalOpen } = useSalon();

  if (isAnyModalOpen) return null;

  const currentPath = location.pathname;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/salon',
      icon: LayoutDashboard
    },
    {
      id: 'bookings',
      label: 'Bookings',
      path: '/salon/bookings',
      icon: Calendar,
      badge: metrics.inServiceTodayCount + metrics.checkedInTodayCount + metrics.confirmedTodayCount
    },
    {
      id: 'services',
      label: 'Services',
      path: '/salon/services',
      icon: Scissors
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: '/salon/analytics',
      icon: BarChart3
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/salon/profile',
      icon: User
    }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto bg-white/95 backdrop-blur-md border-t border-purple-200/50 z-50 shadow-nav px-3 py-1.5 box-border"
      data-purpose="salon-navigation"
    >
      <div className="flex items-center justify-between relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/salon'
              ? currentPath === '/salon' || currentPath === '/salon/'
              : currentPath.startsWith(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative cursor-pointer ${
                isActive ? 'text-rose-950 font-semibold' : 'text-stone-400 hover:text-stone-700 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'stroke-[2.2] scale-105 text-rose-900' : 'stroke-[1.6]'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-900 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-none mt-1 tracking-tight ${isActive ? 'text-rose-950 font-bold' : 'text-stone-500'}`}>
                {item.label}
              </span>
              <div className="h-1.5 flex items-center justify-center mt-0.5">
                {isActive && (
                  <motion.div
                    layoutId="salonBottomNavIndicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="w-1.5 h-1.5 bg-rose-900 rounded-full"
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
