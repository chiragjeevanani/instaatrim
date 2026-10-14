import { useEffect, useMemo, useState } from 'react';
import { api } from '../../shared/services/api';
import { useAppData } from '../../shared/store/AppDataProvider';
import { LANDING_DEFAULTS, mergeLandingContent } from '../../shared/data/landingDefaults';

// Saved content is cached for the session so moving between the landing page,
// the legal pages and the in-app policy pages doesn't flash the defaults.
let cachedSaved = null;

// Admin-managed landing content merged over the built-in defaults, plus the
// resolved support contacts (landing footer value, else Platform Settings).
export const useLandingContent = () => {
  const { state } = useAppData();
  const [saved, setSaved] = useState(cachedSaved);

  useEffect(() => {
    let cancelled = false;
    api.landing
      .get()
      .then(({ content }) => {
        cachedSaved = content;
        if (!cancelled) setSaved(content);
      })
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

  return { content, contact };
};
