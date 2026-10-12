import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  Plus,
  Zap,
  Edit2,
  Trash2,
  Clock,
  IndianRupee,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export const SalonServicesPage = () => {
  const navigate = useNavigate();
  const { services, salonProfile, categories: dynamicCategories, toggleServiceActive, toggleInstantEligible, deleteService, showToast } = useSalon();

  const isApproved = Boolean(salonProfile?.isVerified && salonProfile?.verificationStatus === 'Live');
  const isRejected = salonProfile?.verificationStatus === 'Rejected';

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deleteModal, setDeleteModal] = useState(null);

  const categories = useMemo(() => {
    const fromAdmin = (dynamicCategories || []).map((c) => c.name || c.shortName);
    // Also include any service category currently in this salon's catalog so existing items are selectable
    const fromServices = services.map((s) => s.category).filter(Boolean);
    const combined = Array.from(new Set([...fromAdmin, ...fromServices]));
    return ['All', ...(combined.length > 0 ? combined : ['Waxing', 'Facial', 'Spa', 'Body Polishing', 'Mani-Pedi'])];
  }, [dynamicCategories, services]);

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'All') return true;
    return s.category === selectedCategory;
  });

  const handleEdit = (service) => {
    if (!isApproved) {
      showToast('Admin approval required to edit services', 'error');
      return;
    }
    navigate('/salon/services/new', { state: { serviceId: service.id || service._id } });
  };

  const handleAddNew = () => {
    if (!isApproved) {
      showToast('Admin approval is required before you can list services', 'error');
      return;
    }
    navigate('/salon/services/new');
  };

  return (
    <div
      className="w-full max-w-[480px] min-w-0 bg-transparent font-sans text-stone-900 antialiased min-h-screen pb-24 mx-auto flex flex-col justify-between overflow-x-hidden box-border"
    >
      <main className="p-3.5 space-y-3.5 flex-1 w-full min-w-0">
        {/* Verification Status Banner when not approved */}
        {!isApproved && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3.5 rounded-2xl border shadow-xs space-y-2 ${
              isRejected
                ? 'bg-red-50/90 border-red-200 text-red-950'
                : 'bg-amber-50/90 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isRejected ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                {isRejected ? <AlertCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold">
                    {isRejected ? 'Application Needs Revision' : 'Admin Approval Required'}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                      isRejected ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {salonProfile?.verificationStatus || 'Pending Review'}
                  </span>
                </div>
                <p className="text-[10.5px] text-stone-700 leading-relaxed mt-0.5 font-normal">
                  {isRejected
                    ? salonProfile.rejectionReason || 'Your salon registration requires document updates before approval.'
                    : 'Your salon application is currently under review by our onboarding team. You can create, manage, and publish service offerings as soon as your account is approved.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[10.5px]">
              <span className="text-stone-500 font-medium">Step: Admin Verification Dossier</span>
              <button
                type="button"
                onClick={() => navigate('/salon/onboarding')}
                className="font-bold text-rose-900 hover:text-rose-950 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Status</span>
                <ChevronRight className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[14px] font-bold text-stone-900 tracking-tight">
              Service Catalog
            </h1>
            <p className="text-[10.5px] text-stone-400 font-normal">
              Manage treatments, pricing &amp; Instant Walk-in eligibility
            </p>
          </div>
          <button
            onClick={handleAddNew}
            disabled={!isApproved}
            title={!isApproved ? 'Admin approval required before adding services' : 'Add new service'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
              isApproved
                ? 'bg-rose-900 hover:bg-rose-950 active:scale-95 text-white cursor-pointer'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
            }`}
          >
            {!isApproved ? (
              <Lock className="w-3.5 h-3.5 stroke-[2.2]" />
            ) : (
              <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            )}
            <span>Add Service</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10.5px] font-semibold px-3 py-1 rounded-full shrink-0 transition-all ${
                  isActive
                    ? 'bg-rose-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Services List */}
        <div className="space-y-2.5">
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/80 shadow-xs space-y-3">
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
                  !isApproved ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-stone-100 text-stone-400'
                }`}
              >
                {!isApproved ? <Lock className="w-6 h-6 stroke-[2]" /> : <Scissors className="w-6 h-6 stroke-[2]" />}
              </div>

              <div>
                <p className="text-xs font-bold text-stone-800">
                  {!isApproved ? 'Service Listing Locked' : 'No services in this category'}
                </p>
                <p className="text-[11px] text-stone-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
                  {!isApproved
                    ? 'First approval from the admin is needed after onboarding. Only after approval can your salon list and publish treatments.'
                    : 'Start building your treatment menu by adding your first service.'}
                </p>
              </div>

              <button
                onClick={handleAddNew}
                disabled={!isApproved}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-all ${
                  isApproved
                    ? 'bg-rose-900 text-white cursor-pointer active:scale-95'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                }`}
              >
                {!isApproved ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{!isApproved ? 'Awaiting Admin Approval' : 'Add First Service'}</span>
              </button>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-2xl p-3.5 border transition-all shadow-xs space-y-2.5 ${
                  service.isActive ? 'border-stone-200/80' : 'border-stone-200 opacity-60'
                }`}
              >
                {/* Top Info Row */}
                <div className="flex items-start gap-2.5">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-xs font-semibold text-stone-800 leading-tight">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-1 text-stone-400 hover:text-purple-700 rounded active:scale-90"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(service)}
                          className="p-1 text-stone-400 hover:text-red-600 rounded active:scale-90"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[9.5px] text-stone-500 line-clamp-2 mt-0.5 leading-tight font-normal">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span className="font-semibold text-stone-900">₹{service.price}</span>
                      {service.originalPrice && (
                        <span className="text-[10px] text-stone-400 line-through font-normal">
                          ₹{service.originalPrice}
                        </span>
                      )}
                      <span className="text-stone-300">•</span>
                      <span className="text-[10px] text-stone-500 flex items-center gap-1 font-normal">
                        <Clock className="w-3 h-3 text-stone-400 stroke-[1.8]" />
                        {service.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operational Toggles Bar (Section 22 & 42.6) */}
                <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                  {/* Instant Booking Switch for this specific service */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleInstantEligible(service.id || service._id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9.5px] font-bold border transition-colors ${
                        service.isInstantEligible
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}
                      title="Toggle Instant Booking eligibility"
                    >
                      <Zap className={`w-2.5 h-2.5 stroke-[2] ${service.isInstantEligible ? 'fill-amber-500 text-amber-500' : ''}`} />
                      <span>{service.isInstantEligible ? 'Instant: Enabled' : 'Instant: Off'}</span>
                    </button>
                  </div>

                  {/* Active / Paused in customer app */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-semibold text-stone-500">
                      {service.isActive ? 'Active' : 'Hidden'}
                    </span>
                    <button
                      onClick={() => toggleServiceActive(service.id || service._id)}
                      className={`w-8 h-[18px] rounded-full p-0.5 transition-colors cursor-pointer relative shadow-inner ${
                        service.isActive ? 'bg-rose-900' : 'bg-stone-300'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                          service.isActive ? 'translate-x-3.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal(null)}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[320px] bg-[#1a1b23] rounded-3xl p-6 shadow-2xl border border-stone-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2 leading-tight">
                Delete Service "{deleteModal.name}"?
              </h3>
              <p className="text-[13px] text-stone-400 text-center mb-6 leading-relaxed">
                Are you sure you want to remove this service from your catalog? Customers will no longer be able to book it.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 py-3 px-4 rounded-xl text-[13px] font-bold text-stone-300 border border-stone-700 hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const targetId = deleteModal.id || deleteModal._id;
                    await deleteService(targetId);
                    setDeleteModal(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl text-[13px] font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
