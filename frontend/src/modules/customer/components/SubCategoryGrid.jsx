import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { CATEGORIES } from '../../../shared/data/seed';
import { motion } from 'framer-motion';

// This used to keep its own separate "sub-category" taxonomy
// (mockSubCategories) with different ids and titles than the home
// category grid above it — two lists that could quietly drift apart.
// It now reuses the single shared taxonomy so there's one place that
// defines what a category is and how it maps to services.
const subCategorySlugs = ['waxing', 'facial', 'body-polishing', 'mani-pedi', 'hair', 'beard', 'grooming', 'mehandi'];
export const SubCategoryGrid = () => {
  const navigate = useNavigate();
  const { state } = useAppData();
  const subCategories = useMemo(() => {
    const categories = state.categories?.length ? state.categories : CATEGORIES;
    return subCategorySlugs
      .map((slug) => categories.find((category) => category.slug === slug && category.isActive !== false))
      .filter(Boolean)
      .map((category) => ({ id: category.id, title: category.shortName || category.name, image: category.image, slug: category.slug }));
  }, [state.categories]);

  return (
    <section className="mt-8 px-4 w-full max-w-full min-w-0 box-border" data-purpose="sub-categories-showcase">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-bold text-stone-900 tracking-tight">Popular Services Near You</h2>
        <button
          onClick={() => navigate('/customer/salons')}
          className="inline-flex items-center text-[10.5px] font-bold text-brand-maroon group active:opacity-80"
        >
          <span>SEE ALL</span>
          <span className="ml-1 bg-brand-maroon text-white rounded-full p-0.5 transition transform group-hover:translate-x-0.5">
            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
            </svg>
          </span>
        </button>
      </div>

      {/* 3-Column Visual Grid - Generous & Spacious */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {subCategories.map((item) => (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/customer/salons?category=${item.slug}`)}
            className="relative rounded-xl overflow-hidden aspect-[4/4.8] bg-[#eaddf3] group cursor-pointer shadow-2xs"
          >
            <img
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={item.image}
              loading="lazy"
            />
            {/* Top gradient wash for text readability */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/45 to-transparent"></div>
            <span className="absolute top-2 left-2 text-[10.5px] font-bold text-white drop-shadow-xs">
              {item.title}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

