import React, { useState } from 'react';
import { TicketPercent, Plus, Trash2, Edit2, Search, CheckCircle2 } from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminCouponsPage = () => {
  const { coupons, createCoupon, deleteCoupon, updateCoupon } = useAdmin();

  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountPercent: '',
    flatDiscount: '',
    maxDiscount: '',
    minOrder: '499',
    scope: 'platform',
    firstBookingOnly: false
  });

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountPercent: '15',
      flatDiscount: '',
      maxDiscount: '250',
      minOrder: '499',
      scope: 'platform',
      firstBookingOnly: false
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description || '',
      discountPercent: c.discountPercent ? String(c.discountPercent) : '',
      flatDiscount: c.flatDiscount ? String(c.flatDiscount) : '',
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
      minOrder: String(c.minOrder || 0),
      scope: c.scope || 'platform',
      firstBookingOnly: Boolean(c.firstBookingOnly)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: formData.code.toUpperCase().trim(),
      description: formData.description,
      discountPercent: formData.discountPercent ? Number(formData.discountPercent) : null,
      flatDiscount: formData.flatDiscount ? Number(formData.flatDiscount) : null,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      minOrder: Number(formData.minOrder) || 0,
      scope: formData.scope,
      firstBookingOnly: formData.firstBookingOnly
    };

    if (editingCoupon) {
      await updateCoupon(editingCoupon.id || editingCoupon.code, payload);
    } else {
      await createCoupon(payload);
    }
    setShowModal(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Platform Promo Coupons"
        subtitle="Manage sitewide discounts, first-booking vouchers and elite member promo codes"
        action={
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coupon</span>
          </button>
        }
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((c) => (
            <div
              key={c.id || c.code}
              className="bg-[#14141e] border border-[#262638] rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-md relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="px-3 py-1 bg-purple-500/15 border border-purple-500/30 rounded-lg font-mono font-bold text-sm text-purple-300 tracking-wider">
                    {c.code}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-semibold">
                    {c.scope || 'platform'}
                  </span>
                </div>

                <p className="text-xs text-stone-300">{c.description || 'Promotional discount coupon'}</p>

                <div className="bg-[#1b1b26] border border-[#242433] rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Discount Value</span>
                    <span className="font-bold text-white">
                      {c.discountPercent ? `${c.discountPercent}% OFF` : `₹${c.flatDiscount} FLAT`}
                    </span>
                  </div>
                  {c.maxDiscount && (
                    <div className="flex justify-between">
                      <span className="text-stone-400">Max Discount</span>
                      <span className="text-stone-300">₹{c.maxDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-400">Min Order</span>
                    <span className="text-stone-300">₹{c.minOrder || 0}</span>
                  </div>
                  {c.firstBookingOnly && (
                    <div className="text-[11px] text-amber-400 font-medium pt-1 border-t border-[#2a2a3c]">
                      ★ First Booking Only
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#232333] flex items-center justify-end gap-2 mt-4">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 text-stone-400 hover:text-purple-300 hover:bg-[#1f1f2e] rounded-lg transition-colors cursor-pointer"
                  title="Edit Coupon"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCoupon(c.id || c.code)}
                  className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141e] border border-[#262638] rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingCoupon ? 'Edit Promo Coupon' : 'Create Platform Coupon'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. MONSOON25"
                  className="w-full bg-[#0d0d14] border border-[#2c2c40] rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 15% OFF on all hair styling services"
                  className="w-full bg-[#0d0d14] border border-[#2c2c40] rounded-xl px-3 py-2 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value, flatDiscount: '' })}
                    placeholder="e.g. 15"
                    className="w-full bg-[#0d0d14] border border-[#2c2c40] rounded-xl px-3 py-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Flat Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.flatDiscount}
                    onChange={(e) => setFormData({ ...formData, flatDiscount: e.target.value, discountPercent: '' })}
                    placeholder="e.g. 100"
                    className="w-full bg-[#0d0d14] border border-[#2c2c40] rounded-xl px-3 py-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="e.g. 250"
                    className="w-full bg-[#0d0d14] border border-[#2c2c40] rounded-xl px-3 py-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    placeholder="e.g. 499"
                    className="w-full bg-[#0d0d14] border border-[#2c2c40] rounded-xl px-3 py-2 text-white focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.firstBookingOnly}
                  onChange={(e) => setFormData({ ...formData, firstBookingOnly: e.target.checked })}
                  className="rounded text-purple-600 bg-stone-900 border-stone-700"
                />
                <span className="text-stone-300">Restrict to First Booking Only</span>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#242433]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                >
                  {editingCoupon ? 'Update Coupon' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
