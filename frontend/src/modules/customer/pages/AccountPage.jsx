import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { BottomNav } from '../components/BottomNav';
import { ReferEarnModal } from '../components/ReferEarnModal';
import { EliteModal } from '../components/EliteModal';
import {
  User,
  Crown,
  MapPin,
  Heart,
  Gift,
  HelpCircle,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Sparkles,
  Store
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AccountPage = () => {
  const navigate = useNavigate();
  const {
    user,
    logout,
    currentLocation,
    favoriteSalonIds,
    setIsReferModalOpen,
    setIsEliteModalOpen
  } = useCustomer();

  const handleLogoutOrLogin = () => {
    if (user.isLoggedIn) {
      logout();
    } else {
      navigate('/customer/auth');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-20 mx-auto border-x border-purple-200/50 flex flex-col justify-between overflow-x-hidden box-border"
    >
      {/* Compact Header Profile Summary */}
      <header className="bg-stone-900 text-white px-4 pt-4 pb-3.5 rounded-b-2xl shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-brand-maroon/25 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-stone-950 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {user.name ? user.name.charAt(0) : 'U'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight truncate">
                {user.name || 'InstaaTrim Guest'}
              </h1>
              {user.isElite && (
                <span className="bg-amber-400 text-stone-950 font-black text-[8.5px] px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5 fill-stone-950" />
                  Elite
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400 leading-tight mt-0.5">{user.phone ? `+91 ${user.phone}` : 'Sign in to access perks'}</p>
            <p className="text-[10px] text-stone-400 truncate leading-tight">{user.email || 'guest@instatrim.com'}</p>
          </div>
        </div>

        {/* Elite VIP Banner in Account - Compact */}
        <div
          onClick={() => setIsEliteModalOpen(true)}
          className="mt-3 bg-stone-800/90 rounded-xl p-2.5 border border-amber-400/25 flex items-center justify-between cursor-pointer hover:bg-stone-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-300 block leading-tight">InstaaTrim Elite Club</span>
              <p className="text-[9.5px] text-stone-300 leading-tight">Enjoy 10% Extra OFF on salon services</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        </div>
      </header>

      {/* Account Menu Items */}
      <main className="p-3.5 flex-1 space-y-3">
        {/* Quick Shortcut Tiles - Compact */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div
            onClick={() => navigate('/customer/bookings')}
            className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-brand-maroon flex items-center justify-center mx-auto mb-1">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10.5px] font-bold text-stone-800 block">Bookings</span>
          </div>

          <div
            onClick={() => navigate('/customer/salons')}
            className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-1">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10.5px] font-bold text-stone-800 block">
              Saved ({favoriteSalonIds.length})
            </span>
          </div>

          <div
            onClick={() => setIsReferModalOpen(true)}
            className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10.5px] font-bold text-stone-800 block">Refer &amp; Earn</span>
          </div>
        </div>

        {/* Detailed Options Group - Compact */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden text-xs">
          {/* Salon Partner Portal */}
          <div
            onClick={() => navigate('/salon')}
            className="p-3 flex items-center justify-between cursor-pointer bg-purple-50/70 hover:bg-purple-100/70 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-3.5 h-3.5 text-brand-maroon" />
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-stone-900 text-xs">Salon Partner App</p>
                  <span className="text-[8px] bg-brand-maroon text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                    Partner
                  </span>
                </div>
                <p className="text-[10px] text-stone-500">Manage Luxe Glow bookings, menu &amp; instant seats</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-purple-700" />
          </div>

          {/* Saved Addresses */}
          <div
            onClick={() => navigate('/customer/location')}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-brand-maroon" />
              <div>
                <p className="font-bold text-stone-900 text-xs">Delivery / Salon Location</p>
                <p className="text-[10px] text-stone-500">{currentLocation?.area || 'South Tukoganj'}</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </div>

          {/* Customer Support */}
          <div
            onClick={() => alert('Customer Care: support@instatrim.com | Toll-Free: 1800-200-8899')}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-3.5 h-3.5 text-brand-maroon" />
              <div>
                <p className="font-bold text-stone-900 text-xs">Customer Support &amp; FAQs</p>
                <p className="text-[10px] text-stone-500">Instant chat &amp; booking support</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </div>

          {/* Privacy & Policies */}
          <div
            onClick={() => alert('InstaaTrim 100% Certified Partner Salons & Verified Professionals')}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-3.5 h-3.5 text-brand-maroon" />
              <div>
                <p className="font-bold text-stone-900 text-xs">Safety &amp; Privacy Policy</p>
                <p className="text-[10px] text-stone-500">Hygiene guidelines &amp; data security</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </div>
        </div>

        {/* Login / Logout action */}
        <button
          onClick={handleLogoutOrLogin}
          className="w-full py-2.5 bg-white border border-stone-300 rounded-xl font-bold text-xs text-stone-700 hover:bg-stone-50 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5 text-stone-500" />
          <span>{user.isLoggedIn ? 'Log Out of InstaaTrim' : 'Log In / Register'}</span>
        </button>
      </main>

      <BottomNav />
      <ReferEarnModal />
      <EliteModal />
    </motion.div>
  );
};
