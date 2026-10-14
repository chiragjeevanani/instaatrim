import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ScrollText, ShieldCheck } from 'lucide-react';
import { useLandingContent } from './useLandingContent';
import { LegalDocument } from './LegalDocument';

// Privacy Policy / Terms & Conditions shown inside the customer and salon-partner
// apps. Text comes from the admin-managed landing content (Admin → Landing Page).
// `base` is the app prefix ('/customer' or '/salon'), used for the cross-link.
export const AppLegalPage = ({ docKey, base }) => {
  const navigate = useNavigate();
  const { content, contact } = useLandingContent();
  const doc = content.legal[docKey];
  const isPrivacy = docKey === 'privacy';
  const Icon = isPrivacy ? ShieldCheck : ScrollText;
  const other = isPrivacy
    ? { label: 'Terms & Conditions', to: `${base}/terms` }
    : { label: 'Privacy Policy', to: `${base}/privacy-policy` };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[480px] lg:max-w-3xl min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] lg:bg-none min-h-screen lg:min-h-0 pb-16 lg:pb-12 mx-auto border-x lg:border-x-0 border-purple-200/50 flex flex-col overflow-x-hidden box-border"
    >
      <header className="sticky top-0 lg:static z-30 bg-[#f8f4fb]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none px-3.5 lg:px-0 py-2.5 lg:pt-8 lg:pb-2 border-b lg:border-0 border-purple-100 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/80 border border-purple-100 flex items-center justify-center text-stone-700 active:scale-95 transition-transform cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2]" />
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] lg:text-[11px] font-bold tracking-widest text-brand-maroon uppercase block leading-none">DrimStyle Legal</span>
          <h1 className="text-[16px] lg:text-[26px] font-bold text-stone-900 leading-tight mt-0.5 truncate">{doc.title}</h1>
        </div>
        <span className="hidden sm:flex w-10 h-10 rounded-2xl bg-rose-50 text-brand-maroon items-center justify-center">
          <Icon className="w-5 h-5" />
        </span>
      </header>

      <main className="p-3.5 lg:px-0 flex-1">
        <LegalDocument doc={doc} />

        <div className="mt-5 rounded-2xl bg-stone-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[13px] leading-relaxed text-stone-300">
            Questions? Write to{' '}
            <a href={`mailto:${contact.email}`} className="font-semibold text-amber-300 hover:underline break-all">
              {contact.email}
            </a>
          </div>
          <Link to={other.to} className="text-[13px] font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-full px-4 py-2 text-center shrink-0">
            Read {other.label}
          </Link>
        </div>
      </main>
    </motion.div>
  );
};
