import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutTemplate,
  Save,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';
import { api } from '../../../shared/services/api';
import { LANDING_DEFAULTS, mergeLandingContent } from '../../../shared/data/landingDefaults';
import { LANDING_ICONS } from '../../landing/landingIcons';

// ---------------------------------------------------------------------------
// Editor schema — describes which fields of the landing content are editable
// and how. Paths are relative to the content root (see landingDefaults.js).
// ---------------------------------------------------------------------------

const ctaFields = (prefix, labelKey, linkKey, title) => [
  { path: `${prefix}${labelKey}`, label: `${title} label` },
  { path: `${prefix}${linkKey}`, label: `${title} link`, hint: 'Page path like /customer, a #section, or a full URL' }
];

const heroCopy = (key, title) => ({
  type: 'group',
  label: title,
  fields: [
    { path: `hero.${key}.eyebrow`, label: 'Eyebrow' },
    { path: `hero.${key}.title`, label: 'Headline (line 1)' },
    { path: `hero.${key}.highlight`, label: 'Headline (highlighted line 2)' },
    { path: `hero.${key}.subtitle`, label: 'Subtitle', type: 'textarea' },
    ...ctaFields(`hero.${key}.`, 'primaryLabel', 'primaryLink', 'Primary button'),
    ...ctaFields(`hero.${key}.`, 'secondaryLabel', 'secondaryLink', 'Secondary button')
  ]
});

const chipItem = [
  { key: 'icon', label: 'Icon', type: 'icon' },
  { key: 'title', label: 'Label' },
  { key: 'value', label: 'Value' }
];
const featureItem = [
  { key: 'icon', label: 'Icon', type: 'icon' },
  { key: 'title', label: 'Title' },
  { key: 'text', label: 'Description', type: 'textarea' }
];
const stepItem = [
  { key: 'title', label: 'Title' },
  { key: 'text', label: 'Description', type: 'textarea' }
];
const headingFields = (s) => [
  { path: `${s}.eyebrow`, label: 'Eyebrow' },
  { path: `${s}.title`, label: 'Title' },
  { path: `${s}.subtitle`, label: 'Subtitle', type: 'textarea' }
];

const SECTIONS = [
  {
    key: 'hero',
    label: 'Hero',
    description: 'First screen. Visitors switch between the customer and salon-owner versions.',
    fields: [
      heroCopy('customer', 'Customer version'),
      heroCopy('salon', 'Salon owner version'),
      { path: 'hero.customerChips', label: 'Customer floating cards (max 4)', type: 'list', item: chipItem, max: 4, newItem: { icon: 'sparkles', title: 'Label', value: 'Value' } },
      { path: 'hero.salonChips', label: 'Salon floating cards (max 4)', type: 'list', item: chipItem, max: 4, newItem: { icon: 'sparkles', title: 'Label', value: 'Value' } },
      { path: 'hero.image', label: 'Phone mockup salon photo', type: 'image' }
    ]
  },
  {
    key: 'highlights',
    label: 'Trust strip',
    description: 'Four short proof points shown under the hero.',
    fields: [{ path: 'highlights.items', label: 'Items', type: 'list', item: featureItem, max: 4, newItem: { icon: 'shield', title: 'Title', text: 'Short description' } }]
  },
  {
    key: 'about',
    label: 'About page',
    description: 'Content of the standalone About page at /about, linked from the header and footer. Switching it off hides the page and its links.',
    fields: [
      { path: 'about.eyebrow', label: 'Eyebrow' },
      { path: 'about.title', label: 'Title' },
      { path: 'about.paragraphs', label: 'Story paragraphs', type: 'stringList', multiline: true, max: 6 },
      {
        type: 'group',
        label: 'Highlight badge (big number)',
        fields: [
          { path: 'about.badgeValue', label: 'Number', hint: 'e.g. 15' },
          { path: 'about.badgeUnit', label: 'Unit', hint: 'e.g. min' },
          { path: 'about.badgeLabel', label: 'Caption', type: 'textarea' }
        ]
      },
      {
        type: 'group',
        label: 'Vision',
        fields: [
          { path: 'about.vision.title', label: 'Heading' },
          { path: 'about.vision.text', label: 'Text', type: 'textarea' }
        ]
      },
      {
        type: 'group',
        label: 'Mission',
        fields: [
          { path: 'about.mission.title', label: 'Heading' },
          { path: 'about.mission.text', label: 'Text', type: 'textarea' }
        ]
      },
      { path: 'about.whyTitle', label: '"Why" section heading' },
      { path: 'about.customersTitle', label: 'Customers card heading' },
      { path: 'about.customerPoints', label: 'Customer benefits', type: 'stringList', max: 10 },
      { path: 'about.partnersTitle', label: 'Salon partners card heading' },
      { path: 'about.partnerPoints', label: 'Salon partner benefits', type: 'stringList', max: 10 },
      { path: 'about.purposeTitle', label: 'Purpose heading' },
      { path: 'about.purpose', label: 'Purpose text', type: 'textarea' }
    ]
  },
  {
    key: 'categories',
    label: 'Services',
    description: 'Service tiles are pulled live from Admin → Categories (first 8 active).',
    fields: [...headingFields('categories'), ...ctaFields('categories.', 'ctaLabel', 'ctaLink', 'Link')]
  },
  {
    key: 'customers',
    label: 'For customers',
    description: 'How booking works, plus customer benefits.',
    fields: [
      ...headingFields('customers'),
      { path: 'customers.steps', label: 'Steps', type: 'list', item: stepItem, max: 6, newItem: { title: 'Step', text: 'What happens' } },
      { path: 'customers.features', label: 'Benefit cards', type: 'list', item: featureItem, max: 9, newItem: { icon: 'sparkles', title: 'Benefit', text: 'Description' } },
      ...ctaFields('customers.', 'ctaLabel', 'ctaLink', 'Button')
    ]
  },
  {
    key: 'salons',
    label: 'For salon owners',
    description: 'Partner pitch, onboarding steps and console features.',
    fields: [
      ...headingFields('salons'),
      { path: 'salons.steps', label: 'Onboarding steps', type: 'list', item: stepItem, max: 8, newItem: { title: 'Step', text: 'What happens' } },
      { path: 'salons.features', label: 'Feature cards', type: 'list', item: featureItem, max: 8, newItem: { icon: 'sparkles', title: 'Feature', text: 'Description' } },
      ...ctaFields('salons.', 'primaryLabel', 'primaryLink', 'Primary button'),
      ...ctaFields('salons.', 'secondaryLabel', 'secondaryLink', 'Secondary button')
    ]
  },
  {
    key: 'elite',
    label: 'Elite membership',
    description: 'Membership promo band. Keep perks in sync with the Elite plan in Platform Settings.',
    fields: [
      ...headingFields('elite'),
      { path: 'elite.perks', label: 'Perks', type: 'stringList', max: 8 },
      ...ctaFields('elite.', 'ctaLabel', 'ctaLink', 'Button')
    ]
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    description: 'Hidden by default — only enable it with real quotes you have permission to use.',
    fields: [
      { path: 'testimonials.eyebrow', label: 'Eyebrow' },
      { path: 'testimonials.title', label: 'Title' },
      {
        path: 'testimonials.items',
        label: 'Quotes',
        type: 'list',
        item: [
          { key: 'quote', label: 'Quote', type: 'textarea' },
          { key: 'name', label: 'Name' },
          { key: 'role', label: 'City / salon' }
        ],
        max: 9,
        newItem: { quote: '', name: '', role: '' }
      }
    ]
  },
  {
    key: 'faq',
    label: 'FAQ',
    description: 'Questions are grouped into Customers and Salon owners tabs.',
    fields: [
      { path: 'faq.eyebrow', label: 'Eyebrow' },
      { path: 'faq.title', label: 'Title' },
      {
        path: 'faq.items',
        label: 'Questions',
        type: 'list',
        item: [
          { key: 'audience', label: 'Shown to', type: 'select', options: [['all', 'Everyone (both tabs)'], ['customer', 'Customers tab'], ['salon', 'Salon owners tab']] },
          { key: 'question', label: 'Question' },
          { key: 'answer', label: 'Answer', type: 'textarea' }
        ],
        max: 30,
        newItem: { audience: 'all', question: '', answer: '' }
      },
      { path: 'faq.disclaimerTitle', label: 'Disclaimer heading' },
      { path: 'faq.disclaimer', label: 'Disclaimer text (shown under the questions)', type: 'textarea' }
    ]
  },
  {
    key: 'finalCta',
    label: 'Closing CTA',
    description: 'Two cards at the end of the page — one per audience.',
    fields: [
      { path: 'finalCta.customerTitle', label: 'Customer card title' },
      { path: 'finalCta.customerText', label: 'Customer card text', type: 'textarea' },
      ...ctaFields('finalCta.', 'customerLabel', 'customerLink', 'Customer button'),
      { path: 'finalCta.salonTitle', label: 'Salon card title' },
      { path: 'finalCta.salonText', label: 'Salon card text', type: 'textarea' },
      ...ctaFields('finalCta.', 'salonLabel', 'salonLink', 'Salon button')
    ]
  },
  {
    key: 'privacy',
    label: 'Privacy Policy',
    description: 'Public page at /privacy-policy, also used inside the customer and partner apps.',
    alwaysOn: true,
    fields: [
      { path: 'legal.privacy.title', label: 'Page title' },
      {
        path: 'legal.privacy.sections',
        label: 'Sections (numbered automatically in this order)',
        type: 'list',
        item: [
          { key: 'title', label: 'Heading' },
          { key: 'body', label: 'Text', type: 'textarea' }
        ],
        max: 60,
        newItem: { title: '', body: '' }
      }
    ]
  },
  {
    key: 'terms',
    label: 'Terms & Conditions',
    description: 'Public page at /terms, also used inside the customer and partner apps.',
    alwaysOn: true,
    fields: [
      { path: 'legal.terms.title', label: 'Page title' },
      {
        path: 'legal.terms.sections',
        label: 'Sections (numbered automatically in this order)',
        type: 'list',
        item: [
          { key: 'title', label: 'Heading' },
          { key: 'body', label: 'Text', type: 'textarea' }
        ],
        max: 60,
        newItem: { title: '', body: '' }
      }
    ]
  },
  {
    key: 'site',
    label: 'Nav, footer & SEO',
    description: 'Leave phone / email empty to use the support contacts from Platform Settings.',
    alwaysOn: true,
    fields: [
      { path: 'nav.customerCta', label: 'Header button (customers)' },
      { path: 'nav.salonCta', label: 'Header link (salon login)' },
      { path: 'footer.tagline', label: 'Footer tagline' },
      { path: 'footer.about', label: 'Footer "about us" blurb', type: 'textarea' },
      { path: 'footer.legalName', label: 'Company legal name (copyright line)' },
      { path: 'footer.phone', label: 'Footer phone', hint: 'Empty = Platform Settings support phone' },
      { path: 'footer.email', label: 'Footer email', hint: 'Also used in the FAQ contact card and legal pages' },
      { path: 'footer.address', label: 'Footer address' },
      { path: 'seo.title', label: 'Browser tab / search title' },
      { path: 'seo.description', label: 'Search description', type: 'textarea' }
    ]
  }
];

// ---------------------------------------------------------------------------
// Path helpers (immutable)
// ---------------------------------------------------------------------------

const getAt = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

const setAt = (obj, path, value) => {
  const [head, ...rest] = path.split('.');
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  clone[head] = rest.length ? setAt(obj?.[head] ?? {}, rest.join('.'), value) : value;
  return clone;
};

// ---------------------------------------------------------------------------
// Field components
// ---------------------------------------------------------------------------

const useInputClass = () => {
  const { theme } = useAdmin();
  const isLight = theme === 'light';
  return {
    isLight,
    input: `w-full px-3 py-2.5 rounded-xl border outline-none text-[13px] focus:border-purple-500 ${
      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#1a1a26] border-[#2d2d40] text-white'
    }`,
    card: isLight ? 'bg-white border-purple-100 text-stone-900' : 'bg-[#14141e] border-[#262638] text-white',
    sub: isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#101018] border-[#262638]'
  };
};

const FieldLabel = ({ children, hint }) => (
  <label className="block mb-1.5">
    <span className="text-[11.5px] font-semibold text-stone-400">{children}</span>
    {hint && <span className="block text-[10.5px] text-stone-500 mt-0.5">{hint}</span>}
  </label>
);

const TextInput = ({ value, onChange, multiline }) => {
  const { input } = useInputClass();
  return multiline ? (
    <textarea rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={`${input} resize-y leading-relaxed`} />
  ) : (
    <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={input} />
  );
};

const IconSelect = ({ value, onChange }) => {
  const { input } = useInputClass();
  const Icon = LANDING_ICONS[value];
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-400 flex items-center justify-center shrink-0">
        {Icon ? <Icon className="w-4 h-4" /> : null}
      </span>
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={input}>
        {Object.keys(LANDING_ICONS).map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
    </div>
  );
};

const ItemField = ({ def, value, onChange }) => {
  const { input } = useInputClass();
  if (def.type === 'icon') return <IconSelect value={value} onChange={onChange} />;
  if (def.type === 'select') {
    return (
      <select value={value || def.options[0][0]} onChange={(e) => onChange(e.target.value)} className={input}>
        {def.options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    );
  }
  return <TextInput value={value} onChange={onChange} multiline={def.type === 'textarea'} />;
};

const ListEditor = ({ field, value = [], onChange }) => {
  const { sub } = useInputClass();
  const move = (i, dir) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const isStrings = field.type === 'stringList';
  const canAdd = !field.max || value.length < field.max;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <FieldLabel>
          {field.label} <span className="text-stone-500">({value.length}{field.max ? `/${field.max}` : ''})</span>
        </FieldLabel>
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => onChange([...value, isStrings ? '' : { ...field.newItem }])}
          className="inline-flex items-center gap-1 text-[11.5px] font-bold text-purple-400 hover:text-purple-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      <div className="space-y-2.5">
        {value.length === 0 && <p className="text-[12px] text-stone-500">Nothing here yet.</p>}
        {value.map((item, i) => (
          <div key={i} className={`rounded-xl border p-3 ${sub}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-500">#{i + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded-md text-stone-400 hover:text-purple-400 disabled:opacity-30 cursor-pointer" title="Move up">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="p-1 rounded-md text-stone-400 hover:text-purple-400 disabled:opacity-30 cursor-pointer" title="Move down">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="p-1 rounded-md text-stone-400 hover:text-red-400 cursor-pointer" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {isStrings ? (
              <TextInput value={item} multiline={field.multiline} onChange={(v) => onChange(value.map((x, idx) => (idx === i ? v : x)))} />
            ) : (
              <div className="grid sm:grid-cols-2 gap-2.5">
                {field.item.map((def) => (
                  <div key={def.key} className={def.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <FieldLabel>{def.label}</FieldLabel>
                    <ItemField def={def} value={item?.[def.key]} onChange={(v) => onChange(value.map((x, idx) => (idx === i ? { ...x, [def.key]: v } : x)))} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Field = ({ field, content, setField }) => {
  const { sub } = useInputClass();
  if (field.type === 'group') {
    return (
      <div className={`rounded-2xl border p-4 space-y-3 ${sub}`}>
        <p className="text-[12px] font-bold uppercase tracking-wider text-purple-400">{field.label}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {field.fields.map((f) => (
            <div key={f.path} className={f.type === 'textarea' || f.type === 'list' || f.type === 'stringList' ? 'sm:col-span-2' : ''}>
              <Field field={f} content={content} setField={setField} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  const value = getAt(content, field.path);
  if (field.type === 'list' || field.type === 'stringList') {
    return <ListEditor field={field} value={value} onChange={(v) => setField(field.path, v)} />;
  }
  if (field.type === 'image') {
    return (
      <div>
        <FieldLabel hint="Paste an image URL">{field.label}</FieldLabel>
        <div className="flex items-center gap-3">
          {value && <img src={value} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-700" />}
          <div className="flex-1">
            <TextInput value={value} onChange={(v) => setField(field.path, v)} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <FieldLabel hint={field.hint}>{field.label}</FieldLabel>
      <TextInput value={value} onChange={(v) => setField(field.path, v)} multiline={field.type === 'textarea'} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const AdminLandingPage = () => {
  const { isLight, card } = useInputClass();
  const [content, setContent] = useState(LANDING_DEFAULTS);
  const [savedSnapshot, setSavedSnapshot] = useState(JSON.stringify(LANDING_DEFAULTS));
  const [activeKey, setActiveKey] = useState('hero');
  const [status, setStatus] = useState({ loading: true, saving: false, error: '', message: '', updatedAt: null });

  useEffect(() => {
    api.landing
      .get()
      .then(({ content: saved, updatedAt }) => {
        const merged = mergeLandingContent(LANDING_DEFAULTS, saved);
        setContent(merged);
        setSavedSnapshot(JSON.stringify(merged));
        setStatus((s) => ({ ...s, loading: false, updatedAt }));
      })
      .catch(() => setStatus((s) => ({ ...s, loading: false, error: 'Could not load saved content — showing defaults.' })));
  }, []);

  const isDirty = useMemo(() => JSON.stringify(content) !== savedSnapshot, [content, savedSnapshot]);
  const setField = (path, value) => setContent((c) => setAt(c, path, value));
  const section = SECTIONS.find((s) => s.key === activeKey);

  const handleSave = async () => {
    setStatus((s) => ({ ...s, saving: true, error: '', message: '' }));
    try {
      const { content: saved, updatedAt } = await api.landing.update(content);
      const merged = mergeLandingContent(LANDING_DEFAULTS, saved);
      setContent(merged);
      setSavedSnapshot(JSON.stringify(merged));
      setStatus((s) => ({ ...s, saving: false, message: 'Landing page published.', updatedAt }));
    } catch (e) {
      setStatus((s) => ({ ...s, saving: false, error: e.message || 'Save failed' }));
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset the landing page to the default copy? Your saved edits will be removed.')) return;
    setStatus((s) => ({ ...s, saving: true, error: '', message: '' }));
    try {
      await api.landing.reset();
      setContent(LANDING_DEFAULTS);
      setSavedSnapshot(JSON.stringify(LANDING_DEFAULTS));
      setStatus((s) => ({ ...s, saving: false, message: 'Reset to default content.', updatedAt: null }));
    } catch (e) {
      setStatus((s) => ({ ...s, saving: false, error: e.message || 'Reset failed' }));
    }
  };

  const actions = (
    <div className="flex items-center gap-2">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl whitespace-nowrap shrink-0 border border-[#2d2d40] text-[12px] font-semibold text-stone-300 hover:text-white"
      >
        <ExternalLink className="w-3.5 h-3.5" /> Preview
      </a>
      <button
        type="button"
        onClick={handleReset}
        disabled={status.saving}
        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl whitespace-nowrap shrink-0 border border-[#2d2d40] text-[12px] font-semibold text-stone-300 hover:text-white disabled:opacity-50 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Reset
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty || status.saving}
        className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl whitespace-nowrap shrink-0 bg-purple-600 hover:bg-purple-500 text-white text-[12px] font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {status.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        {isDirty ? 'Publish' : 'Published'}
      </button>
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col min-h-screen ${isLight ? 'bg-[#f7f5f9]' : 'bg-[#0d0d12]'}`}>
      <AdminTopBar title="Landing Page" subtitle="Edit the public marketing page at / for customers and salon owners" action={actions} />

      <div className="p-8 flex-1 grid grid-cols-[240px_1fr] gap-6 items-start max-w-7xl">
        {/* Section list */}
        <nav className={`rounded-2xl border p-2 sticky top-24 ${card}`}>
          {SECTIONS.map((s) => {
            const enabled = s.alwaysOn ? true : getAt(content, `${s.key}.enabled`) !== false;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setActiveKey(s.key)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-[13px] font-semibold transition-colors cursor-pointer ${
                  activeKey === s.key ? 'bg-purple-600 text-white' : 'text-stone-400 hover:bg-purple-600/10 hover:text-purple-300'
                }`}
              >
                <span className="truncate">{s.label}</span>
                {!s.alwaysOn && (
                  <span className={`w-2 h-2 rounded-full shrink-0 ${enabled ? 'bg-emerald-400' : 'bg-stone-600'}`} title={enabled ? 'Visible' : 'Hidden'} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Section editor */}
        <div className="space-y-4 min-w-0">
          {(status.error || status.message || isDirty) && (
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-[12.5px] font-semibold border ${
                status.error
                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                  : isDirty
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {status.error ? <AlertTriangle className="w-4 h-4" /> : isDirty ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {status.error || (isDirty ? 'You have unpublished changes.' : status.message)}
            </div>
          )}

          <div className={`rounded-2xl border p-6 ${card}`}>
            <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b border-stone-700/30">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                  <LayoutTemplate className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-[15px]">{section.label}</h3>
                  <p className="text-[12px] text-stone-400 mt-0.5">{section.description}</p>
                </div>
              </div>
              {!section.alwaysOn && (
                <label className="inline-flex items-center gap-2 text-[12px] font-semibold text-stone-400 shrink-0 cursor-pointer">
                  Show on page
                  <button
                    type="button"
                    onClick={() => setField(`${section.key}.enabled`, getAt(content, `${section.key}.enabled`) === false)}
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      getAt(content, `${section.key}.enabled`) !== false ? 'bg-emerald-500' : 'bg-stone-600'
                    }`}
                    aria-pressed={getAt(content, `${section.key}.enabled`) !== false}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        getAt(content, `${section.key}.enabled`) !== false ? 'translate-x-4' : ''
                      }`}
                    />
                  </button>
                </label>
              )}
            </div>

            {status.loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="space-y-5">
                {section.fields.map((f, i) => (
                  <Field key={f.path || `${section.key}-${i}`} field={f} content={content} setField={setField} />
                ))}
              </div>
            )}
          </div>

          {status.updatedAt && (
            <p className="text-[11.5px] text-stone-500">Last published {new Date(status.updatedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};
