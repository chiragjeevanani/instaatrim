import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { User, Mail, Phone, Calendar, Heart, Shield, X, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useCustomer();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'female',
    dob: '',
    notificationPrefs: {
      push: true,
      sms: true,
      whatsapp: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || 'female',
        dob: user.dob || '',
        notificationPrefs: {
          push: user.notificationPrefs?.push ?? true,
          sms: user.notificationPrefs?.sms ?? true,
          whatsapp: user.notificationPrefs?.whatsapp ?? true
        }
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

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
        dob: formData.dob,
        notificationPrefs: formData.notificationPrefs
      });
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 700);
    } catch {
      // Handled silently or by context
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 text-xs relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-100 to-purple-50 text-brand-maroon flex items-center justify-center font-bold shadow-xs">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-900">Edit Profile</h3>
                <p className="text-[10px] text-stone-500">Update personal details &amp; preferences</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-[10.5px] font-bold text-stone-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full pl-8.5 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[10.5px] font-bold text-stone-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full pl-8.5 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10.5px] font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ananya@example.com"
                  className="w-full pl-8.5 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-[10.5px] font-bold text-stone-700 mb-1">
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
                    className={`py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
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

            {/* Date of Birth (Optional - For birthday treats) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10.5px] font-bold text-stone-700">
                  Date of Birth
                </label>
                <span className="text-[9.5px] text-amber-600 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Birthday surprise perks
                </span>
              </div>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full pl-8.5 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon"
                />
              </div>
            </div>

            {/* Notification & Communication Preferences */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-2">
              <span className="text-[10.5px] font-bold text-stone-800 block">Communication Channels</span>
              <div className="space-y-1.5">
                {[
                  { key: 'whatsapp', label: 'WhatsApp booking alerts & receipts' },
                  { key: 'sms', label: 'SMS reminder 1 hour prior to appointment' },
                  { key: 'push', label: 'App notifications for promotions & offers' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer text-[10.5px] text-stone-600 select-none">
                    <input
                      type="checkbox"
                      checked={formData.notificationPrefs[item.key]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notificationPrefs: {
                            ...formData.notificationPrefs,
                            [item.key]: e.target.checked
                          }
                        })
                      }
                      className="accent-brand-maroon rounded w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !formData.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-brand-maroon hover:bg-purple-900 text-white font-bold transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {successToast ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
