import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { getLenis } from '../../modules/landing/useLenis';

// Sends every newly opened page to the very top, instantly, so it's obvious that
// a new page opened (React Router keeps the old scroll position by default).
// Skipped when:
//  - the URL has a #hash (the landing page scrolls to that section itself)
//  - the user went Back/Forward (so the browser can restore where they were)
// Only the path matters, so changing a query string (search/filters) doesn't reset.
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (hash || navigationType === 'POP') return;
    // Lenis (landing page smooth scroll) owns scrolling while active, so reset it too
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};
