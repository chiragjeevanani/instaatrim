import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
  useInView,
  animate
} from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  Check,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Star,
  Zap,
  Crown,
  Clock,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { api } from '../../shared/services/api';
import { useAppData } from '../../shared/store/AppDataProvider';
import { LANDING_DEFAULTS, mergeLandingContent } from '../../shared/data/landingDefaults';
import { SafeImage } from '../../shared/components/SafeImage';
import { LandingIcon } from './landingIcons';
import { useLenis, scrollToSection } from './useLenis';
import { BookingFlow } from './BookingFlow';

const EASE = [0.16, 1, 0.3, 1];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Internal routes use the router, "#section" scrolls in-page, anything else opens externally.
const SmartLink = ({ to, className, children, onClick }) => {
  if (!to) return null;
  if (to.startsWith('#')) {
    return (
      <a
        href={to}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          scrollToSection(to.slice(1));
          onClick?.();
        }}
      >
        {children}
      </a>
    );
  }
  if (to.startsWith('/')) {
    return (
      <Link to={to} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a href={to} className={className} target="_blank" rel="noreferrer" onClick={onClick}>
      {children}
    </a>
  );
};

const Reveal = ({ children, delay = 0, className = '', y = 28, x = 0 }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

// Number that counts up from 0 the first time it scrolls into view.
const CountUp = ({ value, decimals = 0, suffix = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const controls = animate(0, value, { duration: 1.6, ease: EASE, onUpdate: (v) => setDisplay(v) });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {(reduce ? value : display).toFixed(decimals)}
      {suffix}
    </span>
  );
};

const Eyebrow = ({ children, dark = false }) => (
  <span
    className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] ${
      dark ? 'text-amber-300' : 'text-brand-maroon'
    }`}
  >
    <span className="relative flex w-1.5 h-1.5">
      <span className={`absolute inset-0 rounded-full animate-ping opacity-60 ${dark ? 'bg-amber-300' : 'bg-brand-maroon'}`} />
      <span className={`relative w-1.5 h-1.5 rounded-full ${dark ? 'bg-amber-300' : 'bg-brand-maroon'}`} />
    </span>
    {children}
  </span>
);

const SectionHeading = ({ eyebrow, title, subtitle, dark = false, center = true }) => (
  <Reveal className={`${center ? 'text-center mx-auto' : ''} max-w-2xl`}>
    {eyebrow && <Eyebrow dark={dark}>{eyebrow}</Eyebrow>}
    <h2
      className={`mt-3 font-serif font-bold tracking-tight text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.06] ${
        dark ? 'text-white' : 'text-stone-900'
      }`}
    >
      {title}
    </h2>
    {subtitle && (
      <p className={`mt-4 text-[15px] sm:text-[17px] leading-relaxed ${dark ? 'text-rose-100/75' : 'text-stone-600'}`}>
        {subtitle}
      </p>
    )}
  </Reveal>
);

// Buttons: a light sheen sweeps across on hover, the arrow nudges forward.
const PrimaryButton = ({ to, children, dark = false, className = '' }) => (
  <SmartLink
    to={to}
    className={`group relative overflow-hidden inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[14px] font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${
      dark
        ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 hover:shadow-[0_14px_30px_-10px_rgba(251,191,36,0.6)]'
        : 'bg-brand-maroon text-white hover:bg-brand-darkMaroon shadow-[0_10px_30px_-10px_rgba(136,19,55,0.6)] hover:shadow-[0_18px_36px_-12px_rgba(136,19,55,0.7)]'
    } ${className}`}
  >
    <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 translate-x-[-120%] transition-transform duration-700 ease-out group-hover:translate-x-[520%]" />
    <span className="relative">{children}</span>
    <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-1" />
  </SmartLink>
);

const GhostButton = ({ to, children, dark = false, className = '' }) => (
  <SmartLink
    to={to}
    className={`inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[14px] font-bold border transition-all hover:-translate-y-0.5 ${
      dark
        ? 'border-white/25 text-white hover:bg-white/10'
        : 'border-stone-300 text-stone-800 bg-white/70 hover:bg-white hover:border-stone-400'
    } ${className}`}
  >
    {children}
  </SmartLink>
);

// Card with a soft glow that follows the cursor.
const SpotlightCard = ({ children, className = '', dark = false }) => {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    ref.current.style.setProperty('--x', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={`group relative overflow-hidden ${className}`}>
      <span
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), ${
            dark ? 'rgba(251,191,36,0.14)' : 'rgba(136,19,55,0.08)'
          }, transparent 70%)`
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { label: 'For customers', to: '#how-it-works' },
  { label: 'For salons', to: '#for-salons' },
  { label: 'Services', to: '#services' },
  { label: 'FAQ', to: '#faq' }
];

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 inset-x-0 h-[3px] origin-left z-[60] bg-gradient-to-r from-brand-maroon via-rose-600 to-amber-500"
    />
  );
};

const LandingNav = ({ nav }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'bg-white/85 backdrop-blur-md shadow-[0_1px_0_rgba(136,19,55,0.08)]' : 'bg-transparent'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 transition-[height] duration-300 ${
          scrolled ? 'h-16' : 'h-16 sm:h-[76px]'
        }`}
      >
        <Link to="/" className="shrink-0" aria-label="DrimStyle home">
          <img src="/DrimStylelogo.png" alt="DrimStyle" className="h-11 w-[150px] object-cover object-center" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <SmartLink
              key={l.to}
              to={l.to}
              className="relative px-3.5 py-2 rounded-full text-[14px] font-semibold text-stone-600 hover:text-stone-900 transition-colors after:absolute after:left-3.5 after:right-3.5 after:bottom-1 after:h-px after:bg-brand-maroon after:scale-x-0 after:origin-left after:transition-transform hover:after:scale-x-100"
            >
              {l.label}
            </SmartLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/salon/login" className="px-4 h-10 inline-flex items-center rounded-full text-[14px] font-semibold text-stone-700 hover:bg-white/80">
            {nav.salonCta}
          </Link>
          <Link
            to="/customer"
            className="group px-5 h-10 inline-flex items-center gap-1.5 rounded-full text-[14px] font-bold bg-brand-maroon text-white hover:bg-brand-darkMaroon transition-colors"
          >
            {nav.customerCta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-stone-800 bg-white/80 border border-stone-200"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-t border-rose-100 bg-white"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((l, i) => (
                <motion.div key={l.to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <SmartLink
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 rounded-xl text-[15px] font-semibold text-stone-800 hover:bg-rose-50"
                  >
                    {l.label}
                  </SmartLink>
                </motion.div>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Link to="/salon/login" className="h-11 inline-flex items-center justify-center rounded-full border border-stone-300 text-[14px] font-bold text-stone-800">
                  {nav.salonCta}
                </Link>
                <Link to="/customer" className="h-11 inline-flex items-center justify-center rounded-full bg-brand-maroon text-white text-[14px] font-bold">
                  {nav.customerCta}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

// Positions around the phone on desktop, each with its own parallax depth.
const CHIP_LAYOUT = [
  { pos: 'lg:-left-36 xl:-left-44 lg:top-14', rotate: -3, depth: 26 },
  { pos: 'lg:-right-32 xl:-right-40 lg:top-6', rotate: 2, depth: -22 },
  { pos: 'lg:-left-40 xl:-left-48 lg:bottom-24', rotate: 2, depth: -30 },
  { pos: 'lg:-right-36 xl:-right-44 lg:bottom-36', rotate: -2, depth: 20 }
];

const ChipBody = ({ chip }) => (
  <>
    <span className="w-10 h-10 rounded-xl bg-rose-50 text-brand-maroon flex items-center justify-center shrink-0">
      <LandingIcon name={chip.icon} className="w-5 h-5" />
    </span>
    <span className="leading-tight text-left">
      <span className="block text-[12px] text-stone-500 font-medium">{chip.title}</span>
      <span className="block text-[15px] font-bold text-stone-900">{chip.value}</span>
    </span>
  </>
);

const CHIP_CLASS =
  'items-center gap-3 bg-white/95 backdrop-blur rounded-2xl border border-white shadow-[0_18px_40px_-18px_rgba(76,5,25,0.35)] px-3.5 py-3';

const FloatingChip = ({ chip, index, mx, my }) => {
  const reduce = useReducedMotion();
  const layout = CHIP_LAYOUT[index % CHIP_LAYOUT.length];
  const x = useTransform(mx, (v) => v * layout.depth);
  const y = useTransform(my, (v) => v * layout.depth);
  return (
    <motion.div style={{ x, y }} className={`hidden lg:block absolute z-20 ${layout.pos}`}>
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.85, y: 16 }}
        animate={
          reduce
            ? { opacity: 1 }
            : { opacity: 1, scale: 1, y: [0, -7, 0], rotate: layout.rotate }
        }
        transition={{
          opacity: { delay: 0.7 + index * 0.12, duration: 0.5 },
          scale: { delay: 0.7 + index * 0.12, duration: 0.5, ease: EASE },
          rotate: { delay: 0.7 + index * 0.12, duration: 0.5 },
          y: { delay: 1.2 + index * 0.3, duration: 4 + index * 0.6, repeat: Infinity, ease: 'easeInOut' }
        }}
        whileHover={{ scale: 1.05, rotate: 0 }}
        className={`flex ${CHIP_CLASS} min-w-[200px]`}
      >
        <ChipBody chip={chip} />
      </motion.div>
    </motion.div>
  );
};

const CUSTOMER_ITEMS = [
  ['Haircut & Styling', '45 min', 399],
  ['Glow Facial', '80 min', 1299],
  ['Beard Trim', '35 min', 349]
];

// Small "live" demo: services get added to the cart one by one.
const CustomerScreen = ({ image }) => {
  const reduce = useReducedMotion();
  const [added, setAdded] = useState(1);
  useEffect(() => {
    if (reduce) return undefined;
    const t = setInterval(() => setAdded((n) => (n % 3) + 1), 2200);
    return () => clearInterval(t);
  }, [reduce]);
  const total = CUSTOMER_ITEMS.slice(0, added).reduce((s, [, , p]) => s + p, 0);

  return (
    <div className="h-full flex flex-col bg-[#f8f4fb]">
      <div className="relative h-[44%] overflow-hidden">
        <motion.div
          className="w-full h-full"
          animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <SafeImage src={image} alt="Salon" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-[15px] font-bold leading-tight">Luxe Glow Salon &amp; Spa</p>
          <div className="flex items-center gap-2 mt-1 text-[10px]">
            <span className="bg-amber-400 text-stone-900 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-current" /> 4.8
            </span>
            <span className="text-emerald-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Open now
            </span>
          </div>
        </div>
      </div>
      <div className="mx-3 mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 flex items-center gap-2">
        <motion.span animate={reduce ? undefined : { scale: [1, 1.25, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
        </motion.span>
        <span className="text-[10.5px] font-bold text-amber-900">Instant seat ready in 15 min</span>
      </div>
      <div className="px-3 mt-3 space-y-2 flex-1">
        {CUSTOMER_ITEMS.map(([name, dur, price], i) => {
          const isAdded = i < added;
          return (
            <div key={name} className="bg-white rounded-xl border border-stone-200 px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-stone-900">{name}</p>
                <p className="text-[9.5px] text-stone-500 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {dur} · <span className="font-bold text-stone-800">₹{price.toLocaleString('en-IN')}</span>
                </p>
              </div>
              <motion.span
                key={isAdded ? 'added' : 'add'}
                initial={reduce ? false : { scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className={`text-[9.5px] font-bold px-2 py-1 rounded-md ${
                  isAdded ? 'bg-emerald-50 text-emerald-700 border border-emerald-500' : 'border border-brand-maroon text-brand-maroon'
                }`}
              >
                {isAdded ? '✓ Added' : '+ Add'}
              </motion.span>
            </div>
          );
        })}
      </div>
      <div className="m-3 rounded-xl bg-brand-maroon text-white text-[11px] font-bold py-2.5 text-center">
        View cart &amp; book · ₹
        <motion.span key={total} initial={reduce ? false : { y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block">
          {total.toLocaleString('en-IN')}
        </motion.span>
      </div>
    </div>
  );
};

const QUEUE_STATES = [
  ['In service', 'bg-violet-50 text-violet-700'],
  ['Checked-in', 'bg-emerald-50 text-emerald-700'],
  ['Confirmed', 'bg-stone-100 text-stone-600']
];

// Small "live" demo: the queue advances and today's sales tick up.
const SalonScreen = () => {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduce) return undefined;
    const t = setInterval(() => setTick((n) => n + 1), 2600);
    return () => clearInterval(t);
  }, [reduce]);
  const sales = 8450 + (tick % 4) * 399;

  return (
    <div className="h-full flex flex-col bg-[#f8f4fb] p-3 gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold text-stone-900">Dashboard</p>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Open
        </span>
      </div>
      <div className="rounded-xl bg-white border border-stone-200 px-3 py-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-stone-900">
          <Zap className="w-3 h-3 text-amber-500 fill-amber-400" /> Instant walk-in
        </span>
        <span className="w-7 h-4 rounded-full bg-rose-900 p-0.5 flex justify-end">
          <span className="w-3 h-3 rounded-full bg-white" />
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          ['Today’s sales', `₹${sales.toLocaleString('en-IN')}`],
          ['Appointments', String(14 + (tick % 4))],
          ['Stations', '3/5'],
          ['Instant', String(6 + (tick % 4))]
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white border border-stone-200 p-2.5">
            <p className="text-[9px] text-stone-500">{k}</p>
            <motion.p
              key={v}
              initial={reduce ? false : { y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-[15px] font-bold text-stone-900 leading-tight mt-0.5"
            >
              {v}
            </motion.p>
          </div>
        ))}
      </div>
      <p className="text-[10.5px] font-bold text-stone-900 mt-1">Live queue</p>
      {[
        ['Aarav M.', 'Haircut · 4:30 PM'],
        ['Priya S.', 'Glow Facial · 4:45 PM'],
        ['Rohan K.', 'Beard Trim · 5:00 PM']
      ].map(([n, s], i) => {
        const [label, cls] = QUEUE_STATES[(i + tick) % QUEUE_STATES.length];
        return (
          <div key={n} className="rounded-xl bg-white border border-stone-200 px-2.5 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-bold text-stone-900">{n}</p>
              <p className="text-[9px] text-stone-500">{s}</p>
            </div>
            <motion.span
              key={label}
              initial={reduce ? false : { scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}
            >
              {label}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
};

const PhoneMock = ({ audience, image }) => (
  <div className="relative mx-auto w-[260px] sm:w-[290px] h-[540px] sm:h-[590px] rounded-[44px] bg-stone-950 p-2.5 shadow-[0_50px_100px_-30px_rgba(76,5,25,0.6)] ring-1 ring-white/10">
    <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-stone-950 rounded-full z-10" />
    <div className="w-full h-full rounded-[36px] overflow-hidden bg-white text-left">
      <div className="h-9 flex items-end justify-between px-6 pb-1 text-[10px] font-bold text-stone-900 bg-[#f8f4fb]">
        <span>9:41</span>
        <span>5G ▮▮▮</span>
      </div>
      <div className="h-[calc(100%-2.25rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={audience}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {audience === 'salon' ? <SalonScreen /> : <CustomerScreen image={image} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </div>
);

// Headline words rise into place one after another.
const AnimatedWords = ({ text, className = '', delay = 0 }) => {
  const reduce = useReducedMotion();
  const words = String(text || '').split(' ').filter(Boolean);
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: '105%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: delay + i * 0.07, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

const Hero = ({ hero, trustPoints }) => {
  const reduce = useReducedMotion();
  const [audience, setAudience] = useState('customer');
  const copy = audience === 'salon' ? hero.salon : hero.customer;
  const chips = (audience === 'salon' ? hero.salonChips : hero.customerChips) || [];

  // Mouse parallax (desktop): normalised -0.5..0.5, smoothed with a spring.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 18 });
  const my = useSpring(rawY, { stiffness: 60, damping: 18 });
  const tiltY = useTransform(mx, (v) => v * 10);
  const tiltX = useTransform(my, (v) => v * -8);

  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      onMouseMove={onMove}
      onMouseLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
      className="relative isolate overflow-hidden pt-28 sm:pt-32 lg:pt-28 pb-16 sm:pb-20 lg:min-h-[100svh] lg:flex lg:items-center"
    >
      {/* Ambient brand "sky" with slowly drifting colour blobs and a faint dot grid */}
      <div className="absolute inset-0 -z-10 bg-[#fbf8fc]">
        <motion.div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[#f3d6e0] blur-3xl opacity-80 transform-gpu will-change-transform"
          animate={reduce ? undefined : { x: ['-50%', '-44%', '-50%'], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -left-40 w-[600px] h-[500px] rounded-full bg-[#ede1f5] blur-3xl transform-gpu will-change-transform"
          animate={reduce ? undefined : { x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/4 -right-40 w-[600px] h-[520px] rounded-full bg-[#fde7d0] blur-3xl opacity-80 transform-gpu will-change-transform"
          animate={reduce ? undefined : { x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(136,19,55,0.18)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.08fr_0.92fr] gap-12 lg:gap-8 items-center">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <div className="inline-flex p-1 rounded-full bg-white/80 border border-rose-100 shadow-sm backdrop-blur">
            {[
              ['customer', 'I want to book'],
              ['salon', 'I own a salon']
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setAudience(key)}
                className={`relative px-4 sm:px-5 h-10 rounded-full text-[13px] sm:text-[14px] font-bold transition-colors cursor-pointer ${
                  audience === key ? 'text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
                aria-pressed={audience === key}
              >
                {audience === key && (
                  <motion.span layoutId="hero-audience" className="absolute inset-0 rounded-full bg-brand-maroon" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={audience} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <motion.div
                className="mt-7"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Eyebrow>{copy.eyebrow}</Eyebrow>
              </motion.div>
              <h1 className="mt-4 font-serif font-bold tracking-tight text-stone-900 text-[40px] leading-[1.04] sm:text-[60px] lg:text-[64px] xl:text-[76px]">
                <AnimatedWords text={copy.title} />
                <br />
                <motion.span
                  className="italic bg-gradient-to-r from-brand-maroon via-rose-600 to-amber-600 bg-clip-text text-transparent bg-[length:200%_auto]"
                  animate={reduce ? undefined : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <AnimatedWords text={copy.highlight} delay={0.25} />
                </motion.span>
              </h1>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
                className="mt-5 max-w-xl mx-auto lg:mx-0 text-[16px] sm:text-[18px] leading-relaxed text-stone-600"
              >
                {copy.subtitle}
              </motion.p>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
                className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3"
              >
                <PrimaryButton to={copy.primaryLink} className="w-full sm:w-auto">
                  {copy.primaryLabel}
                </PrimaryButton>
                <GhostButton to={copy.secondaryLink} className="w-full sm:w-auto">
                  {copy.secondaryLabel}
                </GhostButton>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {trustPoints.length > 0 && (
            <motion.ul
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-9 hidden sm:flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-[13.5px] font-semibold text-stone-600"
            >
              {trustPoints.map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  {t}
                </li>
              ))}
            </motion.ul>
          )}
        </div>

        {/* Device + floating proof cards */}
        <div className="relative">
          <div className="relative w-fit mx-auto [perspective:1200px]">
            {/* Orbit rings */}
            <div className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-rose-200/70" />
            <motion.div
              className="hidden sm:block absolute left-1/2 top-1/2 w-[640px] h-[640px] -ml-[320px] -mt-[320px] rounded-full border border-dashed border-rose-200/60"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            >
              <span className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.2)]" />
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 60, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: EASE }}
              style={{ rotateX: tiltX, rotateY: tiltY }}
              className="relative z-10"
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              >
                <PhoneMock audience={audience} image={hero.image} />
              </motion.div>
            </motion.div>

            {chips.slice(0, 4).map((chip, i) => (
              <FloatingChip key={`${audience}-${i}`} chip={chip} index={i} mx={mx} my={my} />
            ))}
          </div>

          <div className="lg:hidden mt-8 grid grid-cols-2 gap-3 max-w-md mx-auto">
            {chips.slice(0, 4).map((chip, i) => (
              <Reveal key={`m-${audience}-${i}`} delay={i * 0.06} y={16}>
                <div className={`flex ${CHIP_CLASS}`}>
                  <ChipBody chip={chip} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.button
        type="button"
        onClick={() => scrollToSection('services')}
        className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 w-7 h-11 rounded-full border-2 border-stone-300 items-start justify-center pt-2 cursor-pointer"
        aria-label="Scroll to content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        <motion.span
          className="w-1 h-2 rounded-full bg-stone-400"
          animate={reduce ? undefined : { y: [0, 12, 0], opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
      </motion.button>
    </section>
  );
};

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

// Infinite marquee of live service categories. Animated with a CSS keyframe
// (see .ds-marquee in index.css) rather than JS so it never stutters on scroll.
const MarqueeTrack = ({ items, duration, hidden }) => (
  <div className="ds-marquee-track flex shrink-0 items-center" style={{ '--ds-marquee-duration': duration }} aria-hidden={hidden || undefined}>
    {items.map((n, i) => (
      <span key={i} className="inline-flex items-center font-serif italic text-[22px] sm:text-[28px] text-stone-800 whitespace-nowrap">
        <span className="px-6 sm:px-8">{n}</span>
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
      </span>
    ))}
  </div>
);

const Marquee = () => {
  const { state } = useAppData();
  const names = (state.categories || []).filter((c) => c.isActive !== false).map((c) => c.name);
  if (names.length < 3) return null;
  // Each track must be wider than the viewport, so short lists are repeated.
  const items = Array.from({ length: Math.ceil(8 / names.length) }, () => names).flat();
  const duration = `${Math.max(30, items.length * 3.2)}s`;

  return (
    <div className="ds-marquee relative py-5 border-y border-rose-100 bg-white overflow-hidden">
      <div className="flex w-max">
        <MarqueeTrack items={items} duration={duration} />
        <MarqueeTrack items={items} duration={duration} hidden />
      </div>
      {/* Faded edges as static overlays (cheaper than a CSS mask on a moving layer) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
};

// Proof points + live platform numbers (counts come from real data only).
const Highlights = ({ data }) => {
  const { state } = useAppData();
  const liveSalons = (state.salons || []).filter((s) => s.isVerified && s.verificationStatus === 'Live');
  const services = (state.services || []).filter((s) => s.isActive !== false);
  const categories = (state.categories || []).filter((c) => c.isActive !== false);
  const ratings = liveSalons.map((s) => Number(s.rating)).filter((r) => r > 0);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const stats = [
    { value: liveSalons.length, label: 'Verified salons live' },
    { value: services.length, label: 'Services to book' },
    { value: categories.length, label: 'Service categories' },
    { value: avgRating, label: 'Average salon rating', decimals: 1, suffix: '★' }
  ].filter((s) => s.value > 0);

  return (
    <section className="relative py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid gap-4 lg:grid-cols-4 lg:auto-rows-fr">
        {stats.length > 0 && (
          <Reveal className="lg:col-span-2 lg:row-span-2">
            <div className="relative h-full rounded-[28px] overflow-hidden bg-gradient-to-br from-[#4c0519] via-[#5b0a26] to-[#1e1035] text-white p-7 sm:p-9 flex flex-col justify-between min-h-[280px]">
              <motion.div
                className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl transform-gpu will-change-transform"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative">
                <Eyebrow dark>Live on DrimStyle</Eyebrow>
                <p className="mt-3 font-serif text-[26px] sm:text-[32px] font-bold leading-tight max-w-sm">
                  Real salons. Real-time seats.
                </p>
              </div>
              <div className="relative mt-8 grid grid-cols-2 gap-x-6 gap-y-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-[38px] sm:text-[46px] font-bold leading-none tracking-tight text-amber-300">
                      <CountUp value={s.value} decimals={s.decimals || 0} suffix={s.suffix || ''} />
                    </p>
                    <p className="mt-1.5 text-[13px] text-rose-100/75">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
        <div className={`grid grid-cols-2 gap-4 ${stats.length > 0 ? 'lg:col-span-2 lg:row-span-2' : 'lg:col-span-4 lg:grid-cols-4'}`}>
          {data.items.map((item, i) => (
            <Reveal key={i} delay={i * 0.07} className="h-full">
              <SpotlightCard className="h-full rounded-[24px] bg-white border border-rose-100 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(76,5,25,0.35)]">
                <span className="w-11 h-11 rounded-2xl bg-rose-50 text-brand-maroon flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <LandingIcon name={item.icon} className="w-5 h-5" />
                </span>
                <span className="block mt-4 text-[14.5px] sm:text-[16px] font-bold text-stone-900 leading-snug">{item.title}</span>
                <span className="block text-[12.5px] sm:text-[13.5px] text-stone-500 mt-1 leading-snug">{item.text}</span>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Categories = ({ data }) => {
  const { state } = useAppData();
  const navigate = useNavigate();
  const cats = (state.categories || []).filter((c) => c.isActive !== false).slice(0, 8);
  if (cats.length === 0) return null;

  return (
    <section id="services" className="py-16 lg:py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <SectionHeading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} center={false} />
          <SmartLink to={data.ctaLink} className="group inline-flex items-center gap-1.5 text-[14px] font-bold text-brand-maroon shrink-0">
            <span className="relative after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:bg-brand-maroon after:scale-x-0 after:origin-left after:transition-transform group-hover:after:scale-x-100">
              {data.ctaLabel}
            </span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </SmartLink>
        </div>
        {/* Bento: first tile is large on desktop */}
        <div className="mt-10 flex sm:grid sm:grid-cols-4 lg:auto-rows-[220px] gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {cats.map((cat, i) => (
            <Reveal
              key={cat.id || cat.slug}
              delay={(i % 4) * 0.07}
              className={`shrink-0 w-[44%] sm:w-auto snap-start ${i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''} ${i === 3 ? 'lg:row-span-2' : ''}`}
            >
              <button
                type="button"
                onClick={() => navigate(`/customer/salons?category=${cat.slug}`)}
                className="group relative block w-full h-full aspect-[4/5] sm:aspect-auto sm:min-h-[220px] rounded-3xl overflow-hidden bg-rose-50 text-left cursor-pointer"
              >
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                <span className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-2">
                  <span className="transition-transform duration-500 group-hover:-translate-y-1">
                    <span className={`block text-white font-bold leading-tight ${i === 0 ? 'text-[18px] lg:text-[28px] lg:font-serif' : 'text-[16px] sm:text-[18px]'}`}>
                      {cat.shortName || cat.name}
                    </span>
                    {cat.price > 0 && <span className="block text-white/75 text-[12px] mt-0.5">From ₹{cat.price}</span>}
                  </span>
                  <span className="w-9 h-9 rounded-full bg-white/90 text-stone-900 flex items-center justify-center shrink-0 transition-all duration-500 group-hover:rotate-[-45deg] group-hover:bg-amber-400">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, dark = false, delay = 0 }) => (
  <Reveal delay={delay} className="h-full">
    <SpotlightCard
      dark={dark}
      className={`h-full rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all duration-300 hover:-translate-y-1 ${
        dark
          ? 'bg-white/[0.06] border-white/10 hover:border-amber-300/30'
          : 'bg-white border-rose-100 hover:border-rose-200 hover:shadow-[0_24px_48px_-28px_rgba(76,5,25,0.35)]'
      }`}
    >
      <span
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${
          dark ? 'bg-amber-400/15 text-amber-300' : 'bg-rose-50 text-brand-maroon'
        }`}
      >
        <LandingIcon name={feature.icon} className="w-5 h-5" />
      </span>
      <h3 className={`mt-3 sm:mt-5 text-[14.5px] sm:text-[17px] leading-snug font-bold ${dark ? 'text-white' : 'text-stone-900'}`}>{feature.title}</h3>
      <p className={`mt-1.5 sm:mt-2 text-[12.5px] sm:text-[14px] leading-relaxed ${dark ? 'text-rose-100/70' : 'text-stone-600'}`}>{feature.text}</p>
    </SpotlightCard>
  </Reveal>
);

const CustomersSection = ({ data }) => {
  return (
    <section id="how-it-works" className="py-16 lg:py-20 bg-white scroll-mt-20 relative overflow-hidden">
      <div className="absolute -left-40 top-20 w-96 h-96 rounded-full bg-rose-50 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} />

        <BookingFlow steps={data.steps} />

        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {data.features.map((f, i) => (
            <FeatureCard key={i} feature={f} delay={(i % 3) * 0.08} />
          ))}
        </div>

        {data.ctaLabel && (
          <Reveal className="mt-12 text-center">
            <PrimaryButton to={data.ctaLink}>{data.ctaLabel}</PrimaryButton>
          </Reveal>
        )}
      </div>
    </section>
  );
};

const SalonsSection = ({ data }) => {
  const reduce = useReducedMotion();
  return (
    <section id="for-salons" className="relative py-16 lg:py-24 overflow-hidden scroll-mt-20 bg-[#2a0a17] text-white">
      <motion.div
        className="absolute -top-40 right-0 w-[700px] h-[500px] rounded-full bg-amber-500/15 blur-3xl transform-gpu will-change-transform"
        animate={reduce ? undefined : { x: [0, -60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-20 w-[700px] h-[500px] rounded-full bg-rose-700/40 blur-3xl transform-gpu will-change-transform"
        animate={reduce ? undefined : { x: [0, 60, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-28">
          <SectionHeading eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle} dark center={false} />
          <Reveal delay={0.1} className="mt-8 flex flex-col sm:flex-row gap-3">
            <PrimaryButton to={data.primaryLink} dark>
              {data.primaryLabel}
            </PrimaryButton>
            <GhostButton to={data.secondaryLink} dark>
              {data.secondaryLabel}
            </GhostButton>
          </Reveal>

          <div className="mt-12">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-rose-200/60">Get started in {data.steps.length} steps</p>
            <ol className="mt-5 relative">
              <motion.span
                className="absolute left-[17px] top-4 bottom-4 w-px origin-top bg-gradient-to-b from-amber-300/70 to-white/10"
                initial={reduce ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 1.4, ease: EASE }}
              />
              {data.steps.map((step, i) => (
                <Reveal key={i} delay={0.15 + i * 0.12} x={-16} y={0}>
                  <li className="relative flex gap-4 pb-6 last:pb-0 group">
                    <span className="relative w-9 h-9 rounded-full border border-amber-300/50 bg-[#2a0a17] text-amber-300 text-[13px] font-bold flex items-center justify-center shrink-0 transition-colors group-hover:bg-amber-400 group-hover:text-stone-950">
                      {i + 1}
                    </span>
                    <span className="pt-1.5">
                      <span className="block text-[15px] font-bold">{step.title}</span>
                      <span className="block text-[13.5px] text-rose-100/65 mt-0.5">{step.text}</span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {data.features.map((f, i) => (
            <div key={i} className={i % 2 === 1 ? 'lg:translate-y-10' : ''}>
              <FeatureCard feature={f} dark delay={(i % 2) * 0.1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const EliteSection = ({ data }) => {
  const reduce = useReducedMotion();
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          {/* Animated gold border */}
          <div className="relative rounded-[36px] p-[1.5px] overflow-hidden">
            <motion.div
              className="absolute -inset-[100%] transform-gpu will-change-transform bg-[conic-gradient(from_0deg,transparent_0deg,#fbbf24_60deg,transparent_120deg,transparent_360deg)]"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative rounded-[35px] overflow-hidden bg-stone-950 text-white p-8 sm:p-12 lg:p-16 grid lg:grid-cols-2 gap-10 items-center">
              <motion.div
                className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl transform-gpu will-change-transform"
                animate={reduce ? undefined : { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
                  <motion.span animate={reduce ? undefined : { rotate: [0, -12, 12, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}>
                    <Crown className="w-4 h-4" />
                  </motion.span>
                  {data.eyebrow}
                </span>
                <h2 className="mt-3 font-serif font-bold text-[36px] sm:text-[52px] leading-[1.05] bg-gradient-to-r from-[#e9c27a] via-[#fff1c9] to-[#e9c27a] bg-[length:200%_auto] bg-clip-text text-transparent">
                  {data.title}
                </h2>
                <p className="mt-4 text-[15px] sm:text-[17px] text-stone-300 max-w-md">{data.subtitle}</p>
                <PrimaryButton to={data.ctaLink} dark className="mt-8">
                  {data.ctaLabel}
                </PrimaryButton>
              </div>
              <ul className="relative grid gap-3">
                {data.perks.map((perk, i) => (
                  <Reveal key={i} delay={0.1 + i * 0.1} x={24} y={0}>
                    <li className="group flex items-start gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-5 py-4 transition-colors hover:bg-white/[0.1] hover:border-amber-300/30">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-110">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span className="text-[15px] text-stone-100">{perk}</span>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Testimonials = ({ data }) => (
  <section className="py-16 lg:py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.items.map((t, i) => (
          <Reveal key={i} delay={(i % 3) * 0.08}>
            <figure className="h-full rounded-3xl border border-rose-100 bg-[#fbf8fc] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgba(76,5,25,0.35)]">
              <div className="flex gap-0.5 text-amber-500">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 font-serif text-[19px] leading-snug text-stone-900">“{t.quote}”</blockquote>
              <figcaption className="mt-5 text-[14px]">
                <span className="font-bold text-stone-900">{t.name}</span>
                {t.role && <span className="text-stone-500"> · {t.role}</span>}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const Faq = ({ data, contact }) => {
  const [audience, setAudience] = useState('customer');
  const [openIndex, setOpenIndex] = useState(0);
  const items = data.items.filter((f) => (f.audience || 'customer') === audience);

  return (
    <section id="faq" className="py-16 lg:py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-28 text-center lg:text-left">
          <SectionHeading eyebrow={data.eyebrow} title={data.title} center={false} />
          <div className="mt-8 inline-flex p-1 rounded-full bg-white border border-rose-100">
            {[
              ['customer', 'Customers'],
              ['salon', 'Salon owners']
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setAudience(key);
                  setOpenIndex(0);
                }}
                className={`relative px-5 h-10 rounded-full text-[14px] font-bold transition-colors cursor-pointer ${
                  audience === key ? 'text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {audience === key && (
                  <motion.span layoutId="faq-audience" className="absolute inset-0 rounded-full bg-brand-maroon" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>

          {(contact.phone || contact.email) && (
            <Reveal delay={0.1} className="hidden lg:block mt-10">
              <div className="rounded-3xl bg-white border border-rose-100 p-6">
                <span className="w-11 h-11 rounded-2xl bg-rose-50 text-brand-maroon flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </span>
                <p className="mt-4 text-[17px] font-bold text-stone-900">Still have questions?</p>
                <p className="mt-1 text-[14px] text-stone-500">Our support team is happy to help.</p>
                <div className="mt-4 space-y-2 text-[14px] font-semibold">
                  {contact.phone && (
                    <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-stone-800 hover:text-brand-maroon">
                      <Phone className="w-4 h-4 text-brand-maroon" /> {contact.phone}
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-stone-800 hover:text-brand-maroon">
                      <Mail className="w-4 h-4 text-brand-maroon" /> {contact.email}
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((f, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div
                  layout
                  key={`${audience}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`rounded-2xl bg-white border overflow-hidden transition-colors ${isOpen ? 'border-rose-300 shadow-[0_18px_40px_-28px_rgba(76,5,25,0.4)]' : 'border-rose-100 hover:border-rose-200'}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[15.5px] sm:text-[16.5px] font-bold text-stone-900">{f.question}</span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-brand-maroon text-white' : 'bg-rose-50 text-brand-maroon'}`}>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                      >
                        <p className="px-5 sm:px-6 pb-5 text-[14.5px] text-stone-600 leading-relaxed">{f.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const FinalCta = ({ data }) => (
  <section className="pb-16 lg:pb-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-5">
      <Reveal className="h-full">
        <div className="group relative h-full overflow-hidden rounded-[32px] p-8 sm:p-12 bg-gradient-to-br from-rose-100 via-[#f6e9f2] to-amber-50 border border-rose-100 transition-transform duration-500 hover:-translate-y-1">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-rose-200/60 blur-2xl transition-transform duration-700 group-hover:scale-125" />
          <div className="relative">
            <h3 className="font-serif font-bold text-[28px] sm:text-[38px] leading-tight text-stone-900">{data.customerTitle}</h3>
            <p className="mt-3 text-[15px] sm:text-[16px] text-stone-600">{data.customerText}</p>
            <PrimaryButton to={data.customerLink} className="mt-8">
              {data.customerLabel}
            </PrimaryButton>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.1} className="h-full">
        <div className="group relative h-full overflow-hidden rounded-[32px] p-8 sm:p-12 bg-gradient-to-br from-[#4c0519] to-[#1e1035] text-white transition-transform duration-500 hover:-translate-y-1">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-amber-400/25 blur-2xl transition-transform duration-700 group-hover:scale-125" />
          <div className="relative">
            <h3 className="font-serif font-bold text-[28px] sm:text-[38px] leading-tight">{data.salonTitle}</h3>
            <p className="mt-3 text-[15px] sm:text-[16px] text-rose-100/75">{data.salonText}</p>
            <PrimaryButton to={data.salonLink} dark className="mt-8">
              {data.salonLabel}
            </PrimaryButton>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

const Footer = ({ data, nav, contact }) => {
  const columns = [
    {
      title: 'Customers',
      links: [
        ['Book a salon', '/customer'],
        ['Find salons', '/customer/salons'],
        ['Offers & trends', '/customer/trends'],
        ['My bookings', '/customer/bookings']
      ]
    },
    {
      title: 'Salon partners',
      links: [
        ['Register your salon', '/salon/register'],
        [nav.salonCta, '/salon/login'],
        ['Partner privacy policy', '/salon/privacy-policy']
      ]
    },
    {
      title: 'Company',
      links: [
        ['How it works', '#how-it-works'],
        ['FAQ', '#faq'],
        ['Privacy policy', '/customer/privacy-policy']
      ]
    }
  ];

  return (
    <footer className="bg-white border-t border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <img src="/DrimStylelogo.png" alt="DrimStyle" className="h-14 w-[190px] object-cover object-center -ml-2" />
          <p className="mt-3 text-[14px] text-stone-500 max-w-xs">{data.tagline}</p>
          <ul className="mt-6 space-y-2.5 text-[14px] text-stone-700">
            {contact.phone && (
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 hover:text-brand-maroon">
                  <Phone className="w-4 h-4 text-brand-maroon" /> {contact.phone}
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 hover:text-brand-maroon">
                  <Mail className="w-4 h-4 text-brand-maroon" /> {contact.email}
                </a>
              </li>
            )}
            {data.address && (
              <li className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-maroon" /> {data.address}
              </li>
            )}
          </ul>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-stone-400">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <SmartLink to={to} className="text-[14px] text-stone-700 hover:text-brand-maroon transition-colors hover:translate-x-0.5 inline-block transition-transform">
                      {label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-rose-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[12.5px] text-stone-500">© {new Date().getFullYear()} DrimStyle. All rights reserved.</p>
          <p className="font-serif italic text-[13px] text-brand-maroon">{data.tagline}</p>
        </div>
      </div>
    </footer>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const LandingPage = () => {
  useLenis();
  const { state } = useAppData();
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.landing
      .get()
      .then(({ content }) => !cancelled && setSaved(content))
      .catch(() => {
        /* Backend unreachable — the built-in defaults still render a complete page */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const content = useMemo(() => mergeLandingContent(LANDING_DEFAULTS, saved), [saved]);
  const contact = {
    phone: content.footer.phone || state.platformSettings?.supportPhone || '',
    email: content.footer.email || state.platformSettings?.supportEmail || ''
  };

  useEffect(() => {
    const prevTitle = document.title;
    document.title = content.seo.title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content.seo.description);
    return () => {
      document.title = prevTitle;
    };
  }, [content.seo.title, content.seo.description]);

  const trustPoints = content.highlights.enabled ? content.highlights.items.slice(0, 3).map((h) => h.title) : [];

  return (
    <div className="min-h-screen bg-[#fbf8fc] text-stone-900 font-sans antialiased select-text overflow-x-hidden">
      <ScrollProgress />
      <LandingNav nav={content.nav} />
      <main>
        {content.hero.enabled && <Hero hero={content.hero} trustPoints={trustPoints} />}
        {content.categories.enabled && <Marquee />}
        {content.highlights.enabled && <Highlights data={content.highlights} />}
        {content.categories.enabled && <Categories data={content.categories} />}
        {content.customers.enabled && <CustomersSection data={content.customers} />}
        {content.salons.enabled && <SalonsSection data={content.salons} />}
        {content.elite.enabled && <EliteSection data={content.elite} />}
        {content.testimonials.enabled && content.testimonials.items?.length > 0 && <Testimonials data={content.testimonials} />}
        {content.faq.enabled && <Faq data={content.faq} contact={contact} />}
        {content.finalCta.enabled && <FinalCta data={content.finalCta} />}
      </main>
      <Footer data={content.footer} nav={content.nav} contact={contact} />
    </div>
  );
};
