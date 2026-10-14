import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Store, Sparkles, Calendar, User, ShoppingBag, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const { cartItems, cartSummary, setIsCartOpen } = useCustomer();

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
    <>
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="lg:hidden fixed bottom-[calc(68px+env(safe-area-inset-bottom))] left-0 right-0 w-full max-w-[480px] mx-auto z-40 px-4"
          >
            <div 
              onClick={() => setIsCartOpen(true)}
              className="bg-brand-maroon text-white rounded-xl shadow-lg p-3 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center relative">
                  <ShoppingBag className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-white/80 font-medium">Cart Subtotal</p>
                  <p className="text-sm font-bold">₹{cartSummary.subtotal}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 font-semibold text-[13px]">
                <span>View Cart</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto bg-white/95 backdrop-blur-md border-t border-stone-200/90 z-50 shadow-nav px-3 pt-2 box-border pb-[max(0.75rem,env(safe-area-inset-bottom))]"
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
    </>
  );
};
