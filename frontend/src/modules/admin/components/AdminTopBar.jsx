import React from 'react';
import { Shield, Bell, HelpCircle, Sun, Moon } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { Link } from 'react-router-dom';

export const AdminTopBar = ({ title, subtitle, action }) => {
  const { kpis, theme, toggleTheme } = useAdmin();

  const isLight = theme === 'light';

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#121218]/90 backdrop-blur-md border-b border-[#262633] px-8 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {action && <div>{action}</div>}

        {/* Global Pending Alerts */}
        {(kpis.pendingSalons > 0 || kpis.pendingOffers > 0 || kpis.openTickets > 0) && (
          <div className="flex items-center gap-2">
            {kpis.pendingSalons > 0 && (
              <Link
                to="/admin/salons?filter=pending"
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {kpis.pendingSalons} Salons to verify
              </Link>
            )}
            {kpis.pendingOffers > 0 && (
              <Link
                to="/admin/offers"
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                {kpis.pendingOffers} Offers awaiting review
              </Link>
            )}
          </div>
        )}

        {/* Dark / Light Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          className="flex items-center justify-center gap-2 w-[115px] py-1.5 rounded-lg bg-[#181822] border border-[#262633] text-xs font-medium text-stone-300 hover:text-white transition-colors cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          {isLight ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-purple-400 stroke-[2.2]" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181822] border border-[#262633] text-xs text-stone-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-medium">System Live</span>
        </div>
      </div>
    </header>
  );
};
