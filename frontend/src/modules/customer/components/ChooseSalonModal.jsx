import { AnimatePresence, motion } from 'framer-motion';
import { X, Clock, MapPin, Star, Store } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { formatDuration } from '../../../shared/store/selectors';

// Cards show the offer price (display only); the cart gets the plain service and applies the offer itself
const forCart = ({ offerDeal, options, groupKey, salonCount, ...service }) => service; // eslint-disable-line no-unused-vars

/**
 * "Choose a Salon" — opened from Trending Near You / Featured Service Packages.
 * Lists every salon offering this service (DB) with its own price; the picked salon's service goes to the cart.
 */
export const ChooseSalonModal = ({ group, onClose }) => {
  const { addToCart, cartItems } = useCustomer();
  if (!group) return null;

  const pick = (opt) => {
    addToCart(forCart(opt), { id: opt.salonId, name: opt.salonName });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col"
        >
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-stone-100">
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold text-brand-maroon uppercase tracking-wider">Choose a Salon</p>
              <h3 className="text-base font-bold text-stone-900 truncate">{group.name || group.title}</h3>
              <p className="text-[11px] text-stone-500">
                {group.salonCount > 1 ? `Available at ${group.salonCount} salons near you` : 'Available at 1 salon near you'}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto px-4 py-3 space-y-2">
            {group.options.map((opt) => {
              const inCart = cartItems.some((i) => i.id === opt.id);
              const deal = opt.offerDeal;
              return (
                <div key={opt.id} className="border border-stone-200 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-stone-900 flex items-center gap-1.5 truncate">
                      <Store className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
                      <span className="truncate">{opt.salonName}</span>
                    </p>
                    <div className="flex items-center gap-2 text-[10.5px] text-stone-500 mt-0.5 flex-wrap">
                      {opt.salonArea && (
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{opt.salonArea}</span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {Number(opt.salonRating) > 0 ? Number(opt.salonRating).toFixed(1) : 'New'}
                      </span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{formatDuration(opt.duration)}</span>
                    </div>
                    {deal ? (
                      <div className="mt-1">
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-[13px] text-stone-900">₹{deal.basePrice - deal.totalDiscount}</span>
                          <span className="text-[10px] text-stone-400 line-through">₹{deal.basePrice}</span>
                          <span className="text-[9.5px] font-bold text-emerald-700">{deal.label}</span>
                        </div>
                        {deal.offerCashback > 0 && (
                          <p className="text-[9.5px] font-bold text-amber-700">₹{deal.savings} off now + ₹{deal.offerCashback} in wallet</p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 font-black text-[13px] text-stone-900">₹{opt.price}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => pick(opt)}
                    className={`shrink-0 h-8 px-3.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${
                      inCart ? 'bg-emerald-600 text-white' : 'bg-brand-maroon hover:bg-brand-darkMaroon text-white'
                    }`}
                  >
                    {inCart ? 'Add 1 more' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="px-5 pb-4 pt-1 text-[10px] text-stone-400">
            Prices are set by each salon. Adding from a different salon starts a new cart.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
