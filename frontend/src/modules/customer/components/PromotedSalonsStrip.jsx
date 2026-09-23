import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { Sparkles, Star, MapPin, Zap, ChevronRight, CheckCircle2 } from 'lucide-react';

export const PromotedSalonsStrip = () => {
  const navigate = useNavigate();
  const { state } = useAppData();

  // Prioritize explicitly admin-boosted salons, ordered by boostRank, fallback to top verified salons
  const promotedSalons = state.salons
    .filter((s) => s.isVerified && s.verificationStatus === 'Live')
    .sort((a, b) => {
      const aBoost = a.isBoosted || a.isSponsored ? (a.boostRank || 1) : 999;
      const bBoost = b.isBoosted || b.isSponsored ? (b.boostRank || 1) : 999;
      if (aBoost !== bBoost) return aBoost - bBoost;
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 2);

  if (promotedSalons.length === 0) return null;

  return (
    <section className="mt-5 px-4 w-full max-w-full min-w-0 box-border" data-purpose="promoted-salons-homepage-strip">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[12.5px] font-bold text-stone-900 tracking-tight">Promoted Salons</h2>
          <span className="text-[8.5px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300/80 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
            Top Picks
          </span>
        </div>
        <button
          onClick={() => navigate('/customer/salons')}
          className="text-[9.5px] font-bold text-brand-maroon hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-3 h-3 stroke-[2.5]" />
        </button>
      </div>

      <div className="space-y-3">
        {promotedSalons.map((salon, index) => {
          return (
            <motion.article
              key={salon.id}
              whileHover={{ y: -1 }}
              onClick={() => navigate(`/customer/salons/${salon.id}`)}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all border-2 border-amber-400/90 shadow-md ring-2 ring-amber-300/30"
            >
              {/* Cover Image & Badges */}
              <div className="relative h-32 w-full overflow-hidden bg-stone-100">
                <img
                  src={salon.coverImage}
                  alt={salon.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top Badge: SPONSORED • TOP PICK */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                  <span className="bg-amber-400 text-stone-950 text-[8.5px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-1 uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                    {salon.sponsorBadge || `SPONSORED • TOP PICK #${index + 1}`}
                  </span>
                  <div className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{salon.rating}</span>
                  </div>
                </div>

                {/* Instant Seat Tag */}
                <div className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-xs border border-emerald-400/50 text-emerald-300 text-[9px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                  <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                  <span>Seat Ready in 15 mins • 20% OFF</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-stone-900 text-xs">{salon.name}</h3>
                      {salon.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">{salon.tagline}</p>
                  </div>
                  <span className="text-[9.5px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full shrink-0">
                    {salon.distanceKm ? `${salon.distanceKm.toFixed(1)} km` : '0.8 km'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2 text-[10.5px] text-stone-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                    {salon.area}
                  </span>
                  <span>•</span>
                  <span>Starts at <strong className="text-stone-900 font-bold">₹{salon.startingPrice}</strong></span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};
