import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES as mockCategories } from '../../../shared/data/seed';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export const CategoryGrid = ({ genderFilter = 'all' }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/customer/salons?category=${category.slug}`);
  };

  const visibleCategories = useMemo(() => {
    if (genderFilter === 'men') {
      return [
        {
          id: 'cat-grooming',
          slug: 'grooming',
          name: "Men's Styling",
          shortName: "Men's Styling",
          image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-beard',
          slug: 'beard',
          name: 'Beard Sculpting',
          shortName: 'Beard Sculpting',
          image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-hair-men',
          slug: 'hair',
          name: 'Haircut & Fade',
          shortName: 'Hair & Fade',
          image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-facial-men',
          slug: 'facial',
          name: 'Men\'s Charcoal Facial',
          shortName: 'Men\'s Facial',
          image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-spa-men',
          slug: 'spa',
          name: 'Head & Deep Tissue Spa',
          shortName: 'Massage & Spa',
          image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-manipedi-men',
          slug: 'mani-pedi',
          name: 'Men\'s Hand & Foot Care',
          shortName: 'Hand & Foot Care',
          image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-body-men',
          slug: 'body-polishing',
          name: 'Body Detox & Scrub',
          shortName: 'Body Detox',
          image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80'
        }
      ];
    }
    if (genderFilter === 'women') {
      return [
        {
          id: 'cat-hair-women',
          slug: 'hair',
          name: 'Hair Studio',
          shortName: 'Hair Studio',
          image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-facial-women',
          slug: 'facial',
          name: 'Glow Facials',
          shortName: 'Facials',
          image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-waxing-women',
          slug: 'waxing',
          name: 'Waxing & RICA',
          shortName: 'Waxing',
          image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-manipedi-women',
          slug: 'mani-pedi',
          name: 'Mani-Pedi & Nails',
          shortName: 'Mani-Pedi',
          image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-spa-women',
          slug: 'spa',
          name: 'Aroma & Head Spa',
          shortName: 'Spa & Wellness',
          image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-makeup-women',
          slug: 'makeup',
          name: 'Makeup & Styling',
          shortName: 'Makeup & Styling',
          image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80'
        },
        {
          id: 'cat-body-women',
          slug: 'body-polishing',
          name: 'Korean Body Polish',
          shortName: 'Body Polish',
          image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80'
        }
      ];
    }
    // 'all' - Show balanced curation with modern, high-aesthetic imagery
    return [
      {
        id: 'cat-hair-all',
        slug: 'hair',
        name: 'Hair Studio',
        shortName: 'Hair Studio',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'cat-grooming-all',
        slug: 'grooming',
        name: "Men's Grooming",
        shortName: "Men's Grooming",
        image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'cat-facial-all',
        slug: 'facial',
        name: 'Facials & Cleanups',
        shortName: 'Facials',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'cat-beard-all',
        slug: 'beard',
        name: 'Beard Grooming',
        shortName: 'Beard Grooming',
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'cat-spa-all',
        slug: 'spa',
        name: 'Relaxation & Spa',
        shortName: 'Spa',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'cat-manipedi-all',
        slug: 'mani-pedi',
        name: 'Mani-Pedi',
        shortName: 'Mani-Pedi',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'cat-waxing-all',
        slug: 'waxing',
        name: 'Waxing & Smooth',
        shortName: 'Waxing',
        image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=400&q=80'
      }
    ];
  }, [genderFilter]);

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
        <h2 className="text-[14px] font-bold text-stone-900 tracking-tight">
          {headerTitle}
        </h2>
        <button
          type="button"
          onClick={() => navigate('/customer/salons')}
          className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer transition-colors"
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
          className="grid grid-cols-4 gap-x-2.5 gap-y-3.5 text-center w-full"
        >
          {visibleCategories.map((cat) => (
            <motion.div
              key={cat.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleCategoryClick(cat)}
              className="group cursor-pointer flex flex-col items-center"
            >
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#eaddf3]/70 border border-purple-200/50 shadow-2xs transition-transform group-hover:scale-96 relative">
                <img
                  alt={cat.shortName}
                  className="w-full h-full object-cover rounded-2xl"
                  src={cat.image}
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-semibold text-stone-800 mt-1.5 block leading-tight tracking-tight line-clamp-1">
                {cat.shortName || cat.name}
              </span>
            </motion.div>
          ))}

          {/* Explore Trends Tile */}
          <div className="flex flex-col items-center justify-start">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate('/customer/trends')}
              className="w-full aspect-square p-2 bg-[#1e2329] text-white rounded-2xl shadow-sm border border-stone-700/60 flex flex-col items-center justify-center transition-transform cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400 mb-0.5" />
              <span className="text-[8.5px] font-bold tracking-wider text-stone-200 uppercase">
                Trends
              </span>
            </motion.button>
            <span className="text-[10px] font-semibold text-stone-500 mt-1.5 block leading-tight">
              Inspirations
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
