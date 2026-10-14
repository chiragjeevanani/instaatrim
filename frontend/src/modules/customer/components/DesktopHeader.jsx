import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { MapPin, ChevronDown, Search, Bell, ShoppingBag, User, Crown, Gift } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { CustomerNotificationsSheet } from './CustomerNotificationsSheet';

// Desktop-only (lg+) top navigation for the customer app. On phones the
// app keeps its TopBar + BottomNav; this header replaces both on wide
// screens so the layout reads like a website instead of a stretched phone.
const NAV_ITEMS = [
  { to: '/customer', label: 'Home', end: true },
  { to: '/customer/salons', label: 'Salons' },
  { to: '/customer/trends', label: 'Offers' },
  { to: '/customer/bookings', label: 'Bookings' }
];

export const DesktopHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    currentLocation,
    setIsReferModalOpen,
    setIsEliteModalOpen,
    cartItems,
    setIsCartOpen,
    notifications = [],
    user
  } = useCustomer();
  const [query, setQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Keep the search box in sync with the listing page's ?q= param
  const urlQuery = location.pathname.startsWith('/customer/salons') ? searchParams.get('q') || '' : null;
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  if (urlQuery !== null && urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const isLoggedIn = Boolean(user?.isLoggedIn);

  const runSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/customer/salons?q=${encodeURIComponent(trimmed)}` : '/customer/salons');
  };

  return (
    <>
      <header className="hidden lg:block sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-[0_1px_12px_rgba(46,16,101,0.04)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4 xl:gap-6">
          {/* Brand */}
          <button
            type="button"
            onClick={() => navigate('/customer')}
            className="shrink-0 cursor-pointer"
            aria-label="DrimStyle home"
          >
            <img src="/DrimStylelogo.png" alt="DrimStyle" className="h-11 w-[150px] object-cover object-center" />
          </button>

          {/* Primary nav */}
          <nav className="flex items-center gap-0.5 shrink-0">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                    isActive
                      ? 'text-brand-maroon bg-rose-50'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Location + search */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/customer/location')}
              className="flex items-center gap-1.5 shrink-0 max-w-[170px] px-2.5 h-10 rounded-xl hover:bg-stone-100/80 transition-colors cursor-pointer text-left"
              title="Change location"
            >
              <MapPin className="w-4 h-4 text-brand-maroon shrink-0" />
              <div className="hidden xl:block min-w-0 leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-[12.5px] font-bold text-stone-800 truncate">
                    {currentLocation?.area || 'Select location'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-500 shrink-0" />
                </div>
                {currentLocation?.landmark && (
                  <p className="text-[10.5px] text-stone-500 truncate">{currentLocation.landmark}</p>
                )}
              </div>
            </button>

            <form
              onSubmit={runSearch}
              className="flex-1 min-w-0 flex items-center h-10 px-3 rounded-xl bg-[#f3ebf8] border border-purple-200/60 focus-within:border-brand-maroon/40 focus-within:bg-white transition-colors"
            >
              <Search className="w-4 h-4 text-purple-600 mr-2 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search salons, services or treatments"
                aria-label="Search salons and services"
                className="flex-1 min-w-0 bg-transparent border-0 p-0 text-[13px] text-stone-800 placeholder:text-stone-500 focus:outline-none focus:ring-0"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsReferModalOpen(true)}
              className="hidden 2xl:flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#2e1065] text-purple-50 text-[12px] font-semibold hover:bg-[#3b1585] transition-colors cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-amber-300" />
              Refer &amp; Earn
            </button>

            <button
              type="button"
              onClick={() => setIsEliteModalOpen(true)}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px] font-bold transition-colors cursor-pointer ${
                user?.is_elite
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-stone-900'
                  : 'bg-[#1e1035] text-[#e1b670] hover:bg-[#2a1748]'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="font-serif">{user?.is_elite ? 'Elite Member' : 'Buy Elite'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNotifOpen(true)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-brand-maroon text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Cart"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-0.5 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-stone-900 text-[9px] font-extrabold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(isLoggedIn ? '/customer/account' : '/customer/auth')}
              className={`flex items-center gap-2 h-9 pl-1 pr-3 rounded-full border transition-colors cursor-pointer ${
                location.pathname.startsWith('/customer/account')
                  ? 'border-brand-maroon/40 bg-rose-50'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span className="w-7 h-7 rounded-full bg-brand-maroon text-white flex items-center justify-center text-[11px] font-bold">
                {isLoggedIn && user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </span>
              <span className="text-[12.5px] font-semibold text-stone-800 max-w-[90px] truncate">
                {isLoggedIn ? (user?.name?.split(' ')[0] || 'Account') : 'Sign in'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <CustomerNotificationsSheet isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

export const DesktopFooter = () => {
  const navigate = useNavigate();
  const links = [
    { label: 'About DrimStyle', to: '/' },
    { label: 'Find Salons', to: '/customer/salons' },
    { label: 'Offers & Trends', to: '/customer/trends' },
    { label: 'Skincare', to: '/customer/skincare' },
    { label: 'My Bookings', to: '/customer/bookings' },
    { label: 'Privacy Policy', to: '/customer/privacy-policy' },
    { label: 'Partner with us', to: '/salon/register' }
  ];

  return (
    <footer className="hidden lg:block border-t border-purple-100 bg-white/70">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src="/DrimStylelogo.png" alt="DrimStyle" className="h-9 w-[120px] object-cover object-center" />
          <span className="text-[12px] text-stone-500">© {new Date().getFullYear()} DrimStyle. Save money, save time.</span>
        </div>
        <nav className="flex items-center gap-5">
          {links.map((l) => (
            <button
              key={l.to}
              type="button"
              onClick={() => navigate(l.to)}
              className="text-[12px] font-medium text-stone-600 hover:text-brand-maroon transition-colors cursor-pointer"
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
};
