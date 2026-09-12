import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { mockSalons } from '../data/mockData';
import { useCustomer } from '../context/CustomerContext';
import { BottomNav } from '../components/BottomNav';
import { CartDrawer } from '../components/CartDrawer';
import { Search, ArrowLeft, Star, Heart, Zap, CheckCircle2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const SalonListingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentLocation, favoriteSalonIds, toggleFavorite } = useCustomer();

  const categoryQuery = searchParams.get('category') || '';
  const [searchTerm, setSearchTerm] = useState(categoryQuery);
  const [selectedGender, setSelectedGender] = useState('All');
  const [instantOnly, setInstantOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Recommended');

  const filteredSalons = useMemo(() => {
    return mockSalons
      .filter((salon) => {
        const matchesSearch =
          !searchTerm ||
          salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          salon.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
          salon.services.some((s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.category.toLowerCase().includes(searchTerm.toLowerCase())
          );

        const matchesGender =
          selectedGender === 'All' ||
          salon.category.toLowerCase() === selectedGender.toLowerCase() ||
          salon.category.toLowerCase() === 'unisex';

        const matchesInstant = !instantOnly || salon.hasInstantBooking;

        return matchesSearch && matchesGender && matchesInstant;
      })
      .sort((a, b) => {
        if (sortBy === 'Highest Rated') return b.rating - a.rating;
        if (sortBy === 'Nearest') return parseFloat(a.distance) - parseFloat(b.distance);
        if (sortBy === 'Price Low to High') return a.startingPrice - b.startingPrice;
        return 0;
      });
  }, [searchTerm, selectedGender, instantOnly, sortBy]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-20 mx-auto border-x border-purple-200/50 flex flex-col justify-between overflow-x-hidden box-border"
    >
      {/* Top Bar with Search */}
      <header className="sticky top-0 z-30 bg-[#f8f4fb]/95 backdrop-blur-md px-3.5 pt-2 pb-2 border-b border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="p-1 text-stone-700 active:scale-95">
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xs font-bold text-stone-900 truncate">
              {categoryQuery ? `${categoryQuery} in ${currentLocation?.area || 'Indore'}` : 'Discover Salons & Spas'}
            </h1>
            <p className="text-[10px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-brand-maroon shrink-0" />
              {currentLocation?.area || 'South Tukoganj'}
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5 pointer-events-none stroke-[1.8]" />
          <input
            type="text"
            placeholder="Search salon, waxing, facial, nails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#eaddf3] rounded-xl text-xs text-stone-800 placeholder-stone-500 border border-purple-200/60 focus:outline-none focus:ring-1 focus:ring-brand-maroon"
          />
        </div>

        {/* Filter & Sort Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-0.5 text-xs">
          <button
            onClick={() => setInstantOnly(!instantOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold shrink-0 transition-colors ${
              instantOnly
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-[#eaddf3] text-purple-950 hover:bg-[#e2d2ed]'
            }`}
          >
            <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>Instant Booking</span>
          </button>

          {['All', 'Women', 'Unisex'].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold shrink-0 transition-colors ${
                selectedGender === g
                  ? 'bg-brand-maroon text-white shadow-xs'
                  : 'bg-[#eaddf3] text-purple-950 hover:bg-[#e2d2ed]'
              }`}
            >
              {g}
            </button>
          ))}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#eaddf3] text-purple-950 text-[10.5px] px-2 py-1 rounded-full border border-purple-200/60 outline-none shrink-0"
          >
            <option value="Recommended">Recommended</option>
            <option value="Nearest">Nearest</option>
            <option value="Highest Rated">Top Rated</option>
            <option value="Price Low to High">Price</option>
          </select>
        </div>
      </header>

      {/* Salon Results List */}
      <main className="flex-1 p-3 space-y-2.5">
        <div className="flex justify-between items-center px-1">
          <span className="text-[11px] font-bold text-stone-600">
            {filteredSalons.length} {filteredSalons.length === 1 ? 'salon' : 'salons'} available
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Real-Time Slots
          </span>
        </div>

        {filteredSalons.map((salon) => {
          const isFav = favoriteSalonIds.includes(salon.id);

          return (
            <motion.article
              key={salon.id}
              whileHover={{ y: -1 }}
              onClick={() => navigate(`/customer/salons/${salon.id}`)}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden cursor-pointer"
            >
              {/* Image & Badges */}
              <div className="relative h-36 w-full overflow-hidden bg-stone-100">
                <img
                  src={salon.coverImage}
                  alt={salon.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Rating Badge */}
                <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{salon.rating}</span>
                  <span className="text-stone-300 font-normal text-[9.5px]">({salon.reviewsCount})</span>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(salon.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-800 active:scale-90 transition-transform shadow"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-600 text-rose-600' : 'text-stone-600'}`}
                  />
                </button>

                {/* Offer tag */}
                {salon.offer && (
                  <div className="absolute bottom-2 left-2 bg-brand-maroon/95 text-white text-[9.5px] font-bold px-2 py-0.5 rounded shadow">
                    {salon.offer}
                  </div>
                )}

                {/* Instant slot tag */}
                {salon.hasInstantBooking && (
                  <div className="absolute bottom-2 right-2 bg-amber-400 text-stone-950 text-[9.5px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow">
                    <Zap className="w-2.5 h-2.5 fill-stone-950" />
                    <span>{salon.nextSlot}</span>
                  </div>
                )}
              </div>

              {/* Salon Details */}
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <h2 className="font-bold text-stone-900 text-sm">{salon.name}</h2>
                      {salon.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{salon.tagline}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                    {salon.distance}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400 text-[11px]">Starts </span>
                    <span className="font-black text-stone-900 text-xs">₹{salon.startingPrice}</span>
                  </div>
                  <button className="text-brand-maroon font-bold text-[11px] hover:underline flex items-center gap-0.5">
                    View Services &rarr;
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </main>

      <BottomNav />
      <CartDrawer />
    </motion.div>
  );
};
