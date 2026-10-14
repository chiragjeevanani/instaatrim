import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import { Check, Search, Star, Zap, Clock, Tag, ShieldCheck, MapPin, PartyPopper } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1];

// ---------------------------------------------------------------------------
// Tiny helpers for the scripted demo panels
// ---------------------------------------------------------------------------

// Steps a counter through `times` (ms from mount). With reduced motion the
// final state is shown immediately instead of playing the sequence.
const usePhase = (times, reduce) => {
  const [phase, setPhase] = useState(reduce ? times.length : 0);
  useEffect(() => {
    if (reduce) return undefined;
    const timers = times.map((t, i) => setTimeout(() => setPhase(i + 1), t));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);
  return phase;
};

const useTypewriter = (text, startAfter, reduce) => {
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return undefined;
    let interval;
    const start = setTimeout(() => {
      interval = setInterval(() => setN((c) => (c >= text.length ? c : c + 1)), 55);
    }, startAfter);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, startAfter, reduce]);
  return text.slice(0, n);
};

const pop = (reduce, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, y: 10, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.4, delay, ease: EASE }
});

// ---------------------------------------------------------------------------
// Step panels
// ---------------------------------------------------------------------------

const SALONS = [
  { name: 'Luxe Glow Salon & Spa', area: 'South Tukoganj', rating: '4.8', tag: 'Seat in 15 min' },
  { name: 'The Glam Bar & Nail Studio', area: 'Vijay Nagar', rating: '4.9', tag: 'Seat in 20 min' },
  { name: 'Aura Wellness & Spa', area: 'Geeta Bhawan', rating: '4.7', tag: 'Scheduled' }
];

const DiscoverPanel = ({ reduce }) => {
  const typed = useTypewriter('haircut near me', 300, reduce);
  const phase = usePhase([1500, 2400], reduce); // 1: results in, 2: top result highlighted
  return (
    <div>
      <div className="flex items-center gap-2.5 rounded-xl bg-white border border-purple-200/70 px-3.5 h-11 shadow-sm">
        <Search className="w-4 h-4 text-purple-600" />
        <span className="text-[14px] text-stone-800 font-medium">
          {typed}
          {typed.length < 15 && <span className="inline-block w-px h-4 bg-stone-700 ml-0.5 align-middle animate-pulse" />}
        </span>
      </div>
      <div className="mt-4 space-y-2.5 min-h-[190px]">
        {phase >= 1 &&
          SALONS.map((s, i) => {
            const picked = phase >= 2 && i === 0;
            return (
              <motion.div
                key={s.name}
                {...pop(reduce, i * 0.12)}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 bg-white transition-all duration-500 ${
                  picked ? 'border-brand-maroon shadow-[0_8px_24px_-12px_rgba(136,19,55,0.5)] scale-[1.02]' : 'border-stone-200'
                }`}
              >
                <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-purple-100 text-brand-maroon font-serif font-bold flex items-center justify-center">
                  {s.name[0]}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-bold text-stone-900 truncate">{s.name}</span>
                  <span className="flex items-center gap-1 text-[11.5px] text-stone-500">
                    <MapPin className="w-3 h-3" /> {s.area}
                    <span className="mx-1">·</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {s.rating}
                  </span>
                </span>
                <span
                  className={`text-[10.5px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                    s.tag.startsWith('Seat') ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {s.tag.startsWith('Seat') && <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />}
                  {s.tag}
                </span>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};

const SLOTS = ['4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM'];

const SlotPanel = ({ reduce }) => {
  const phase = usePhase([700, 1700, 2700], reduce); // 1: mode picked, 2: slot picked, 3: held
  return (
    <div className="min-h-[240px]">
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#eaddf3]">
        {['Instant seat', 'Schedule'].map((m, i) => {
          const on = phase >= 1 ? i === 1 : i === 0;
          return (
            <span
              key={m}
              className={`text-center text-[12.5px] font-bold py-2 rounded-lg transition-all duration-500 ${
                on ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              {m}
            </span>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        {['Today', 'Tomorrow', 'Sat'].map((d, i) => (
          <span key={d} className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border ${i === 0 ? 'bg-brand-maroon text-white border-brand-maroon' : 'bg-white text-stone-600 border-stone-200'}`}>
            {d}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {SLOTS.map((t, i) => {
          const picked = phase >= 2 && i === 3;
          return (
            <motion.span
              key={t}
              {...pop(reduce, i * 0.05)}
              animate={{ opacity: 1, y: 0, scale: picked ? 1.06 : 1 }}
              className={`text-center text-[12.5px] font-bold py-2.5 rounded-xl border transition-colors duration-300 ${
                picked ? 'bg-brand-maroon text-white border-brand-maroon shadow-[0_8px_20px_-8px_rgba(136,19,55,0.7)]' : 'bg-white text-stone-700 border-stone-200'
              }`}
            >
              {t}
            </motion.span>
          );
        })}
      </div>
      <div className="mt-4 h-9">
        {phase >= 3 && (
          <motion.div {...pop(reduce)} className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
            <Clock className="w-3.5 h-3.5" /> Slot held while you check out
          </motion.div>
        )}
      </div>
    </div>
  );
};

const PayPanel = ({ reduce }) => {
  const phase = usePhase([700, 1500, 2500, 3300], reduce); // 1: coupon, 2: total updates, 3: pressing, 4: paid
  const total = phase >= 1 ? 899 : 1299;
  return (
    <div className="min-h-[240px]">
      <div className="rounded-xl bg-white border border-stone-200 p-4 space-y-2.5 text-[13px]">
        <div className="flex justify-between text-stone-600">
          <span>Item total</span>
          <span>₹1,299</span>
        </div>
        <div className="h-6">
          {phase >= 1 && (
            <motion.div {...pop(reduce)} className="flex justify-between items-center text-emerald-700 font-bold">
              <span className="inline-flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Coupon applied
              </span>
              <span>−₹400</span>
            </motion.div>
          )}
        </div>
        <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline font-black text-stone-900">
          <span>Total payable</span>
          <motion.span key={total} initial={reduce ? false : { y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[20px]">
            ₹{total.toLocaleString('en-IN')}
          </motion.span>
        </div>
      </div>
      <motion.div
        animate={phase === 3 ? { scale: 0.96 } : { scale: 1 }}
        transition={{ duration: 0.15 }}
        className={`mt-4 rounded-xl py-3 text-center text-[13.5px] font-bold flex items-center justify-center gap-2 transition-colors duration-500 ${
          phase >= 4 ? 'bg-emerald-600 text-white' : 'bg-brand-maroon text-white'
        }`}
      >
        {phase >= 4 ? (
          <>
            <Check className="w-4 h-4 stroke-[3]" /> Payment successful
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" /> Pay ₹{total.toLocaleString('en-IN')} &amp; confirm booking
          </>
        )}
      </motion.div>
    </div>
  );
};

const STAGES = ['Confirmed', 'Checked-in', 'In service', 'Completed'];

const VisitPanel = ({ reduce }) => {
  const phase = usePhase([600, 1400, 2200, 3000, 3600], reduce); // 1..4 = stage reached, 5 = rating
  const stage = Math.min(Math.max(phase - 1, 0), 3);
  return (
    <div className="min-h-[240px]">
      <div className="rounded-xl bg-white border border-stone-200 p-4">
        <div className="flex items-center gap-3">
          <motion.span
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
            className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"
          >
            <Check className="w-5 h-5 stroke-[3]" />
          </motion.span>
          <span>
            <span className="block text-[14px] font-bold text-stone-900">Booking confirmed</span>
            <span className="block text-[12px] text-stone-500">Luxe Glow Salon &amp; Spa · Today, 6:00 PM</span>
          </span>
        </div>
        {/* Live status track */}
        <div className="mt-5 relative">
          <div className="absolute top-[7px] left-[12.5%] right-[12.5%] h-[2px] bg-stone-200" />
          <motion.div
            className="absolute top-[7px] left-[12.5%] h-[2px] bg-emerald-500 origin-left"
            style={{ width: '75%' }}
            animate={{ scaleX: phase === 0 ? 0 : stage / 3 }}
            transition={{ duration: 0.6, ease: EASE }}
          />
          <div className="relative grid grid-cols-4">
            {STAGES.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1.5">
                <span
                  className={`w-4 h-4 rounded-full border-2 transition-colors duration-500 ${
                    phase > 0 && i <= stage ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-stone-300'
                  }`}
                />
                <span className={`text-[10.5px] font-semibold text-center leading-tight ${phase > 0 && i <= stage ? 'text-stone-900' : 'text-stone-400'}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 h-[52px]">
        {phase >= 5 && (
          <motion.div {...pop(reduce)} className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between">
            <span className="text-[12.5px] font-bold text-amber-900 flex items-center gap-1.5">
              <PartyPopper className="w-4 h-4" /> Rate your visit
            </span>
            <span className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((s) => (
                <motion.span key={s} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 + s * 0.1, type: 'spring', stiffness: 500, damping: 12 }}>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </motion.span>
              ))}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Used for steps beyond the four scripted ones (admins can add more).
const GenericPanel = ({ step, index }) => (
  <div className="min-h-[240px] flex flex-col items-center justify-center text-center px-4">
    <span className="w-14 h-14 rounded-full bg-brand-maroon text-white font-serif font-bold text-[22px] flex items-center justify-center">{index + 1}</span>
    <p className="mt-4 text-[17px] font-bold text-stone-900">{step.title}</p>
    <p className="mt-1.5 text-[14px] text-stone-600 max-w-sm">{step.text}</p>
  </div>
);

const PANELS = [DiscoverPanel, SlotPanel, PayPanel, VisitPanel];

// ---------------------------------------------------------------------------
// The flow
// ---------------------------------------------------------------------------

export const BookingFlow = ({ steps }) => {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const inView = useInView(rootRef, { margin: '-120px 0px' });
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const n = steps.length;
  const playing = inView && !hovered && !reduce;
  const progress = n > 1 ? active / (n - 1) : 0;
  const Panel = PANELS[active];

  return (
    <div ref={rootRef} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocus={() => setHovered(true)} onBlur={() => setHovered(false)}>
      {/* Steps + connector */}
      <ol className="mt-10 sm:mt-14 grid grid-cols-2 lg:[grid-template-columns:repeat(var(--n),minmax(0,1fr))] gap-x-4 gap-y-8 lg:gap-6 relative" style={{ '--n': n }}>
        <div className="hidden lg:block absolute top-6 h-[3px] rounded-full bg-rose-100" style={{ left: `${50 / n}%`, right: `${50 / n}%` }}>
          <motion.div
            className="absolute inset-0 rounded-full origin-left bg-gradient-to-r from-brand-maroon via-rose-500 to-amber-400"
            animate={{ scaleX: progress }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          {/* Travelling "booking" token */}
          <motion.span
            className="absolute top-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-amber-400 shadow-[0_0_0_5px_rgba(251,191,36,0.25),0_0_18px_rgba(251,191,36,0.8)]"
            animate={{ left: `${progress * 100}%` }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </div>

        {steps.map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={i} className="list-none relative text-center">
              <button type="button" onClick={() => setActive(i)} className="group w-full cursor-pointer" aria-current={current ? 'step' : undefined}>
                <span className="relative mx-auto block w-12 h-12">
                  {current && !reduce && <span className="absolute inset-0 rounded-full bg-brand-maroon/30 animate-ping" />}
                  <motion.span
                    animate={{ scale: current ? 1.12 : 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                    className={`relative z-10 w-12 h-12 rounded-full font-serif font-bold text-[18px] flex items-center justify-center ring-8 ring-white border-2 transition-colors duration-500 ${
                      done || current ? 'bg-brand-maroon border-brand-maroon text-white' : 'bg-white border-rose-200 text-brand-maroon group-hover:border-brand-maroon'
                    }`}
                  >
                    {done ? <Check className="w-5 h-5 stroke-[3]" /> : i + 1}
                  </motion.span>
                </span>
                <span className={`block mt-4 sm:mt-5 text-[16px] sm:text-[19px] font-bold transition-colors duration-500 ${current ? 'text-brand-maroon' : 'text-stone-900'}`}>{step.title}</span>
                <span className={`block mt-1.5 sm:mt-2 text-[13px] sm:text-[14.5px] leading-relaxed max-w-xs mx-auto transition-opacity duration-500 ${current ? 'text-stone-700' : 'text-stone-500 lg:opacity-70'}`}>
                  {step.text}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Simulation stage */}
      <div className="mt-10 sm:mt-14 max-w-xl mx-auto">
        <div className="relative rounded-[28px] bg-gradient-to-b from-[#f8f4fb] to-[#f1e6f6] border border-purple-200/70 shadow-[0_30px_60px_-30px_rgba(76,5,25,0.35)] overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-purple-200/60 bg-white/60">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-maroon">
              Step {active + 1} of {n}
            </span>
            <span className="text-[12.5px] font-bold text-stone-700 truncate ml-3">{steps[active].title}</span>
          </div>
          {/* Auto-advance timer; its animation end moves the flow forward, and it
              freezes while hovered or off-screen. */}
          <div className="h-[3px] bg-purple-200/50">
            <div
              key={active}
              className="h-full bg-gradient-to-r from-brand-maroon to-amber-400 origin-left ds-flow-timer"
              style={{ animationPlayState: playing ? 'running' : 'paused' }}
              onAnimationEnd={() => setActive((a) => (a + 1) % n)}
            />
          </div>
          <div className="p-5 sm:p-6 min-h-[348px] sm:min-h-[356px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={reduce ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {Panel ? <Panel reduce={reduce} /> : <GenericPanel step={steps[active]} index={active} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <p className="mt-3 text-center text-[11.5px] text-stone-400">Illustrative preview · tap a step to jump to it</p>
      </div>
    </div>
  );
};
