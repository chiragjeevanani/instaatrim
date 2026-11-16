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
  // Category dropdown: an existing category → request a new service in it (sub-category → service name);
  // "+ New category" → request a whole new category
  const [categoryId, setCategoryId] = useState('');
  const type = categoryId === '__newcat' ? 'category' : 'subcategory';
  const [requestedName, setRequestedName] = useState('');
  const [tags, setTags] = useState('');
  const [gender, setGender] = useState('unisex');
  const [note, setNote] = useState('');
  // missing service: sub-category (existing / new) + suggested time & price
  const [groupChoice, setGroupChoice] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');

  const selectedCat = categories.find((c) => String(c.id || c._id) === String(categoryId)) || null;
  const groupNames = (selectedCat?.subcategoryGroups || []).map((g) => g.name).filter(Boolean);
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
    const cur = categories.find((c) => c.name === currentCategory);
    setCategoryId(cur ? String(cur.id || cur._id) : '');
    setRequestedName(suggestedName || '');
    setGroupChoice('');
    setNewGroupName('');
    setDuration('');
    setPrice('');
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
    if (!categoryId) {
      setError('Please choose the category.');
      return;
    }
    if (type === 'subcategory' && groupNames.length > 0 && !groupChoice) {
      setError('Please choose the sub-category.');
      return;
    }
    const groupName = groupChoice === '__new' ? newGroupName.trim() : groupChoice;
    if (type === 'subcategory' && groupChoice === '__new' && groupName.length < 2) {
      setError('Please type the new sub-category name.');
      return;
    }
    setSubmitting(true);
    try {
      await api.categoryRequests.create({
        type,
        categoryId: type === 'subcategory' ? categoryId : undefined,
        requestedName: name,
        groupName: type === 'subcategory' ? groupName : undefined,
        duration: type === 'subcategory' ? Number(duration) || undefined : undefined,
        price: type === 'subcategory' ? Number(price) || undefined : undefined,
        tags: type === 'category' ? tags : undefined,
        gender,
        note
      });
      showToast?.('Request sent to DrimStyle admin. You will be notified once reviewed.');
      setOpen(false);
      setRequestedName('');
      setGroupChoice('');
      setNewGroupName('');
      setDuration('');
      setPrice('');
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
            <span className="text-[10.5px] font-bold text-rose-950 uppercase tracking-wider">Service not in the list?</span>
            <button type="button" onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10.5px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 leading-snug">
            ✅ You can add any service right now — just type its name in <b>Service Name</b> above and save.
            Want it added to the DrimStyle list (or need a new category)? Request it below.
          </p>

          {/* 1) Category (DB) */}
          <div>
            <label className="text-[10px] font-semibold text-stone-700 block mb-1">
              Category <span className="text-rose-600">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setGroupChoice('');
                setNewGroupName('');
              }}
              className={inputCls}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name}
                </option>
              ))}
              <option value="__newcat">+ New category (not in the list)</option>
            </select>
          </div>

          {/* 2) Sub-category of the chosen category (DB) */}
          {type === 'subcategory' && categoryId && groupNames.length > 0 && (
            <div>
              <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                Sub-category <span className="text-rose-600">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[...groupNames, '__new'].map((g) => {
                  const isSel = groupChoice === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGroupChoice(isSel ? '' : g)}
                      className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${isSel
                        ? 'bg-rose-900 text-white border-rose-900'
                        : 'bg-white text-stone-700 border-purple-200 hover:border-purple-400'
                        }`}
                    >
                      {g === '__new' ? '+ New sub-category' : g}
                    </button>
                  );
                })}
              </div>
              {groupChoice === '__new' && (
                <input
                  type="text"
                  maxLength={60}
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New sub-category name (e.g. Hair Extensions)"
                  className={`${inputCls} mt-1.5`}
                />
              )}
            </div>
          )}

          {categoryId && (
          <div>
            <label className="text-[10px] font-semibold text-stone-700 block mb-1">
              {type === 'subcategory' ? 'New service name' : 'New category name'} <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              maxLength={60}
              value={requestedName}
              onChange={(e) => setRequestedName(e.target.value)}
              placeholder={type === 'subcategory' ? 'e.g. Beard Color' : 'e.g. Tattoo & Piercing'}
              className={inputCls}
            />
          </div>
          )}

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
                      {r.type === 'subcategory' ? ` in ${r.categoryName}${r.groupName ? ` › ${r.groupName}` : ''}` : ' (new category)'}
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
