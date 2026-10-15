import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SafeImage } from '../../../shared/components/SafeImage';

export const CategoryGrid = ({ genderFilter = 'all' }) => {
  const navigate = useNavigate();
  const { state } = useAppData();

  const handleCategoryClick = (category) => {
    navigate(`/customer/salons?category=${category.slug}`);
  };

  const visibleCategories = useMemo(() => {
    let cats = state.categories || [];
    
    // Only show active categories
    cats = cats.filter(c => c.isActive !== false);

    if (genderFilter === 'men') {
      return cats.filter(c => c.gender === 'men' || c.gender === 'unisex');
    }
    if (genderFilter === 'women') {
      return cats.filter(c => c.gender === 'women' || c.gender === 'unisex');
    }
    
    // 'all'
    return cats;
  }, [genderFilter, state.categories]);

  const headerTitle =
    genderFilter === 'men'
      ? "Men's Salon & Grooming"
      : genderFilter === 'women'
      ? "Women's Salon & Styling"
      : 'Explore Services';

  return (
    <section className="mt-4 px-4 relative w-full max-w-full min-w-0 box-border" data-purpose="service-categories">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h2 className="text-base lg:text-lg font-bold text-stone-900 tracking-tight">
          {headerTitle}
        </h2>
        <button
          type="button"
          onClick={() => navigate('/customer/salons')}
          className="text-xs lg:text-[13px] font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4-Column Grid with clean, modern card styling */}
      <AnimatePresence mode="wait">
        <motion.div
          key={genderFilter}
          initial={{ opacity: 0.8, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0.8, y: -3 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-x-2.5 gap-y-3.5 lg:gap-x-4 lg:gap-y-5 text-center w-full"
        >
          {visibleCategories.map((cat) => (
            <motion.div
              key={cat.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleCategoryClick(cat)}
              className="group cursor-pointer flex flex-col items-center"
            >
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#eaddf3]/70 border border-purple-200/50 shadow-2xs transition-transform group-hover:scale-96 relative">
                <SafeImage
                  alt={cat.shortName || cat.name}
                  className="w-full h-full object-cover rounded-2xl"
                  src={cat.image}
                  loading="lazy"
                />
              </div>
              <span className="text-[11px] lg:text-[13px] font-semibold text-stone-800 mt-1.5 lg:mt-2 block leading-tight tracking-tight line-clamp-1">
                {cat.shortName || cat.name}
              </span>
              {cat.price > 0 && (
                <div className="flex items-center justify-center gap-1 mt-0.5 leading-tight flex-wrap">
                  {cat.discount > 0 && cat.originalPrice ? (
                    <>
                      <span className="text-[10px] lg:text-[11px] font-bold text-stone-900">
                        ₹{cat.originalPrice}
                      </span>
                      <span className="text-[9px] lg:text-[10px] text-stone-400 line-through">
                        ₹{cat.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] lg:text-[11px] font-medium text-stone-500">
                      Starts ₹{cat.price}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}

        </motion.div>
      </AnimatePresence>
    </section>
  );
};
