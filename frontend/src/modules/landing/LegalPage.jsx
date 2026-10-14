import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ScrollText, ShieldCheck } from 'lucide-react';
import { LandingShell, PageSeo } from './LandingPage';
import { LegalDocument } from './LegalDocument';

// Public Privacy Policy (/privacy-policy) and Terms & Conditions (/terms).
// Text is managed in Admin → Landing Page; defaults come from the company's legal documents.
export const LegalPage = ({ docKey }) => {
  const isPrivacy = docKey === 'privacy';
  const Icon = isPrivacy ? ShieldCheck : ScrollText;
  const other = isPrivacy
    ? { label: 'Terms & Conditions', to: '/terms' }
    : { label: 'Privacy Policy', to: '/privacy-policy' };

  return (
    <LandingShell>
      {(content, contact) => {
        const doc = content.legal[docKey];
        return (
          <main>
            <PageSeo title={`${doc.title} — DrimStyle`} description={doc.sections?.[0]?.body} />

            <section className="relative overflow-hidden pt-28 sm:pt-36 pb-10 sm:pb-14">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_400px_at_50%_-10%,#f3d6e0_0%,transparent_65%),radial-gradient(700px_400px_at_90%_30%,#fde7d0_0%,transparent_60%)]" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <span className="w-14 h-14 rounded-2xl bg-white border border-rose-100 text-brand-maroon flex items-center justify-center shadow-sm">
                  <Icon className="w-7 h-7" />
                </span>
                <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-maroon">DrimStyle Legal</p>
                <h1 className="mt-2 font-serif font-bold tracking-tight text-stone-900 text-[38px] sm:text-[56px] leading-[1.05]">{doc.title}</h1>
                <p className="mt-4 max-w-2xl text-[15px] sm:text-[17px] text-stone-600 leading-relaxed">
                  {isPrivacy
                    ? 'How DrimStyle collects, uses and protects your information.'
                    : 'The terms that apply when you use the DrimStyle platform.'}
                </p>
              </div>
            </section>

            <section className="pb-16 sm:pb-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <LegalDocument doc={doc} toc />

                <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#4c0519] to-[#1e1035] text-white p-7 sm:p-10 grid sm:grid-cols-[1fr_auto] gap-5 items-center">
                  <div>
                    <p className="font-serif font-bold text-[22px] sm:text-[26px]">Questions about this {isPrivacy ? 'policy' : 'document'}?</p>
                    <p className="mt-1.5 text-[14px] text-rose-100/75">
                      Write to us at{' '}
                      <a href={`mailto:${contact.email}`} className="text-amber-300 font-semibold hover:underline">
                        {contact.email}
                      </a>
                    </p>
                  </div>
                  <Link
                    to={other.to}
                    className="group inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-amber-400 text-stone-950 text-[14px] font-bold hover:bg-amber-300 transition-colors"
                  >
                    Read {other.label}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </section>
          </main>
        );
      }}
    </LandingShell>
  );
};
