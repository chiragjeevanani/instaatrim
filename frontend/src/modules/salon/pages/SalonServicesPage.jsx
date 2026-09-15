import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { motion } from 'framer-motion';
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
  EyeOff
} from 'lucide-react';

export const SalonServicesPage = () => {
  const navigate = useNavigate();
  const { services, toggleServiceActive, toggleInstantEligible, deleteService } = useSalon();

  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Waxing', 'Facial', 'Spa', 'Body Polishing', 'Mani-Pedi', 'Grooming', 'Beard'];

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'All') return true;
    return s.category === selectedCategory;
  });

  const handleEdit = (service) => {
    navigate('/salon/services/new', { state: { serviceId: service.id } });
  };

  const handleAddNew = () => {
    navigate('/salon/services/new');
  };

  return (
    <div
      className="w-full max-w-[480px] min-w-0 bg-transparent font-sans text-stone-900 antialiased min-h-screen pb-24 mx-auto flex flex-col justify-between overflow-x-hidden box-border"
    >
      <main className="p-3.5 space-y-3.5 flex-1 w-full min-w-0">
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
            className="flex items-center gap-1.5 bg-rose-900 hover:bg-rose-950 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
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
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-2">
                <Scissors className="w-5 h-5 stroke-[2]" />
              </div>
              <p className="text-xs font-bold text-stone-800">No services in this category</p>
              <button
                onClick={handleAddNew}
                className="mt-3 px-3 py-1.5 bg-rose-900 text-white text-xs font-semibold rounded-xl"
              >
                Add First Service
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
                          onClick={() => deleteService(service.id)}
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
                      onClick={() => toggleInstantEligible(service.id)}
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
                      onClick={() => toggleServiceActive(service.id)}
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
    </div>
  );
};
