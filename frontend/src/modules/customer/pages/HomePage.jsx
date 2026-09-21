import React, { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { TopAdCarousel } from '../components/TopAdCarousel';
import { HeroCarousel } from '../components/HeroCarousel';
import { BrandPartnerShowcase } from '../components/BrandPartnerShowcase';
import { EliteStrip } from '../components/EliteStrip';
import { CategoryGrid } from '../components/CategoryGrid';
import { SponsoredDealBanner } from '../components/SponsoredDealBanner';
import { TrendingServices } from '../components/TrendingServices';
import { SubCategoryGrid } from '../components/SubCategoryGrid';
import { BottomNav } from '../components/BottomNav';
import { CartDrawer } from '../components/CartDrawer';
import { SlotPickerModal } from '../components/SlotPickerModal';
import { BookingFlowModal } from '../components/BookingFlowModal';
import { ReferEarnModal } from '../components/ReferEarnModal';
import { EliteModal } from '../components/EliteModal';
import { AdOfferModal } from '../components/AdOfferModal';
import { PromotedSalonsStrip } from '../components/PromotedSalonsStrip';
import { useCustomer } from '../context/CustomerContext';
import { TOP_ADVERTISEMENTS } from '../../../shared/data/advertisements';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const [selectedAd, setSelectedAd] = useState(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
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
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] font-sans text-brand-textDark antialiased min-h-screen pb-28 mx-auto border-x border-purple-200/50 relative selection:bg-brand-lightPink flex flex-col justify-between overflow-x-hidden box-border"
    >
      <TopBar />

      <main className="flex-1 w-full min-w-0 overflow-x-hidden">
        {/* Touchpoint 1: Top Carousel for Advertisements & Sponsored Brands */}
        <TopAdCarousel onSelectAd={handleOpenAd} />

        {/* Touchpoint 2: Brand Partner Carousel & Collaborations */}
        <BrandPartnerShowcase onSelectBrand={handleSelectBrand} />

        {/* Hero Curated Services Carousel */}
        <HeroCarousel />

        {/* Elite Membership Strip */}
        <EliteStrip />

        {/* Core Categories */}
        <CategoryGrid />

        {/* Touchpoint 3: Mid-Page Native Ad / Campaign Banner */}
        <SponsoredDealBanner />

        {/* Trending Services Near You */}
        <TrendingServices />

        {/* Touchpoint 4: Promoted / Sponsored Salons Homepage Featured Strip */}
        <PromotedSalonsStrip />

        {/* Sub-Categories / Popular Services */}
        <SubCategoryGrid />
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
    </div>
  );
};
