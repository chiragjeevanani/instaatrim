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
import { AdOfferModal } from '../components/AdOfferModal';
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
      className="w-full max-w-[480px] lg:max-w-7xl lg:px-2 min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] lg:bg-none font-sans text-brand-textDark antialiased min-h-screen lg:min-h-0 pb-24 lg:pb-12 mx-auto border-x lg:border-x-0 border-purple-200/50 relative selection:bg-brand-lightPink flex flex-col justify-between overflow-x-hidden box-border shadow-md lg:shadow-none"
    >
      {/* 1. Header with Location, Search & Cart (mobile; desktop uses DesktopHeader) */}
      <TopBar />

      {/* 2. Audience Segment Switcher: All Services | Women | Men */}
      <div className="lg:flex lg:items-end lg:justify-between lg:gap-8 lg:px-4 lg:pt-8 lg:pb-3">
        <div className="hidden lg:block min-w-0">
          <h1 className="text-[28px] font-bold text-stone-900 tracking-tight leading-tight">
            Look good, book in seconds.
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Top-rated salons near you, verified partners and instant seat availability.
          </p>
        </div>
        <div className="lg:w-[420px] lg:shrink-0">
          <AudienceToggle selected={genderFilter} onChange={setGenderFilter} />
        </div>
      </div>

      <main className="flex-1 w-full min-w-0 overflow-x-hidden space-y-4 lg:space-y-8 pt-1">
        {/* 3. Top Sponsored Spotlight Carousel (paired with curated banners on desktop) */}
        <div className="lg:grid lg:grid-cols-5 lg:items-end">
          <div className="lg:col-span-3 min-w-0">
            <TopAdCarousel onSelectAd={handleOpenAd} />
          </div>
          <div className="hidden lg:block lg:col-span-2 min-w-0">
            {/* Offset by one so the two carousels never show the same campaign */}
            <HeroCarousel initialIndex={1} />
          </div>
        </div>

        {/* 4. Core Categories (Immediate 1-tap entry point, filtered by active audience) */}
        <CategoryGrid genderFilter={genderFilter} />

        {/* 5. Trending Services Near You (Scoped by gender & category tabs) */}
        <TrendingServices genderFilter={genderFilter} />

        {/* 6. Verified & Promoted Salons Strip */}
        <PromotedSalonsStrip />

        {/* 7. Featured Service Packages (Bookable Services) */}
        <FeaturedServicesShowcase genderFilter={genderFilter} />

        {/* 8. Curated Package Banners (shown beside the spotlight on desktop) */}
        <div className="lg:hidden">
          <HeroCarousel />
        </div>

        {/* 9. Elite Membership Pass Strip */}
        <EliteStrip />

        {/* 10. Mid-Page Native Ad / Campaign Banner */}
        <SponsoredDealBanner />
      </main>

      <BottomNav />

      {/* Global Modals & Drawers */}
      <AdOfferModal
        ad={selectedAd}
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
      />
    </div>
  );
};
