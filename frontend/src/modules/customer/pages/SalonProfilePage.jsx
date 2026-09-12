import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockSalons } from '../data/mockData';
import { useCustomer } from '../context/CustomerContext';
import { CartDrawer } from '../components/CartDrawer';
import { SlotPickerModal } from '../components/SlotPickerModal';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Heart,
  Zap,
  ShoppingBag,
  Plus,
  Check,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

export const SalonProfilePage = () => {
  const { salonId } = useParams();
  const navigate = useNavigate();
  const {
    favoriteSalonIds,
    toggleFavorite,
    cartItems,
    addToCart,
    cartSummary,
    setIsCartOpen,
    setIsSlotPickerOpen,
    bookingSlot
  } = useCustomer();

  const salon = mockSalons.find((s) => s.id === salonId) || mockSalons[0];
  const isFav = favoriteSalonIds.includes(salon.id);

  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(salon.services.map((s) => s.category))];

  const filteredServices =
    activeCategory === 'All'
      ? salon.services
      : salon.services.filter((s) => s.category === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-24 mx-auto border-x border-purple-200/50 relative overflow-x-hidden box-border"
    >
      {/* Hero Header with Cover Image */}
      <div className="relative h-52 w-full bg-stone-900">
        <img src={salon.coverImage} alt={salon.name} className="w-full h-full object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>

        {/* Top Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-stone-900 shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleFavorite(salon.id)}
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-stone-900 shadow-sm active:scale-95"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600 text-rose-600' : 'text-stone-700'}`} />
          </button>
        </div>

        {/* Salon Headline overlay */}
        <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold tracking-tight">{salon.name}</h1>
            {salon.isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-white" />}
          </div>
          <p className="text-[11px] text-stone-300 mt-0.5">{salon.tagline}</p>
          <div className="flex items-center gap-2.5 mt-1.5 text-[11px]">
            <div className="flex items-center gap-1 bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded font-extrabold shadow-xs text-[10px]">
              <Star className="w-3 h-3 fill-stone-950" />
              <span>{salon.rating}</span>
              <span className="font-normal">({salon.reviewsCount})</span>
            </div>
            <span className="text-stone-300">{salon.distance}</span>
            <span className="text-stone-300">•</span>
            <span className="text-emerald-300 font-semibold">Open Now</span>
          </div>
        </div>
      </div>

      {/* Instant Booking Banner */}
      {salon.hasInstantBooking && (
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-stone-900 shadow-xs shrink-0">
              <Zap className="w-3 h-3 fill-stone-950" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-950">Instant Booking Ready</span>
              <p className="text-[9.5px] text-amber-800">Seat ready in 15 mins</p>
            </div>
          </div>
          <button
            onClick={() => setIsSlotPickerOpen(true)}
            className="text-[10px] font-bold bg-amber-400 text-stone-950 px-2.5 py-1 rounded-lg active:scale-95 shadow-xs"
          >
            {bookingSlot.type === 'Instant' ? 'Instant Active' : 'Book Instant'}
          </button>
        </div>
      )}

      {/* Salon Info Card */}
      <section className="p-3.5 bg-white border-b border-stone-200/70 space-y-2 text-xs">
        <div className="flex items-start gap-2 text-stone-600 text-[11px]">
          <MapPin className="w-3.5 h-3.5 text-brand-maroon shrink-0 mt-0.5" />
          <span>{salon.address}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span>{salon.openHours}</span>
        </div>
        <div className="flex items-center gap-2 text-stone-600 text-[11px]">
          <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span>{salon.phone}</span>
        </div>

        {/* Amenities pills */}
        <div className="pt-2 border-t border-stone-100">
          <span className="text-[10px] font-bold text-stone-400 block mb-1 uppercase tracking-wider">
            Amenities & Hygiene
          </span>
          <div className="flex flex-wrap gap-1">
            {salon.amenities.map((am, i) => (
              <span
                key={i}
                className="text-[10px] bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded-full border border-stone-200 flex items-center gap-1"
              >
                <Shield className="w-2.5 h-2.5 text-brand-maroon" />
                {am}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Service Menu */}
      <section className="mt-2 bg-white pt-2.5 border-b border-stone-200/70">
        <div className="px-3.5 mb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Services Catalog</h2>
          <span className="text-[10.5px] font-semibold text-brand-maroon">{filteredServices.length} items</span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-3.5 overflow-x-auto no-scrollbar pb-2.5 border-b border-stone-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-[10.5px] font-bold shrink-0 transition-all ${
                activeCategory === cat
                  ? 'bg-brand-maroon text-white shadow-xs'
                  : 'bg-[#eaddf3] text-purple-950 hover:bg-[#e2d2ed]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Service Items */}
        <div className="divide-y divide-stone-100">
          {filteredServices.map((service) => {
            const isInCart = cartItems.some((item) => item.id === service.id);

            return (
              <article key={service.id} className="p-3.5 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-stone-900 leading-snug">{service.name}</h3>
                    {service.offer && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 shrink-0">
                        {service.offer}
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-stone-500 mt-0.5 line-clamp-2 leading-tight">{service.description}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs">
                    <span className="text-[10px] text-stone-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {service.duration}
                    </span>
                    <span className="text-stone-300">•</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-extrabold text-xs text-stone-900">₹{service.price}</span>
                      {service.originalPrice && (
                        <span className="text-[10px] text-stone-400 line-through">₹{service.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add / Added Button */}
                <div className="shrink-0">
                  {isInCart ? (
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="px-2.5 py-1 rounded-lg border border-emerald-600 bg-emerald-50 text-emerald-700 font-bold text-[10.5px] flex items-center gap-1 active:scale-95 shadow-xs"
                    >
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Added</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => addToCart(service, salon)}
                      className="px-3 py-1 rounded-lg border border-brand-maroon bg-rose-50/60 text-brand-maroon hover:bg-rose-100 font-bold text-[10.5px] flex items-center gap-1 active:scale-95 shadow-xs transition-colors"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Floating Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto p-2.5 bg-white/95 backdrop-blur-md border-t border-stone-200 z-40 shadow-soft-up box-border">
          <div className="flex items-center justify-between gap-2.5">
            <div>
              <span className="text-[10px] text-stone-500 font-medium">
                {cartItems.length} {cartItems.length === 1 ? 'service' : 'services'} added
              </span>
              <p className="text-sm font-black text-stone-900 leading-tight">₹{cartSummary.finalAmount}</p>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="py-2.5 px-5 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>View Cart &amp; Book</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer & Slot Picker */}
      <CartDrawer />
      <SlotPickerModal />
    </motion.div>
  );
};
