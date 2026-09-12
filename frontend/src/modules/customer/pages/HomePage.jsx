import React from 'react';
import { TopBar } from '../components/TopBar';
import { HeroCarousel } from '../components/HeroCarousel';
import { EliteStrip } from '../components/EliteStrip';
import { CategoryGrid } from '../components/CategoryGrid';
import { TrendingServices } from '../components/TrendingServices';
import { SubCategoryGrid } from '../components/SubCategoryGrid';
import { BottomNav } from '../components/BottomNav';
import { CartDrawer } from '../components/CartDrawer';
import { SlotPickerModal } from '../components/SlotPickerModal';
import { ReferEarnModal } from '../components/ReferEarnModal';
import { EliteModal } from '../components/EliteModal';
import { motion } from 'framer-motion';

export const HomePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] font-sans text-brand-textDark antialiased min-h-screen pb-28 mx-auto border-x border-purple-200/50 relative selection:bg-brand-lightPink flex flex-col justify-between overflow-x-hidden box-border"
    >
      <TopBar />

      <main className="flex-1 w-full min-w-0 overflow-x-hidden">
        <HeroCarousel />
        <EliteStrip />
        <CategoryGrid />
        <TrendingServices />
        <SubCategoryGrid />
      </main>

      <BottomNav />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <SlotPickerModal />
      <ReferEarnModal />
      <EliteModal />
    </motion.div>
  );
};
