import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCategories } from '../data/mockData';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const CategoryGrid = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/customer/salons?category=${encodeURIComponent(category.shortName)}`);
  };

  return (
    <section className="mt-5 px-4 relative w-full max-w-full min-w-0 box-border" data-purpose="service-categories">
      {/* 4-Column Grid with comfortable breathing room */}
      <div className="grid grid-cols-4 gap-x-2.5 gap-y-3.5 text-center w-full">
        {mockCategories.map((cat) => (
          <motion.div
            key={cat.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleCategoryClick(cat)}
            className={`group cursor-pointer ${cat.colSpan === 2 ? 'col-span-2' : ''}`}
          >
            <div
              className={`${
                cat.colSpan === 2
                  ? 'h-full max-h-[70px] rounded-2xl overflow-hidden bg-[#eaddf3]/70 shadow-xs'
                  : 'aspect-square rounded-2xl overflow-hidden bg-[#eaddf3]/70 shadow-xs'
              } transition-transform group-hover:scale-95`}
            >
              <img
                alt={cat.shortName}
                className="w-full h-full object-cover rounded-2xl"
                src={cat.image}
                loading="lazy"
              />
            </div>
            <span className="text-[8.5px] font-medium text-stone-700 mt-1 block leading-tight whitespace-pre-line tracking-tight">
              {cat.name}
            </span>
          </motion.div>
        ))}

        {/* Row 3 Col 4: Floating Explore Trends Badge */}
        <div className="col-start-4 flex justify-center items-start pt-1">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/customer/trends')}
            className="w-13 h-13 p-1.5 bg-[#1e2329] text-white rounded-2xl shadow-md border border-stone-700/60 flex flex-col items-center justify-center transition-transform cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-[7.5px] font-bold tracking-wider text-stone-300">EXPLORE</span>
          </motion.button>
        </div>
      </div>
    </section>
  );
};
