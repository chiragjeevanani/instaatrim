import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Building2,
  FileCheck,
  CreditCard,
  Users,
  EyeOff,
  Phone,
  Mail,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export const SalonPrivacyPolicyPage = () => {
  const navigate = useNavigate();

  const partnerPolicies = [
    {
      id: 'partner-data',
      icon: <Building2 className="w-4 h-4 text-brand-maroon" />,
      title: '1. Partner Information We Collect',
      badge: 'Listing & Verification',
      content: (
        <div className="space-y-3 text-stone-700 text-xs leading-relaxed">
          <p>
            To onboard, verify, and operate your salon listing on <strong>DrimStyle / Instaatrim Partner Portal</strong>, we collect essential commercial and operational details:
          </p>
          <div className="space-y-2 pl-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-stone-900">Salon & Business Identity:</strong> Trade name, business legal name, registered address, coordinates, trade licenses, PAN and GSTIN (if applicable).
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-stone-900">Partner & Staff Profiles:</strong> Owner contact number, verified email address, staff roster, specialist profiles, and allocated service chair schedules.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-stone-900">Banking & KYC Credentials:</strong> Bank account number, beneficiary name, IFSC code, and cancelled cheque/bank verification records used solely for secure settlement payouts.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-stone-900">Catalog & Operational Data:</strong> Services list, prices, service durations, working hours, active discounts, flash offers, and real-time chair availability.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'partner-usage',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      title: '2. Purpose of Data Processing',
      badge: 'Operations & Payouts',
      content: (
        <div className="space-y-2.5 text-stone-700 text-xs leading-relaxed">
          <p>We process your salon information strictly for business enablement and service execution:</p>
          <ul className="list-disc pl-4 space-y-1.5 text-stone-600">
            <li><strong>Customer Visibility & Discovery:</strong> Publishing your salon menu, timings, photos, and ratings on the DrimStyle customer app.</li>
            <li><strong>Instant Bookings & Scheduling:</strong> Routing confirmed customer bookings directly to your salon dashboard and staff schedule.</li>
            <li><strong>Automated Bank Payouts:</strong> Direct deposit and weekly/monthly payout settlements with itemized breakdown reports.</li>
            <li><strong>Partner Operations & Alerts:</strong> Dispatching urgent booking alerts, schedule changes, customer dispute notices, and commercial invoices.</li>
            <li><strong>Quality Benchmarking:</strong> Maintaining hygiene, trust, and verified customer review standards across all network partners.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'financial-security',
      icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
      title: '3. Banking & Settlement Security',
      badge: 'RBI & Bank-Grade',
      content: (
        <div className="space-y-3 text-stone-700 text-xs leading-relaxed">
          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-xl p-3 text-emerald-950 font-medium text-[11px]">
            🔒 <strong>100% Financial Isolation:</strong> Your salon bank accounts and payout earnings are protected by 256-bit AES encryption. Financial credentials are never shared with third parties or rival salons.
          </div>
          <p>
            All online customer prepayments are held in escrow and settled directly into your registered bank account via secure RBI-authorized payment partner networks (e.g., Razorpay / NEFT / IMPS).
          </p>
        </div>
      )
    },
    {
      id: 'customer-data',
      icon: <Users className="w-4 h-4 text-indigo-600" />,
      title: '4. Customer Data Handling Guidelines for Salons',
      badge: 'Data Protection Rule',
      content: (
        <div className="space-y-3 text-stone-700 text-xs leading-relaxed">
          <p>
            As a DrimStyle Partner, you receive booking information to serve walk-ins and appointment holders. Partners agree to adhere to the following mandatory data protection rules:
          </p>
          <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 mt-0.5 shrink-0" />
              <span><strong>Strictly For Service Delivery:</strong> Customer contact details are provided only to confirm arrivals, manage wait times, and execute booked treatments.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 mt-0.5 shrink-0" />
              <span><strong>No Unsolicited Marketing:</strong> Partner salons may NOT export or use customer contact numbers for cold calling, independent WhatsApp spam, or off-platform promotional lists.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 mt-0.5 shrink-0" />
              <span><strong>Confidentiality Maintenance:</strong> All staff members must respect customer privacy, personal preferences, and consultation confidentiality.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'partner-control',
      icon: <Lock className="w-4 h-4 text-blue-600" />,
      title: '5. Partner Control & Data Retention',
      badge: 'Partner Rights',
      content: (
        <div className="space-y-2.5 text-stone-700 text-xs leading-relaxed">
          <p>You retain comprehensive administrative control over your salon's digital presence:</p>
          <ul className="list-disc pl-4 space-y-1.5 text-stone-600">
            <li><strong>Listing Visibility:</strong> You can toggle individual services, adjust staff availability, or temporarily switch your salon status to offline.</li>
            <li><strong>Profile & Price Updates:</strong> Edit catalog pricing, photos, amenities, and timings directly from your Salon Business profile.</li>
            <li><strong>Data Retention & Offboarding:</strong> If you wish to de-list or terminate your partnership, all operational records are securely closed following settlement of pending accounts.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'partner-contact',
      icon: <HelpCircle className="w-4 h-4 text-rose-900" />,
      title: '6. Partner Support & Operations Desk',
      badge: 'Help & Operations',
      content: (
        <div className="space-y-3 text-stone-700 text-xs leading-relaxed">
          <p>
            For legal inquiries, banking KYC verification assistance, or data privacy questions, contact our dedicated Partner Operations Helpdesk:
          </p>
          <div className="space-y-2 bg-white/80 p-3 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
              <span>Partner Inquiries: <a href="mailto:partners@instaatrim.com" className="font-bold text-brand-maroon underline">partners@instaatrim.com</a></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
              <span>Toll-Free Partner Desk: <strong>1800-200-8899</strong> (10:00 AM – 8:00 PM)</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Building2 className="w-3.5 h-3.5 text-brand-maroon shrink-0 mt-0.5" />
              <span><strong>Instaatrim Technologies Pvt. Ltd. (DrimStyle)</strong><br />Partner Operations Division, Indore, MP</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 italic">
            Effective Date: October 2026. Updates will be communicated via partner app notifications and operational emails.
          </p>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[480px] lg:max-w-4xl min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-24 lg:pb-12 mx-auto border-x lg:border-x-0 border-purple-200/50 flex flex-col justify-between overflow-x-hidden box-border"
    >
      {/* Top Header */}
      <header className="sticky top-0 lg:static z-30 bg-[#f8f4fb]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none px-3.5 lg:px-8 py-2.5 lg:pt-8 lg:pb-0 border-b lg:border-0 border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/80 border border-purple-100 flex items-center justify-center text-stone-700 active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div>
            <span className="text-[9px] font-bold tracking-widest text-brand-maroon uppercase block leading-none">
              DrimStyle Partner
            </span>
            <h1 className="text-sm font-bold text-stone-900 leading-tight mt-0.5">
              Partner Privacy Policy
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-700" />
          <span>Partner Protected</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-3.5 lg:p-8 space-y-3.5 flex-1">
        {/* Partner Trust Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-stone-900 via-[#261528] to-stone-900 text-white p-4 shadow-md">
          <div className="absolute top-0 right-0 w-36 h-36 bg-brand-maroon/30 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 text-stone-200 text-[10px] font-medium backdrop-blur-sm mb-2 border border-white/10">
              <Lock className="w-3 h-3 text-amber-300" />
              <span>Commercial Confidentiality & Payout Security</span>
            </div>
            <h2 className="text-base font-bold leading-snug">
              Partner Data Integrity & Trust
            </h2>
            <p className="text-[11px] text-stone-300 mt-1.5 leading-relaxed">
              We protect your salon business data, staff details, and financial payout records with bank-level encryption.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <span className="block text-xs font-bold text-emerald-400">100% Secure</span>
                <span className="text-[9px] text-stone-300 leading-tight block mt-0.5">Payout Vault</span>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <span className="block text-xs font-bold text-amber-300">Confidential</span>
                <span className="text-[9px] text-stone-300 leading-tight block mt-0.5">Commercial Data</span>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <span className="block text-xs font-bold text-purple-300">Full Control</span>
                <span className="text-[9px] text-stone-300 leading-tight block mt-0.5">Catalog & Timings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-3">
          {partnerPolicies.map((sec) => (
            <div
              key={sec.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-2.5 transition-all hover:border-purple-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-100">
                    {sec.icon}
                  </div>
                  <h3 className="font-bold text-xs text-stone-900">{sec.title}</h3>
                </div>
                <span className="text-[9px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                  {sec.badge}
                </span>
              </div>
              <div className="pt-1">
                {sec.content}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Assurance */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 rounded-2xl p-3.5 border border-purple-200/80 text-center space-y-1">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-maroon text-white mb-1 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-stone-900">Partner First Philosophy</p>
          <p className="text-[10px] text-stone-600 max-w-xs mx-auto">
            Empowering salons with safe digital booking infrastructure and transparent payouts.
          </p>
        </div>
      </main>
    </motion.div>
  );
};

export default SalonPrivacyPolicyPage;
