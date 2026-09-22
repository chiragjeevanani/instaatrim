import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Tag,
  CalendarCheck2,
  Users,
  TicketPercent,
  Megaphone,
  Star,
  LifeBuoy,
  Bell,
  BarChart3,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/salons', label: 'Salons', icon: Store, badgeKey: 'pendingSalons' },
  { to: '/admin/offers', label: 'Offers & Deals', icon: Tag, badgeKey: 'pendingOffers' },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck2 },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { to: '/admin/ads', label: 'Ads & Banners', icon: Megaphone },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/tickets', label: 'Support Tickets', icon: LifeBuoy, badgeKey: 'openTickets' },
  { to: '/admin/notifications', label: 'Broadcasts', icon: Bell },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
];

export const AdminSidebar = () => {
  const { adminSession, logout, kpis, theme, toggleTheme } = useAdmin();
  const navigate = useNavigate();

  const isLight = theme === 'light';

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-64 bg-[#121218] border-r border-[#262633] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#262633] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-950/50">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-base tracking-tight leading-none flex items-center gap-1.5">
              InstaaTrim
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                HQ
              </span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1">Super Admin Console</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-stone-800">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-300">
          Platform Management
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const badgeCount = item.badgeKey ? kpis[item.badgeKey] : 0;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                    : 'text-stone-300 hover:text-white hover:bg-[#1a1a24]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 opacity-80" />
                <span>{item.label}</span>
              </div>
              {badgeCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-300">
          Quick Portals
        </div>

        <a
          href="/customer"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-[#1a1a24] transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Customer App
          </span>
          <ExternalLink className="w-3 h-3 text-stone-500" />
        </a>

        <a
          href="/salon"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-[#1a1a24] transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Salon Partner Portal
          </span>
          <ExternalLink className="w-3 h-3 text-stone-500" />
        </a>
      </nav>

      {/* Footer / Theme Toggle & Current Session */}
      <div className="p-3 border-t border-[#262633] bg-[#0d0d12] space-y-2">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#181822] border border-[#2d2d3d] text-xs font-medium text-stone-300 hover:text-white transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <div className="flex items-center gap-2">
            {isLight ? (
              <Sun className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-purple-400 stroke-[2.2]" />
            )}
            <span>Appearance</span>
          </div>
          <span className="w-12 text-center inline-block text-[10px] uppercase font-bold py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {isLight ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* User Session */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#181822] border border-[#2d2d3d]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-xs shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-stone-200 truncate">
                {adminSession?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-stone-500 truncate">{adminSession?.email || 'admin@instaatrim.com'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
