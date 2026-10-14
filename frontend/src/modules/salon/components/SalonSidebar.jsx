import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Tag,
  BarChart3,
  Wallet,
  Users,
  Star,
  Store,
  Bell,
  LogOut,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { SalonNotificationSheet } from './SalonNotificationSheet';

// Desktop-only (lg+) navigation for the salon partner app. Phones keep
// SalonBottomNav; on wide screens this persistent sidebar replaces it.
export const SalonSidebar = () => {
  const navigate = useNavigate();
  const { salonProfile, metrics, logout, notifications = [] } = useSalon();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const isApproved = Boolean(salonProfile?.isVerified && salonProfile?.verificationStatus === 'Live');
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const activeToday =
    (metrics?.inServiceTodayCount || 0) + (metrics?.checkedInTodayCount || 0) + (metrics?.confirmedTodayCount || 0);

  const sections = [
    {
      title: 'Operations',
      items: [
        { to: '/salon', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/salon/bookings', label: 'Bookings', icon: Calendar, badge: activeToday },
        { to: '/salon/services', label: 'Services', icon: Scissors },
        { to: '/salon/offers', label: 'Offers', icon: Tag }
      ]
    },
    {
      title: 'Business',
      items: [
        { to: '/salon/analytics', label: 'Analytics', icon: BarChart3 },
        { to: '/salon/payouts', label: 'Payouts', icon: Wallet },
        { to: '/salon/staff', label: 'Staff & Stations', icon: Users },
        { to: '/salon/reviews', label: 'Reviews', icon: Star },
        { to: '/salon/profile', label: 'Salon Profile', icon: Store }
      ]
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/salon/login', { replace: true });
  };

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 z-40 flex-col bg-white/90 backdrop-blur-md border-r border-purple-200/60">
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-purple-100">
          <img src="/DrimStylelogo.png" alt="DrimStyle" className="h-10 w-[130px] object-cover object-center" />
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200">
            Partner
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                          isActive
                            ? 'bg-rose-900 text-white shadow-sm'
                            : 'text-stone-600 hover:bg-purple-50 hover:text-stone-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge > 0 && (
                            <span
                              className={`min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                isActive ? 'bg-white text-rose-900' : 'bg-rose-900 text-white'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Salon identity & account actions */}
        <div className="p-3 border-t border-purple-100 space-y-2">
          <button
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold text-stone-600 hover:bg-purple-50 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-stone-400" />
            <span className="flex-1 text-left">Notifications</span>
            {unreadNotifs > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-stone-900 text-[10px] font-bold flex items-center justify-center">
                {unreadNotifs}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-50/70 border border-purple-100">
            {salonProfile?.coverImage ? (
              <img src={salonProfile.coverImage} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-stone-900 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-[12px] font-bold text-stone-900 truncate">{salonProfile?.name}</p>
                {isApproved ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
              </div>
              <p className="text-[10.5px] text-stone-500 truncate">{salonProfile?.ownerName || 'Partner'}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-stone-500 hover:text-rose-900 hover:bg-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <SalonNotificationSheet isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
