import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Single Lenis instance for the landing page, exposed so in-page anchor links
// can use its eased scrollTo instead of the browser's native smooth scroll.
let lenisInstance = null;
export const getLenis = () => lenisInstance;

// Smooth-scrolls to an in-page section id.
export const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  // Sections carry scroll-margin-top (scroll-mt-20), which Lenis already honours.
  if (lenisInstance) lenisInstance.scrollTo(el, { duration: 1.2 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const useLenis = () => {
  useEffect(() => {
    // Respect users who asked the OS for less motion: keep native scrolling.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      autoRaf: true
    });
    lenisInstance = lenis;

    return () => {
      lenis.destroy();
      if (lenisInstance === lenis) lenisInstance = null;
    };
  }, []);
};
