import React, { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { AudienceToggle } from '../components/AudienceToggle';
import { TopAdCarousel } from '../components/TopAdCarousel';
import { CategoryGrid } from '../components/CategoryGrid';
import { TrendingServices } from '../components/TrendingServices';
import { FeaturedServicesShowcase } from '../components/FeaturedServicesShowcase';
import { PromotedSalonsStrip } from '../components/PromotedSalonsStrip';
import { HeroCarousel } from '../components/HeroCarousel';
import { EliteStrip } from '../components/EliteStrip';
import { SponsoredDealBanner } from '../components/SponsoredDealBanner';
import { SubCategoryGrid } from '../components/SubCategoryGrid';
import { BottomNav } from '../components/BottomNav';
import { CartDrawer } from '../components/CartDrawer';
import { SlotPickerModal } from '../components/SlotPickerModal';
import { BookingFlowModal } from '../components/BookingFlowModal';
import { ReferEarnModal } from '../components/ReferEarnModal';
import { EliteModal } from '../components/EliteModal';
import { AdOfferModal } from '../components/AdOfferModal';
import { ServiceDetailModal } from '../components/ServiceDetailModal';
import { useCustomer } from '../context/CustomerContext';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const [selectedAd, setSelectedAd] = useState(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'women' | 'men'

  const navigate = useNavigate();
  const { applyCoupon, showToast } = useCustomer();

  const handleOpenAd = (ad) => {
    setSelectedAd(ad);
    setIsAdModalOpen(true);
  };

  const handleSelectBrand = (brand) => {
    if (brand.couponCode) {
      applyCoupon(brand.couponCode);
      showToast(`🎁 ${brand.fullName || brand.name} Partner Salons: ${brand.offer} coupon applied!`);
    }
    navigate(`/customer/salons?brand=${encodeURIComponent(brand.name)}`);
  };

  return (
    <div
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] font-sans text-brand-textDark antialiased min-h-screen pb-24 mx-auto border-x border-purple-200/50 relative selection:bg-brand-lightPink flex flex-col justify-between overflow-x-hidden box-border shadow-md"
    >
      {/* 1. Header with Location, Search & Cart */}
      <TopBar />

      {/* 2. Audience Segment Switcher: All Services | Women | Men */}
      <AudienceToggle selected={genderFilter} onChange={setGenderFilter} />

      <main className="flex-1 w-full min-w-0 overflow-x-hidden space-y-4 pt-1">
        {/* 3. Top Sponsored Spotlight Carousel */}
        <TopAdCarousel onSelectAd={handleOpenAd} />

        {/* 4. Core Categories (Immediate 1-tap entry point, filtered by active audience) */}
        <CategoryGrid genderFilter={genderFilter} />

        {/* 5. Trending Services Near You (Scoped by gender & category tabs) */}
        <TrendingServices genderFilter={genderFilter} />

        {/* 6. Verified & Promoted Salons Strip */}
        <PromotedSalonsStrip />

        {/* 7. Featured Service Packages (Bookable Services) */}
        <FeaturedServicesShowcase genderFilter={genderFilter} />

        {/* 8. Curated Package Banners */}
        <HeroCarousel />

        {/* 9. Elite Membership Pass Strip */}
        <EliteStrip />

        {/* 10. Mid-Page Native Ad / Campaign Banner */}
        <SponsoredDealBanner />
      </main>

      <BottomNav />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <BookingFlowModal />
      <SlotPickerModal />
      <ReferEarnModal />
      <EliteModal />
      <AdOfferModal
        ad={selectedAd}
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
      />
      <ServiceDetailModal />
    </div>
  );
};
