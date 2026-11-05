import { useCallback, useEffect, useState } from 'react';
import { PlusCircle, X, Send, Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../../shared/services/api';

const STATUS_STYLE = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-800 border-amber-200', Icon: Clock },
  approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', Icon: CheckCircle2 },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle }
};

/**
 * Salon partner asks admin for a missing sub-category (in an existing category)
 * or a brand-new category. Admin approves in Admin → Categories → Requests.
 * Everything is stored in DB; salon gets a real-time update on approve / reject.
 */
export const CategoryRequestPanel = ({ categories = [], currentCategory = '', suggestedName = '', showToast }) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('subcategory');
  const [categoryId, setCategoryId] = useState('');
  const [requestedName, setRequestedName] = useState('');
  const [tags, setTags] = useState('');
  const [gender, setGender] = useState('unisex');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [myRequests, setMyRequests] = useState([]);

  const loadMine = useCallback(() => {
    api.categoryRequests.listMine().then(setMyRequests).catch(() => {});
  }, []);

  useEffect(() => {
    loadMine();
    const onUpdate = () => loadMine();
    window.addEventListener('drimstyle:category-request-updated', onUpdate);
    return () => window.removeEventListener('drimstyle:category-request-updated', onUpdate);
  }, [loadMine]);

  const openPanel = () => {
    const cur = categories.find((c) => c.name === currentCategory) || categories[0];
    setCategoryId(cur ? String(cur.id || cur._id) : '');
    setRequestedName(suggestedName || '');
    setError('');
    setOpen(true);
  };

  const pendingCount = myRequests.filter((r) => r.status === 'pending').length;

  const handleSubmit = async () => {
    setError('');
    const name = requestedName.trim();
    if (name.length < 2) {
      setError('Please enter a name (at least 2 characters).');
      return;
    }
    if (type === 'subcategory' && !categoryId) {
      setError('Please choose the category.');
      return;
    }
    setSubmitting(true);
    try {
      await api.categoryRequests.create({
        type,
        categoryId: type === 'subcategory' ? categoryId : undefined,
        requestedName: name,
        tags: type === 'category' ? tags : undefined,
        gender,
        note
      });
      showToast?.('Request sent to DrimStyle admin. You will be notified once reviewed.');
      setOpen(false);
      setRequestedName('');
      setTags('');
      setNote('');
      loadMine();
    } catch (e) {
      setError(e.message || 'Could not send request.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full bg-white text-xs text-stone-900 placeholder:text-stone-400 rounded-lg border border-purple-200 px-2.5 py-2 outline-none focus:border-rose-900';

  return (
    <div className="space-y-2">
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          className="text-[10.5px] font-bold text-rose-900 hover:text-rose-950 flex items-center gap-1 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Can't find your category or service? Request it
          {pendingCount > 0 && (
            <span className="ml-1 text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-rose-950 uppercase tracking-wider">Request from DrimStyle Admin</span>
            <button type="button" onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { val: 'subcategory', label: 'New sub-category', hint: 'e.g. Pedicure in Nails' },
              { val: 'category', label: 'New category', hint: 'e.g. Tattoo & Piercing' }
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setType(opt.val)}
                className={`text-left px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${type === opt.val
                  ? 'bg-rose-900 text-white border-rose-900'
                  : 'bg-white text-stone-700 border-purple-200 hover:border-purple-400'
                  }`}
              >
                <span className="text-[11px] font-bold block">{opt.label}</span>
                <span className={`text-[9.5px] block ${type === opt.val ? 'text-rose-100' : 'text-stone-500'}`}>{opt.hint}</span>
              </button>
            ))}
          </div>

          {type === 'subcategory' && (
            <div>
              <label className="text-[10px] font-semibold text-stone-700 block mb-1">Add it under category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
                {categories.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[10px] font-semibold text-stone-700 block mb-1">
              {type === 'subcategory' ? 'Sub-category / service name' : 'Category name'} <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              maxLength={60}
              value={requestedName}
              onChange={(e) => setRequestedName(e.target.value)}
              placeholder={type === 'subcategory' ? 'e.g. Pedicure' : 'e.g. Tattoo & Piercing'}
              className={inputCls}
            />
          </div>

          {type === 'category' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-stone-700 block mb-1">Services in it (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. Small Tattoo, Ear Piercing"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-stone-700 block mb-1">For</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls}>
                  <option value="unisex">Unisex</option>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-semibold text-stone-700 block mb-1">Note for admin (optional)</label>
            <input
              type="text"
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why do you need it?"
              className={inputCls}
            />
          </div>

          {error && <p className="text-[10.5px] text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2 rounded-xl bg-rose-900 hover:bg-rose-950 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send Request
          </button>
        </div>
      )}

      {myRequests.length > 0 && (
        <div className="space-y-1">
          <span className="text-[9.5px] font-bold text-stone-500 uppercase tracking-wider">Your requests</span>
          {myRequests.slice(0, 5).map((r) => {
            const st = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
            const Icon = st.Icon;
            return (
              <div key={r._id} className="flex items-start justify-between gap-2 bg-white border border-purple-100 rounded-lg px-2.5 py-1.5">
                <div className="min-w-0">
                  <p className="text-[10.5px] font-semibold text-stone-800 truncate">
                    {r.requestedName}
                    <span className="text-stone-400 font-normal">
                      {r.type === 'subcategory' ? ` in ${r.categoryName}` : ' (new category)'}
                    </span>
                  </p>
                  {r.adminNote && <p className="text-[9.5px] text-stone-500 truncate">Admin: {r.adminNote}</p>}
                </div>
                <span className={`shrink-0 text-[9px] font-bold border px-1.5 py-0.5 rounded-full flex items-center gap-1 ${st.cls}`}>
                  <Icon className="w-2.5 h-2.5" />
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
