import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { X, Sparkles, Check, Crown } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';

export const EliteModal = () => {
  const { isEliteModalOpen, setIsEliteModalOpen, user, showToast, fetchMyProfile } = useCustomer();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (isEliteModalOpen) {
      fetch(`${API_BASE}/page-campaigns/elite`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setConfig(data.data);
          }
        })
        .catch(console.error);
    }
  }, [isEliteModalOpen]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  if (!isEliteModalOpen) return null;

  const benefits = config?.benefits || [];
  
  const plans = config?.plans?.length > 0 ? config.plans : [
    { planName: 'Annual', durationMonths: 12, price: 299, originalPrice: 999 }
  ];
  
  const selectedPlan = plans[selectedPlanIndex] || plans[0];
  const price = selectedPlan.price;

  const confirmMembership = async (paymentId, method) => {
    if (!user || !user.id) {
      showToast('Please login to purchase membership');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/customers/${user.id}/elite`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (data.success) {
        showToast('You are now an DrimStyle Elite Club Member! 🎉');
        if (fetchMyProfile) await fetchMyProfile();
        setIsEliteModalOpen(false);
      } else {
        throw new Error('Failed to update membership');
      }
    } catch (e) {
      console.error(e);
      showToast('Error confirming membership');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoinCOD = () => {
    setIsProcessing(true);
    // Simulate COD API call
    setTimeout(() => {
      confirmMembership(null, 'COD');
    }, 800);
  };

  const handleJoinRazorpay = async () => {
    if (!user || !user.id) {
      showToast('Please login to purchase membership');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price })
      });
      const data = await res.json();
      
      if (!data.success) throw new Error('Failed to initialize payment');

      const options = {
        key: 'rzp_test_S3IcSS1NbymL6D', 
        amount: data.data.amount,
        currency: data.data.currency,
        name: 'DrimStyle',
        description: 'Elite Membership',
        order_id: data.data.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              confirmMembership(response.razorpay_payment_id, 'Paid');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyErr) {
            showToast('Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.name || 'Customer',
          contact: user.phone || ''
        },
        theme: { color: '#fbbf24' },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            showToast('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        showToast('Payment failed: ' + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      showToast(err?.message || 'Failed to start payment');
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isProcessing && setIsEliteModalOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-[380px] bg-gradient-to-b from-stone-900 to-black text-white rounded-2xl shadow-2xl p-4 z-10 space-y-3 border border-amber-400/30 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => !isProcessing && setIsEliteModalOpen(false)}
            className="absolute top-3 right-3 p-1 rounded-full text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold text-amber-300 tracking-wider">ELITE</span>
                <span className="text-[9px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-full border border-amber-400/40 uppercase">
                  VIP Club
                </span>
              </div>
              <p className="text-[10.5px] text-stone-300 leading-tight mt-0.5">Luxury perks &amp; guaranteed savings</p>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-1.5 pt-1">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-stone-200 leading-tight">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Pricing Plans */}
          <div className="space-y-2 mt-2">
            {plans.map((plan, idx) => {
              const isSelected = selectedPlanIndex === idx;
              const discountPercent = Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100);
              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedPlanIndex(idx)}
                  className={`relative p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'bg-amber-400/10 border-amber-400' : 'bg-white/5 border-stone-700 hover:bg-white/10'}`}
                >
                  <div className="flex flex-col">
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${isSelected ? 'text-amber-400' : 'text-stone-300'}`}>
                      {plan.planName} Membership
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-base font-black text-white">₹{plan.price}</span>
                      {plan.originalPrice > plan.price && (
                        <>
                          <span className="text-[10px] text-stone-400 line-through">₹{plan.originalPrice}</span>
                          <span className="text-[9.5px] font-bold text-emerald-400">{discountPercent}% OFF</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-stone-300 font-medium">{plan.durationMonths} Months</span>
                    <div className={`w-4 h-4 rounded-full mt-1 flex items-center justify-center border ${isSelected ? 'bg-amber-400 border-amber-400' : 'border-stone-500'}`}>
                      {isSelected && <Check className="w-3 h-3 text-stone-900 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2 mt-2">
            <button
              disabled={isProcessing}
              onClick={handleJoinCOD}
              className="flex-1 bg-stone-800 text-amber-400 font-bold text-xs py-2.5 rounded-xl shadow border border-amber-400/30 transition-all active:scale-[0.985] flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Pay via COD
            </button>
            <button
              disabled={isProcessing}
              onClick={handleJoinRazorpay}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.985] flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pay Online</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
