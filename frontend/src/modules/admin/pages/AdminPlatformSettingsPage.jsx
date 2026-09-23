import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Crown,
  Percent,
  IndianRupee,
  ShieldCheck,
  Save,
  RefreshCw,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminPlatformSettingsPage = () => {
  const {
    platformSettings = {},
    updatePlatformSettings,
    elitePlan = {},
    updateElitePlan,
    theme
  } = useAdmin();

  const isLight = theme === 'light';

  // Local form states
  const [settingsForm, setSettingsForm] = useState({
    convenienceFee: 15,
    taxRatePercent: 5,
    defaultCommissionRatePercent: 12,
    referralBonusCustomer: 50,
    referralBonusReferee: 100,
    minPayoutThreshold: 1000,
    cancellationFreeHours: 1,
    supportPhone: '1800-200-8811',
    supportEmail: 'support@instaatrim.com'
  });

  const [eliteForm, setEliteForm] = useState({
    name: 'InstaaTrim Elite Club',
    tagline: 'VIP Membership & Priority Beauty Access',
    price: 299,
    originalPrice: 999,
    validityDays: 90,
    discountPercent: 10,
    perks: [],
    isActive: true
  });

  const [newPerkText, setNewPerkText] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingElite, setIsSavingElite] = useState(false);

  useEffect(() => {
    if (platformSettings && Object.keys(platformSettings).length > 0) {
      setSettingsForm((prev) => ({ ...prev, ...platformSettings }));
    }
  }, [platformSettings]);

  useEffect(() => {
    if (elitePlan && Object.keys(elitePlan).length > 0) {
      setEliteForm((prev) => ({
        ...prev,
        ...elitePlan,
        perks: elitePlan.perks || [
          'Flat 10% Extra Discount on all bookings across all salons',
          'Free cancellation up to 1 hour before scheduled time',
          'Priority slot access & zero convenience charges',
          'Free Safety & Sanitized Kit on every visit'
        ]
      }));
    }
  }, [elitePlan]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    await updatePlatformSettings({
      ...settingsForm,
      convenienceFee: Number(settingsForm.convenienceFee),
      taxRatePercent: Number(settingsForm.taxRatePercent),
      defaultCommissionRatePercent: Number(settingsForm.defaultCommissionRatePercent),
      referralBonusCustomer: Number(settingsForm.referralBonusCustomer),
      referralBonusReferee: Number(settingsForm.referralBonusReferee),
      minPayoutThreshold: Number(settingsForm.minPayoutThreshold),
      cancellationFreeHours: Number(settingsForm.cancellationFreeHours)
    });
    setIsSavingSettings(false);
  };

  const handleSaveElite = async (e) => {
    e.preventDefault();
    setIsSavingElite(true);
    await updateElitePlan({
      ...eliteForm,
      price: Number(eliteForm.price),
      originalPrice: Number(eliteForm.originalPrice),
      validityDays: Number(eliteForm.validityDays),
      discountPercent: Number(eliteForm.discountPercent)
    });
    setIsSavingElite(false);
  };

  const handleAddPerk = () => {
    if (!newPerkText.trim()) return;
    setEliteForm((prev) => ({
      ...prev,
      perks: [...prev.perks, newPerkText.trim()]
    }));
    setNewPerkText('');
  };

  const handleRemovePerk = (index) => {
    setEliteForm((prev) => ({
      ...prev,
      perks: prev.perks.filter((_, idx) => idx !== index)
    }));
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen ${isLight ? 'bg-[#f7f5f9]' : 'bg-[#0d0d12]'}`}>
      <AdminTopBar
        title="Platform Commercial & Elite Settings"
        subtitle="Manage commission rates, GST, convenience fees, loyalty bonuses, and VIP Elite club passes"
      />

      <div className="p-8 space-y-8 flex-1 overflow-y-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. Global Commercial & Operational Parameters */}
          <div
            className={`p-6 rounded-2xl border shadow-sm ${
              isLight ? 'bg-white border-purple-100 text-stone-900' : 'bg-[#14141e] border-[#262638] text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-stone-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Commercial &amp; Fee Rules</h3>
                  <p className="text-[11px] text-stone-400">Controls customer checkout calculations and partner cuts</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    Platform Convenience Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settingsForm.convenienceFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, convenienceFee: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#1a1a26] border-[#2d2d40] text-white'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Applied per completed booking</span>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    GST / Service Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="28"
                    value={settingsForm.taxRatePercent}
                    onChange={(e) => setSettingsForm({ ...settingsForm, taxRatePercent: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#1a1a26] border-[#2d2d40] text-white'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Statutory tax charged to client</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    Default Partner Commission (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settingsForm.defaultCommissionRatePercent}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, defaultCommissionRatePercent: e.target.value })
                    }
                    className={`w-full p-2.5 rounded-xl border outline-none font-bold text-purple-400 ${
                      isLight ? 'bg-stone-50 border-stone-300' : 'bg-[#1a1a26] border-[#2d2d40]'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Platform fee cut on payouts</span>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    Min Payout Threshold (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={settingsForm.minPayoutThreshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, minPayoutThreshold: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#1a1a26] border-[#2d2d40] text-white'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Minimum salon withdrawal limit</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    Referrer Bonus Cash (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settingsForm.referralBonusCustomer}
                    onChange={(e) => setSettingsForm({ ...settingsForm, referralBonusCustomer: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#1a1a26] border-[#2d2d40] text-white'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Credited to referring customer</span>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">
                    Free Cancellation Window (Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settingsForm.cancellationFreeHours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, cancellationFreeHours: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#1a1a26] border-[#2d2d40] text-white'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Hours before booking time</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Saving Settings...' : 'Save Commercial Parameters'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. Elite VIP Membership Pass Management */}
          <div
            className={`p-6 rounded-2xl border shadow-sm ${
              isLight ? 'bg-white border-purple-100 text-stone-900' : 'bg-[#14141e] border-[#262638] text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-stone-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">InstaaTrim Elite Club Pass</h3>
                  <p className="text-[11px] text-stone-400">Controls VIP banner perks, subscription cost and discounts</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                VIP Pass
              </span>
            </div>

            <form onSubmit={handleSaveElite} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Pass Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={eliteForm.price}
                    onChange={(e) => setEliteForm({ ...eliteForm, price: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none font-bold text-amber-400 ${
                      isLight ? 'bg-stone-50 border-stone-300' : 'bg-[#1a1a26] border-[#2d2d40]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Anchor / Strikethrough (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={eliteForm.originalPrice}
                    onChange={(e) => setEliteForm({ ...eliteForm, originalPrice: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none line-through text-stone-400 ${
                      isLight ? 'bg-stone-50 border-stone-300' : 'bg-[#1a1a26] border-[#2d2d40]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">VIP Booking Discount (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={eliteForm.discountPercent}
                    onChange={(e) => setEliteForm({ ...eliteForm, discountPercent: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#1a1a26] border-[#2d2d40] text-white'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Applied across all salons for Elite members</span>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Pass Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={eliteForm.validityDays}
                    onChange={(e) => setEliteForm({ ...eliteForm, validityDays: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#1a1a26] border-[#2d2d40] text-white'
                    }`}
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">e.g. 90 days = 3 Months Pass</span>
                </div>
              </div>

              {/* Perks List */}
              <div>
                <label className="block text-stone-400 font-semibold mb-1.5">Elite Perks Displayed to Customer</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {eliteForm.perks.map((perk, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-[11px] ${
                        isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#191925] border-[#2c2c3e]'
                      }`}
                    >
                      <span className="truncate">{perk}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePerk(idx)}
                        className="text-stone-500 hover:text-red-400 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newPerkText}
                    onChange={(e) => setNewPerkText(e.target.value)}
                    placeholder="Add new perk description..."
                    className={`flex-1 p-2 rounded-xl border outline-none text-xs ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#1a1a26] border-[#2d2d40] text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddPerk}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingElite}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 font-bold text-stone-950 shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Crown className="w-4 h-4 fill-stone-950" />
                  <span>{isSavingElite ? 'Updating Elite Pass...' : 'Save Elite Plan Configuration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
