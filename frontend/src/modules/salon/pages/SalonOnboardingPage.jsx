import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Building,
  Landmark,
  ShieldCheck,
  UploadCloud,
  Check,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SalonRegistrationPage } from './SalonRegistrationPage';

export const SalonOnboardingPage = () => {
  const navigate = useNavigate();
  const { salonProfile, showToast, isAuthenticated } = useSalon();

  // If user is not yet logged in or authenticated, present the registration wizard
  if (!isAuthenticated) {
    return <SalonRegistrationPage />;
  }

  const isApproved = Boolean(salonProfile?.isVerified && salonProfile?.verificationStatus === 'Live');
  const isPending = salonProfile?.verificationStatus === 'Pending' || (!isApproved && salonProfile?.verificationStatus !== 'Rejected');
  const isRejected = salonProfile?.verificationStatus === 'Rejected';

  const steps = [
    { number: 1, title: 'Salon & Business Profile', status: 'Submitted', isComplete: true },
    { number: 2, title: 'Location & Geo-Coordinates', status: 'Submitted', isComplete: true },
    { number: 3, title: 'Shop Act & KYC Documents', status: 'Submitted', isComplete: true },
    { number: 4, title: 'Direct Payout Bank Settlement', status: 'Submitted', isComplete: true },
    {
      number: 5,
      title: 'Admin Verification & Live Operations',
      status: isApproved ? 'Approved & Live' : isRejected ? 'Rejected' : 'Pending Review',
      isComplete: isApproved
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] font-sans text-stone-900 antialiased min-h-screen pb-12 mx-auto border-x border-purple-200/50 flex flex-col justify-between overflow-x-hidden box-border"
    >
      <header className="sticky top-0 z-30 bg-[#f8f4fb]/95 backdrop-blur-md px-4 py-3 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/salon')}
            className="p-1 text-stone-700 active:scale-95 hover:text-black rounded-full cursor-pointer"
            type="button"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div>
            <h1 className="text-xs font-bold text-stone-900 font-serif">
              Partner Verification &amp; Dossier
            </h1>
            <p className="text-[10px] text-stone-500 font-normal">Business KYC, bank verification &amp; license</p>
          </div>
        </div>

        {isApproved ? (
          <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300/50 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            VERIFIED
          </span>
        ) : isRejected ? (
          <span className="text-[9px] font-extrabold bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-300/50 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            REJECTED
          </span>
        ) : (
          <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300/50 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            PENDING ADMIN REVIEW
          </span>
        )}
      </header>

      <main className="p-4 space-y-3.5 flex-1 w-full min-w-0">
        {/* Verification Status Banner */}
        {isApproved ? (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <ShieldCheck className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-950">
                  InstaaTrim Partner Verified &amp; Active
                </span>
              </div>
              <p className="text-[10.5px] text-emerald-800/90 leading-relaxed mt-0.5 font-normal">
                Your business establishment, bank account, and salon coordinates are officially certified. Your services are live.
              </p>
            </div>
          </div>
        ) : isRejected ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <ShieldCheck className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-red-950">
                  Application Under Review Revision
                </span>
              </div>
              <p className="text-[10.5px] text-red-800 leading-relaxed mt-0.5 font-normal">
                {salonProfile.rejectionReason || 'The admin team flagged compliance questions regarding your submitted documents.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <ShieldCheck className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-950">
                  Onboarding Complete • Awaiting First Admin Approval
                </span>
              </div>
              <p className="text-[10.5px] text-amber-900/90 leading-relaxed mt-0.5 font-normal">
                After onboarding, first approval from the admin is required. Once approved by the administrator, your salon will be unlocked to list and publish services.
              </p>
            </div>
          </div>
        )}

        {/* Workflow Progression Stepper */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs space-y-3">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Onboarding Verification Lifecycle
          </span>
          <div className="space-y-2.5">
            {steps.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shadow-2xs ${
                      s.isComplete
                        ? 'bg-emerald-500 text-white'
                        : isRejected && s.number === 5
                        ? 'bg-red-500 text-white'
                        : 'bg-amber-400 text-stone-900'
                    }`}
                  >
                    {s.isComplete ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span className="text-[10px] font-bold">!</span>}
                  </div>
                  <span className="text-xs font-medium text-stone-800">
                    Step {s.number}: {s.title}
                  </span>
                </div>
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${
                    s.isComplete
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : isRejected && s.number === 5
                      ? 'text-red-700 bg-red-50 border-red-200'
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Business Information */}
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Certified KYC &amp; Settlement Data
            </span>
            <span className="text-[10px] text-brand-maroon font-bold">100% Complete</span>
          </div>

          <div className="divide-y divide-stone-100 space-y-2">
            <div className="pt-0.5 flex justify-between items-center">
              <span className="text-stone-500 font-normal">Registered Salon:</span>
              <span className="font-bold text-stone-900">{salonProfile.name}</span>
            </div>
            <div className="pt-2 flex justify-between items-center">
              <span className="text-stone-500 font-normal">Owner / Manager:</span>
              <span className="font-medium text-stone-800">{salonProfile.ownerName || 'Shalini Verma'}</span>
            </div>
            <div className="pt-2 flex justify-between items-center">
              <span className="text-stone-500 font-normal">GSTIN / Tax ID:</span>
              <span className="font-mono text-stone-800 font-semibold">{salonProfile.gstin || '23AABCU9603R1ZM'}</span>
            </div>
            <div className="pt-2 flex justify-between items-center">
              <span className="text-stone-500 font-normal">Shop Act License:</span>
              <span className="font-mono text-stone-800 font-semibold">{salonProfile.shopActLicense || 'IND-MP-2024-8841'}</span>
            </div>
            <div className="pt-2 flex justify-between items-center">
              <span className="text-stone-500 font-normal">Settlement Bank:</span>
              <span className="font-semibold text-stone-800">{salonProfile.bankName || 'HDFC Bank'} {salonProfile.accountNumber || '••4892'}</span>
            </div>
            <div className="pt-2 flex justify-between items-center">
              <span className="text-stone-500 font-normal">IFSC Code:</span>
              <span className="font-mono text-stone-800 font-semibold">{salonProfile.ifscCode || 'HDFC0001032'}</span>
            </div>
            <div className="pt-2 flex justify-between items-center">
              <span className="text-stone-500 font-normal">Platform Commission:</span>
              <span className="font-bold text-brand-maroon">12% Flat per booking</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              showToast('KYC documents re-verified. All credentials are up to date.');
              navigate('/salon');
            }}
            className="w-full py-3 bg-gradient-to-r from-brand-maroon to-brand-darkMaroon text-white font-bold text-xs rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
            type="button"
          >
            <span>Return to Salon Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </motion.div>
  );
};
