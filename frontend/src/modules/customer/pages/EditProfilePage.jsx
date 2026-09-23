import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Check,
  ShieldCheck,
  Save,
  Crown
} from 'lucide-react';
import { motion } from 'framer-motion';

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useCustomer();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'female',
    dob: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || 'female',
        dob: user.dob || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        dob: formData.dob
      });
      setSuccessSaved(true);
      setTimeout(() => {
        setSuccessSaved(false);
        navigate('/customer/account');
      }, 700);
    } catch {
      // Handled in context toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-16 mx-auto border-x border-purple-200/50 flex flex-col justify-between overflow-x-hidden box-border">
      {/* Top Header */}
      <div>
        <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/customer/account')}
              className="p-1.5 -ml-1 text-stone-300 hover:text-white active:scale-90 transition-transform cursor-pointer rounded-full hover:bg-white/10"
              aria-label="Back to Account"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold tracking-tight">Edit Profile</h1>
              <p className="text-[10px] text-stone-400">Personal details &amp; preferences</p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-stone-950 flex items-center justify-center font-bold text-xs shadow-xs">
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 space-y-4">
          {/* Avatar Hero Card */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-brand-maroon text-white flex items-center justify-center font-bold text-xl shadow-md">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              {user.isElite && (
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-950 p-1 rounded-full shadow-xs">
                  <Crown className="w-3 h-3 fill-stone-950" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-stone-900 truncate">
                  {formData.name || 'Your Name'}
                </h2>
                {user.isElite && (
                  <span className="bg-amber-100 text-amber-900 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                    Elite Member
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {formData.phone ? `+91 ${formData.phone}` : 'No phone linked'}
              </p>
              <p className="text-[10px] text-stone-400 truncate">{formData.email || 'No email linked'}</p>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-maroon" />
                Basic Information
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-[10.5px] font-bold text-stone-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-brand-maroon focus:border-brand-maroon transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[10.5px] font-bold text-stone-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="7000792773"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-brand-maroon focus:border-brand-maroon transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10.5px] font-bold text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ananya.sharma@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-brand-maroon focus:border-brand-maroon transition-all"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[10.5px] font-bold text-stone-700 mb-1.5">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'female', label: 'Female' },
                    { id: 'male', label: 'Male' },
                    { id: 'other', label: 'Other' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g.id })}
                      className={`py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        formData.gender === g.id
                          ? 'border-brand-maroon bg-purple-50 text-brand-maroon shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10.5px] font-bold text-stone-700">
                    Date of Birth
                  </label>
                  <span className="text-[9.5px] text-amber-600 font-semibold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Birthday surprise perks
                  </span>
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1.5 focus:ring-brand-maroon focus:border-brand-maroon transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Trust Card */}
            <div className="bg-emerald-50/80 rounded-2xl p-3 border border-emerald-200/70 flex items-center gap-2.5 text-emerald-800 text-[10.5px]">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Your contact information is strictly protected and encrypted per InstaaTrim Privacy Policy.</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/customer/account')}
                className="flex-1 py-3 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !formData.name.trim()}
                className="flex-1 py-3 rounded-xl bg-brand-maroon hover:bg-purple-900 text-white font-bold text-xs transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {successSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
