import React, { useState } from 'react';
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
  Check
} from 'lucide-react';

export const SalonOnboardingPage = () => {
  const navigate = useNavigate();
  const { salonProfile, showToast } = useSalon();

  const steps = [
    { number: 1, title: 'Salon Details', status: 'Approved' },
    { number: 2, title: 'Location & Map', status: 'Approved' },
    { number: 3, title: 'KYC Documents', status: 'Approved' },
    { number: 4, title: 'Bank Settlement', status: 'Approved' },
    { number: 5, title: 'Go Live', status: 'Live & Verified' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] font-sans text-stone-900 antialiased min-h-screen pb-12 mx-auto border-x border-purple-200/50 flex flex-col justify-between overflow-x-hidden box-border"
    >
      <header className="sticky top-0 z-30 bg-[#f8f4fb]/95 backdrop-blur-md px-3.5 py-2.5 border-b border-purple-100 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-1 text-stone-700 active:scale-95">
          <ArrowLeft className="w-4 h-4 stroke-[1.8]" />
        </button>
        <div>
          <h1 className="text-xs font-semibold text-stone-800">Partner Onboarding &amp; Verification</h1>
          <p className="text-[10px] text-stone-500 font-normal">Section 20: Partner Workflow</p>
        </div>
      </header>

      <main className="p-3.5 space-y-3.5 flex-1 w-full min-w-0">
        {/* Verification Status Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-3 shadow-2xs">
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <ShieldCheck className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-emerald-950">
                Salon Partner Account Verified &amp; Active
              </span>
              <span className="text-[8.5px] bg-emerald-200 text-emerald-900 font-medium px-1.5 py-0.2 rounded-full">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-emerald-800/90 leading-relaxed mt-0.5 font-normal">
              Your business documents, bank account, and physical location have been officially verified by the InstaaTrim operations team.
            </p>
          </div>
        </div>

        {/* Workflow Progression Stepper (Section 20) */}
        <div className="bg-white rounded-2xl p-3.5 border border-purple-100 shadow-2xs space-y-2.5">
          <span className="text-[9.5px] font-medium text-stone-400 uppercase tracking-wider block">
            Onboarding Lifecycle
          </span>
          <div className="space-y-2">
            {steps.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-medium">
                    <Check className="w-3 h-3 stroke-[2]" />
                  </div>
                  <span className="text-xs font-medium text-stone-800">
                    Step {s.number}: {s.title}
                  </span>
                </div>
                <span className="text-[9.5px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Business Information */}
        <div className="bg-white rounded-2xl p-3.5 border border-purple-100 shadow-2xs space-y-2.5 text-xs">
          <span className="text-[9.5px] font-medium text-stone-400 uppercase tracking-wider block">
            Submitted Business KYC
          </span>

          <div className="divide-y divide-stone-100 space-y-1.5">
            <div className="pt-0.5 flex justify-between">
              <span className="text-stone-500 font-normal">Registered Name:</span>
              <span className="font-semibold text-stone-800">{salonProfile.name}</span>
            </div>
            <div className="pt-1.5 flex justify-between">
              <span className="text-stone-500 font-normal">GSTIN / Tax ID:</span>
              <span className="font-semibold text-stone-800">23AABCU9603R1ZM (Verified)</span>
            </div>
            <div className="pt-1.5 flex justify-between">
              <span className="text-stone-500 font-normal">Shop Act License:</span>
              <span className="font-semibold text-stone-800">IND-MP-2024-8841 (Verified)</span>
            </div>
            <div className="pt-1.5 flex justify-between">
              <span className="text-stone-500 font-normal">Settlement Bank:</span>
              <span className="font-semibold text-stone-800">HDFC Bank ••4892</span>
            </div>
            <div className="pt-1.5 flex justify-between">
              <span className="text-stone-500 font-normal">IFSC Code:</span>
              <span className="font-semibold text-stone-800">HDFC0001032</span>
            </div>
            <div className="pt-1.5 flex justify-between">
              <span className="text-stone-500 font-normal">Commission Rate:</span>
              <span className="font-semibold text-brand-maroon">12% Flat per booking</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            showToast('KYC documents re-verified. All credentials are up to date.');
            navigate('/salon');
          }}
          className="w-full py-2 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-95 text-white font-medium text-[11px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <span>Return to Dashboard</span>
        </button>
      </main>
    </motion.div>
  );
};
