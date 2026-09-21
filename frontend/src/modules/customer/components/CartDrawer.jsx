import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Calendar, Zap, Tag, ChevronRight, ShieldCheck } from 'lucide-react';

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeFromCart,
    cartSummary,
    bookingSlot,
    setIsSlotPickerOpen,
    setIsBookingFlowOpen,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCustomer();

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsBookingFlowOpen(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Drawer Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-[480px] bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] rounded-t-2xl shadow-2xl max-h-[88vh] flex flex-col z-10 overflow-hidden border-t border-x border-purple-200/80"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-purple-200/60 bg-white/90 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 text-sm">Your Cart</h3>
              <span className="text-[10.5px] bg-purple-100 text-brand-maroon font-bold px-2 py-0.5 rounded-full">
                {cartItems.length} {cartItems.length === 1 ? 'service' : 'services'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-stone-500 hover:bg-stone-100 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-purple-100 text-brand-maroon rounded-full flex items-center justify-center mx-auto mb-2">
                  <Tag className="w-5 h-5" />
                </div>
                <p className="font-bold text-stone-800 text-xs">Your cart is empty</p>
                <p className="text-[10.5px] text-stone-500 mt-0.5">Explore trending treatments and add services to book</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-3 px-4 py-1.5 bg-brand-maroon text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              <>
                {/* Booking Mode & Slot Selector Banner - Compact */}
                <div className="bg-white border border-stone-200/80 rounded-xl p-2.5 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${bookingSlot.type === 'Instant' ? 'bg-amber-100 text-amber-900' : 'bg-purple-100 text-brand-maroon'}`}>
                      {bookingSlot.type === 'Instant' ? <Zap className="w-4 h-4 fill-amber-500" /> : <Calendar className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900">
                          {bookingSlot.type === 'Instant' ? 'Instant Booking' : 'Scheduled Slot'}
                        </span>
                        <span className="text-[9.5px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 font-semibold">
                          {bookingSlot.type === 'Instant' ? 'Ready Now' : bookingSlot.date}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-stone-500">
                        {bookingSlot.type === 'Instant' ? 'Seat ready in 15 mins' : bookingSlot.time}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSlotPickerOpen(true)}
                    className="text-[11px] font-bold text-brand-maroon px-2 py-0.5 rounded-lg hover:bg-purple-50 border border-brand-maroon/30 active:scale-95"
                  >
                    Change
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block px-0.5">
                    Selected Services
                  </span>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-stone-200/80 rounded-xl p-2.5 flex items-start justify-between gap-2 shadow-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-stone-900 truncate leading-tight">{item.name || item.title}</h5>
                        <p className="text-[10px] text-stone-500 mt-0.5">{item.duration} • {item.salonName || 'Salon Partner'}</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-xs font-black text-stone-900">₹{item.price}</span>
                          {item.originalPrice && (
                            <span className="text-[10px] text-stone-400 line-through">₹{item.originalPrice}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Promo Code & Coupon Section - Compact */}
                <div className="bg-white border border-stone-200/80 rounded-xl p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5 text-brand-maroon" />
                    <span className="text-xs font-bold text-stone-900">Offers & Coupons</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full font-bold">
                            Applied
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-700 mt-0.5">{appliedCoupon.description}</p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-bold text-red-600 hover:underline px-1"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Enter Promo Code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-stone-100 text-stone-800 text-xs px-2.5 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-maroon font-semibold uppercase"
                      />
                      <button
                        onClick={() => {
                          if (couponInput) applyCoupon(couponInput);
                        }}
                        className="bg-stone-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {/* Quick coupon suggestion chips */}
                  {!appliedCoupon && (
                    <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-stone-100">
                      <span className="text-[9.5px] text-stone-400 font-medium">Try:</span>
                      <button
                        onClick={() => applyCoupon('ELITE10')}
                        className="text-[9.5px] font-bold bg-purple-50 text-brand-maroon px-1.5 py-0.5 rounded border border-purple-200"
                      >
                        ELITE10 (10% OFF)
                      </button>
                      <button
                        onClick={() => applyCoupon('INSTA50')}
                        className="text-[9.5px] font-bold bg-purple-50 text-brand-maroon px-1.5 py-0.5 rounded border border-purple-200"
                      >
                        INSTA50 (₹50 OFF)
                      </button>
                    </div>
                  )}
                </div>

                {/* Bill Details - Compact */}
                <div className="bg-white border border-stone-200/80 rounded-xl p-3 shadow-xs space-y-1.5">
                  <h5 className="text-xs font-bold text-stone-800">Bill Breakdown</h5>
                  <div className="flex justify-between text-[11px] text-stone-600">
                    <span>Item Total</span>
                    <span>₹{cartSummary.subtotal}</span>
                  </div>
                  {cartSummary.discount > 0 && (
                    <div className="flex justify-between text-[11px] text-emerald-600 font-medium">
                      <span>Promo Discount ({appliedCoupon?.code})</span>
                      <span>-₹{cartSummary.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-stone-600">
                    <span className="flex items-center gap-1">
                      Safety & Hygiene Kit
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    </span>
                    <span className="text-stone-400 line-through">₹49</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="border-t border-stone-200 pt-1.5 flex justify-between font-black text-xs text-stone-900">
                    <span>To Pay</span>
                    <span>₹{cartSummary.finalAmount}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Button */}
          {cartItems.length > 0 && (
            <div className="p-3 bg-white border-t border-stone-200 shadow-soft-up">
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="text-stone-500 font-medium">Total Payable</span>
                <span className="text-sm font-black text-stone-900">₹{cartSummary.finalAmount}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-2.5 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
