import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { useCustomer } from '../context/CustomerContext';
import { Sparkles, Star, MapPin, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SafeImage } from '../../../shared/components/SafeImage';
import { salonStartingPrice } from '../../../shared/store/selectors';

export const PromotedSalonsStrip = () => {
  const navigate = useNavigate();
  const { state } = useAppData();
  const { currentLocation } = useCustomer();

  const targetCity = currentLocation?.city?.toLowerCase()?.trim();
  const targetArea = currentLocation?.area?.toLowerCase()?.trim();

  // STRICT Location matching: Only show salons belonging to customer's selected city/area
  const isMatchingLocation = (salon) => {
    if (!targetCity) return true;
    const sCity = (salon.locationCity || salon.city || '').toLowerCase();
    const sArea = (salon.area || '').toLowerCase();
    const sAddr = (salon.address || '').toLowerCase();

    // Match if city matches, or if address/area contains the target city/area
    if (sCity && sCity.includes(targetCity)) return true;
    if (targetCity && (sArea.includes(targetCity) || sAddr.includes(targetCity))) return true;
    if (targetArea && (sArea.includes(targetArea) || sAddr.includes(targetArea))) return true;
    return false;
  };

  // Prioritize explicitly admin-boosted salons, ordered by boostRank, fallback to top verified salons
  const promotedSalons = state.salons
    .filter((s) => s.isVerified && s.verificationStatus === 'Live' && isMatchingLocation(s))
    .sort((a, b) => {
      const aBoost = a.isBoosted || a.isSponsored ? (a.boostRank || 1) : 999;
      const bBoost = b.isBoosted || b.isSponsored ? (b.boostRank || 1) : 999;
      if (aBoost !== bBoost) return aBoost - bBoost;
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 2);

  // If no promoted salons in this city, hide strip cleanly
  if (promotedSalons.length === 0) return null;

  return (
    <section className="mt-5 px-4 w-full max-w-full min-w-0 box-border" data-purpose="promoted-salons-homepage-strip">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base lg:text-lg font-bold text-stone-900 tracking-tight">Promoted Salons</h2>
          <span className="text-[8.5px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300/80 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
            Top Picks
          </span>
        </div>
        <button
          onClick={() => navigate('/customer/salons')}
          className="text-xs lg:text-[13px] font-bold text-brand-maroon hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-3 h-3 stroke-[2.5]" />
        </button>
      </div>

      <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-5">
        {promotedSalons.map((salon) => {
          return (
            <motion.article
              key={salon.id}
              whileHover={{ y: -1 }}
              onClick={() => navigate(`/customer/salons/${salon.id}`)}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all border-2 border-amber-400/90 shadow-md ring-2 ring-amber-300/30"
            >
              {/* Cover Image & Badges */}
              <div className="relative h-36 lg:h-48 w-full overflow-hidden bg-stone-100">
                <SafeImage
                  src={salon.coverImage}
                  alt={salon.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Badges overlay */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold bg-amber-400 text-stone-900 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 fill-stone-900 text-stone-900" />
                    SPONSORED • TOP PICK #{salon.boostRank || 1}
                  </span>

                  <span className="flex items-center gap-0.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[11px] font-bold text-amber-300 border border-amber-400/30 shadow-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{salon.rating || 4.8}</span>
                  </span>
                </div>

                {/* Instant Booking Ribbon */}
                {salon.hasInstantBooking && salon.isInstantBookingEnabled && (
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                    <Zap className="w-3 h-3 fill-current" />
                    <span>Seat Ready in 15 mins • 20% OFF</span>
                  </div>
                )}
              </div>

              {/* Details Body */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-stone-900 text-sm tracking-tight truncate flex items-center gap-1">
                      <span>{salon.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </h3>
                    <div className="flex items-center gap-2 text-stone-500 text-[11px] mt-0.5">
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>{salon.area || salon.locationCity || salon.city || 'Central Area'}</span>
                      </span>
                      {salon.startingPrice && (
                        <>
                          <span className="text-stone-300">•</span>
                          <span className="font-semibold text-stone-700">Starts at ₹{salon.startingPrice}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md shrink-0">
                    {salon.distanceKm != null ? `${salon.distanceKm} km` : '0.8 km'}
                  </span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};
