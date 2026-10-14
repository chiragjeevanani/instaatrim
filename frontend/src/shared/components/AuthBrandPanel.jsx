import React from 'react';
import { CheckCircle2 } from 'lucide-react';

// Left-hand brand panel for the desktop (lg+) split-screen auth layouts.
// Hidden on phones, where the auth form is the whole screen.
export const AuthBrandPanel = ({ eyebrow, title, subtitle, points = [], image }) => (
  <aside className="hidden lg:flex lg:w-[46%] xl:w-1/2 relative overflow-hidden bg-[#2a0a17] text-white flex-col justify-between p-12 xl:p-16 h-screen self-start sticky top-0">
    {image && (
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
    )}
    <div className="absolute inset-0 bg-gradient-to-br from-[#4c0519]/95 via-[#2a0a17]/85 to-[#1e1035]/90" />

    <div className="relative z-10">
      <div className="inline-flex bg-white rounded-2xl px-3 py-1.5 shadow-lg">
        <img src="/DrimStylelogo.png" alt="DrimStyle" className="h-12 w-[160px] object-cover object-center" />
      </div>
    </div>

    <div className="relative z-10 max-w-md">
      {eyebrow && (
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">{eyebrow}</span>
      )}
      <h2 className="text-4xl xl:text-[44px] font-serif font-bold leading-[1.1] mt-3">{title}</h2>
      {subtitle && <p className="text-[15px] text-rose-100/80 mt-4 leading-relaxed">{subtitle}</p>}
      {points.length > 0 && (
        <ul className="mt-8 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-rose-50/90">
              <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </div>

    <p className="relative z-10 text-xs text-rose-100/50">© {new Date().getFullYear()} DrimStyle · Save money, save time.</p>
  </aside>
);
