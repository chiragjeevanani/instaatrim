import React from 'react';

const EMAIL_RE = /([A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)/g;

// Renders plain legal text, turning email addresses into mailto links.
const LegalText = ({ text }) => {
  const parts = String(text || '').split(EMAIL_RE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={`mailto:${part}`} className="text-brand-maroon font-semibold hover:underline break-all">
            {part}
          </a>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

// Numbered legal sections. `toc` adds a sticky contents list beside the text
// (desktop only). Section numbers come from list order, so admins can reorder.
export const LegalDocument = ({ doc, toc = false }) => {
  const sections = doc?.sections || [];

  const list = (
    <div className="space-y-3 sm:space-y-4 min-w-0">
      {sections.map((s, i) => (
        <section
          key={i}
          id={`legal-${i + 1}`}
          className="scroll-mt-24 rounded-2xl bg-white border border-stone-200/80 p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <h2 className="flex items-start gap-3 text-[15px] sm:text-[17px] font-bold text-stone-900 leading-snug">
            <span className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-rose-50 text-brand-maroon text-[12px] font-bold flex items-center justify-center">
              {i + 1}
            </span>
            {s.title}
          </h2>
          <p className="mt-2.5 pl-10 text-[13.5px] sm:text-[14.5px] text-stone-600 leading-relaxed whitespace-pre-line">
            <LegalText text={s.body} />
          </p>
        </section>
      ))}
    </div>
  );

  if (!toc) return list;

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
      <nav className="hidden lg:block sticky top-28 rounded-2xl bg-white border border-stone-200/80 p-4 max-h-[calc(100vh-9rem)] overflow-y-auto">
        <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Contents</p>
        <ol className="space-y-0.5">
          {sections.map((s, i) => (
            <li key={i}>
              <a
                href={`#legal-${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(`legal-${i + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex gap-2 px-2 py-1.5 rounded-lg text-[13px] text-stone-600 hover:bg-rose-50 hover:text-brand-maroon transition-colors"
              >
                <span className="w-5 shrink-0 text-stone-400 tabular-nums">{i + 1}.</span>
                <span className="leading-snug">{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {list}
    </div>
  );
};
