import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Sparkles,
  Scissors,
  Check,
  X,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SalonStaffPage = () => {
  const navigate = useNavigate();
  const { salonProfile, staff = [], addStaff, updateStaff, removeStaff, categories = [] } = useSalon();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Senior Stylist',
    serviceCategories: ['Hair Studio'],
    openTime: '09:30 AM',
    closeTime: '08:30 PM'
  });

  const availableRoles = [
    'Senior Stylist',
    'Hair Specialist',
    'Beautician & Esthetician',
    'Spa Therapist',
    'Nail Technician',
    'Barber & Grooming Expert',
    'Makeup Artist'
  ];

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      role: 'Senior Stylist',
      serviceCategories: ['Hair Studio'],
      openTime: '09:30 AM',
      closeTime: '08:30 PM'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st) => {
    setEditingStaff(st);
    setFormData({
      name: st.name || '',
      role: st.role || 'Senior Stylist',
      serviceCategories: st.serviceCategories || ['Hair Studio'],
      openTime: '09:30 AM',
      closeTime: '08:30 PM'
    });
    setIsModalOpen(true);
  };

  const handleToggleCategory = (catName) => {
    setFormData((prev) => {
      const exists = prev.serviceCategories.includes(catName);
      if (exists) {
        return { ...prev, serviceCategories: prev.serviceCategories.filter((c) => c !== catName) };
      } else {
        return { ...prev, serviceCategories: [...prev.serviceCategories, catName] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name: formData.name.trim(),
        role: formData.role,
        serviceCategories: formData.serviceCategories
      });
    } else {
      addStaff({
        name: formData.name.trim(),
        role: formData.role,
        serviceCategories: formData.serviceCategories
      });
    }
    setIsModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[480px] min-w-0 bg-[#faf7fc] font-sans text-stone-900 antialiased min-h-screen pb-24 mx-auto flex flex-col justify-between overflow-x-hidden box-border shadow-md"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#faf7fc]/95 backdrop-blur-md px-4 py-3 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/salon/profile')}
            className="p-1 rounded-full text-stone-700 hover:bg-stone-200 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-stone-900 leading-tight">Staff &amp; Specialists</h1>
            <p className="text-[10px] text-stone-500">{salonProfile.name}</p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1 bg-brand-maroon hover:bg-brand-darkMaroon text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Staff</span>
        </button>
      </header>

      <main className="p-4 flex-1 space-y-4">
        {/* Banner card */}
        <div className="bg-gradient-to-r from-purple-900 to-stone-900 text-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/30 text-purple-200 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Active Stylist Roster</h2>
              <p className="text-[11px] text-stone-300">
                {staff.length} staff member{staff.length === 1 ? '' : 's'} assigned to stations
              </p>
            </div>
          </div>
        </div>

        {/* Staff List */}
        <div className="space-y-2.5">
          {staff.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/80 text-stone-400 text-xs">
              No staff members added yet. Click &quot;Add Staff&quot; above to build your team.
            </div>
          ) : (
            staff.map((st) => (
              <div
                key={st.id}
                className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-100 to-purple-100 text-brand-maroon flex items-center justify-center font-bold text-sm shrink-0 border border-purple-200">
                    {st.name?.charAt(0) || 'S'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-900 text-xs truncate">{st.name}</span>
                      <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded-full">
                        {st.role}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {(st.serviceCategories || []).map((cat, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleOpenEdit(st)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 cursor-pointer"
                    title="Edit Staff"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeStaff(st.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                    title="Remove Staff"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add / Edit Staff Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 text-xs relative"
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-brand-maroon flex items-center justify-center font-bold">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    {editingStaff ? 'Edit Staff Member' : 'Add Team Member'}
                  </h3>
                  <p className="text-[10px] text-stone-500">Stylist details &amp; specialization</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kavita Sharma"
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 outline-none focus:border-brand-maroon"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Professional Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 outline-none focus:border-brand-maroon"
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1.5">
                    Skills &amp; Service Categories
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Hair Studio', 'Waxing', 'Facial', 'Spa', 'Body Polishing', 'Nails', 'Grooming'].map(
                      (cat) => {
                        const isSelected = formData.serviceCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleToggleCategory(cat)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-brand-maroon hover:bg-brand-darkMaroon text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingStaff ? 'Save Changes' : 'Add Stylist'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
