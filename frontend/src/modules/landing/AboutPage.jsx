import React from 'react';
import { Navigate } from 'react-router-dom';
import { LandingShell, PageSeo, About, FinalCta } from './LandingPage';

// Standalone About page (/about). Content is managed in Admin → Landing Page → About us.
export const AboutPage = () => (
  <LandingShell>
    {(content) => {
      // An admin can switch the page off; the header/footer links disappear too.
      if (!content.about.enabled) return <Navigate to="/" replace />;
      return (
        <main>
          <PageSeo title={`${content.about.eyebrow || 'About'} — DrimStyle`} description={content.about.paragraphs?.[0]} />
          <About data={content.about} page />
          {content.finalCta.enabled && <FinalCta data={content.finalCta} />}
        </main>
      );
    }}
  </LandingShell>
);
