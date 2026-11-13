import { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Inbox, Check, X, Loader2, RefreshCw, Store, Globe } from 'lucide-react';
import { api } from '../../../shared/services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE.replace(/\/api\/?$/, '');

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: '', label: 'All' }
];

const STATUS_CLS = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-300 border-red-500/30'
};

/**
 * Admin → Categories: salon partners' requests for new sub-categories / categories.
 * Approve adds the tag to the category (or creates the category) in DB and notifies the salon.
 */
export const AdminCategoryRequests = () => {
  const [tab, setTab] = useState('pending');
  const [list, setList] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  // per-request admin edits: { [id]: { name, scope, adminNote } }
  const [edits, setEdits] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rows, pending] = await Promise.all([
        api.categoryRequests.listAll(tab || undefined),
        tab === 'pending' ? null : api.categoryRequests.listAll('pending')
      ]);
      setList(rows);
      setPendingCount((pending || rows).filter((r) => r.status === 'pending').length);
    } catch (e) {
      setError(e.message || 'Could not load requests');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  // New request from a salon → refresh in real time
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('category_request_created', () => load());
    return () => socket.disconnect();
  }, [load]);

  const edit = (id, patch) => setEdits((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));

  const handleApprove = async (r) => {
    const e = edits[r._id] || {};
    setBusyId(r._id);
    try {
      await api.categoryRequests.approve(r._id, {
        name: (e.name ?? r.requestedName).trim(),
        scope: e.scope || 'global',
        adminNote: e.adminNote || ''
      });
      await load();
    } catch (err) {
      setError(err.message || 'Approve failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (r) => {
    const e = edits[r._id] || {};
    setBusyId(r._id);
    try {
      await api.categoryRequests.reject(r._id, e.adminNote || '');
      await load();
    } catch (err) {
      setError(err.message || 'Reject failed');
    } finally {
      setBusyId(null);
    }
  };

  const rows = useMemo(() => list, [list]);

  return (
    <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Salon Category Requests
              {pendingCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded-full">{pendingCount} pending</span>
              )}
            </h3>
            <p className="text-[11px] text-stone-400">Partners asking for a missing sub-category or a new category</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key || 'all'}
              type="button"
              onClick={() => setTab(t.key)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${tab === t.key ? 'bg-purple-600 text-white' : 'text-stone-400 hover:text-white hover:bg-[#1e1e2d]'
                }`}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={load}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#1e1e2d] cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {!loading && rows.length === 0 && (
        <p className="text-[11px] text-stone-500 py-3 text-center">
          {tab === 'pending' ? 'No pending requests. 🎉' : 'No requests here.'}
        </p>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const e = edits[r._id] || {};
          const isPending = r.status === 'pending';
          const busy = busyId === r._id;
          return (
            <div key={r._id} className="rounded-xl border border-[#262638] bg-[#101018] p-3 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-white">
                    {r.type === 'subcategory' ? 'Missing service' : 'New category'}:{' '}
                    <span className="text-purple-300">{r.requestedName}</span>
                    {r.type === 'subcategory' && (
                      <span className="text-stone-400 font-normal">
                        {' '}in {r.categoryName}
                        {r.groupName ? ` › ${r.groupName}` : ''}
                        {Number(r.duration) > 0 ? ` • ${r.duration} min` : ''}
                        {Number(r.price) > 0 ? ` • ₹${r.price}` : ''}
                      </span>
                    )}
                  </p>
                  <p className="text-[10.5px] text-stone-400 flex items-center gap-1 mt-0.5">
                    <Store className="w-3 h-3" /> {r.salonName || 'Salon'} • {new Date(r.createdAt).toLocaleString()}
                    {r.type === 'category' && <span className="capitalize"> • {r.gender}</span>}
                  </p>
                  {r.type === 'category' && r.tags?.length > 0 && (
                    <p className="text-[10.5px] text-stone-400 mt-0.5">Services: {r.tags.join(', ')}</p>
                  )}
                  {r.note && <p className="text-[10.5px] text-stone-300 mt-0.5">Note: “{r.note}”</p>}
                  {!isPending && r.adminNote && <p className="text-[10.5px] text-stone-400 mt-0.5">Admin note: {r.adminNote}</p>}
                </div>
                <span className={`text-[10px] font-bold uppercase border px-2 py-0.5 rounded-full ${STATUS_CLS[r.status]}`}>{r.status}</span>
              </div>

              {isPending && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={e.name ?? r.requestedName}
                    onChange={(ev) => edit(r._id, { name: ev.target.value })}
                    className="md:col-span-3 bg-[#14141e] border border-[#2d2d42] rounded-lg px-2.5 py-1.5 text-[11.5px] text-white focus:outline-none focus:border-purple-500"
                    title="Final name (you can correct spelling)"
                  />
                  {r.type === 'category' ? (
                    <select
                      value={e.scope || 'global'}
                      onChange={(ev) => edit(r._id, { scope: ev.target.value })}
                      className="md:col-span-3 bg-[#14141e] border border-[#2d2d42] rounded-lg px-2.5 py-1.5 text-[11.5px] text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="global">All salons (Global)</option>
                      <option value="salon">Only {r.salonName || 'this salon'}</option>
                    </select>
                  ) : (
                    <span className="md:col-span-3 text-[10.5px] text-stone-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Adds tag to “{r.categoryName}”
                    </span>
                  )}
                  <input
                    type="text"
                    placeholder="Note to salon (optional)"
                    value={e.adminNote || ''}
                    onChange={(ev) => edit(r._id, { adminNote: ev.target.value })}
                    className="md:col-span-4 bg-[#14141e] border border-[#2d2d42] rounded-lg px-2.5 py-1.5 text-[11.5px] text-white placeholder-stone-600 focus:outline-none focus:border-purple-500"
                  />
                  <div className="md:col-span-2 flex gap-1.5 justify-end">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleApprove(r)}
                      className="flex-1 md:flex-none px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 disabled:opacity-60 cursor-pointer"
                    >
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleReject(r)}
                      className="flex-1 md:flex-none px-2.5 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 disabled:opacity-60 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
