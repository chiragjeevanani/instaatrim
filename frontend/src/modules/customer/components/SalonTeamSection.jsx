import { useEffect, useMemo, useState } from 'react';
import { Star, Armchair, Users } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';

const ratingLabel = (rating, count) =>
  Number(rating) > 0 ? { text: Number(rating).toFixed(1), count: Number(count) || 0 } : { text: 'New', count: 0 };

const idOf = (v) => (v && typeof v === 'object' ? String(v._id || v.id || '') : String(v || ''));

/**
 * Customer salon page: the salon's real stylists (DB) with the chair each one works on
 * and their real rating (calculated from customer reviews). Nothing is hardcoded.
 */
export const SalonTeamSection = ({ salonId }) => {
  const [staff, setStaff] = useState([]);
  const [stations, setStations] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!salonId) return;
    let alive = true;
    Promise.all([
      fetch(`${API_BASE}/staff/salon/${salonId}`).then((r) => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/stations/salon/${salonId}`).then((r) => r.json()).catch(() => ({}))
    ]).then(([s, st]) => {
      if (!alive) return;
      setStaff(Array.isArray(s?.data) ? s.data : []);
      setStations(Array.isArray(st?.data) ? st.data : []);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [salonId]);

  // Each active stylist + the chair(s) they are assigned to
  const team = useMemo(() => {
    const chairsByStaff = new Map();
    stations.forEach((c) => {
      const sid = idOf(c.staffId);
      if (!sid || c.isActive === false) return;
      chairsByStaff.set(sid, [...(chairsByStaff.get(sid) || []), c.name]);
    });
    return staff
      .filter((p) => p.isActive !== false)
      .map((p) => ({ ...p, chairs: chairsByStaff.get(idOf(p._id || p.id)) || [] }))
      // stylists on a chair first, then by rating
      .sort((a, b) => (b.chairs.length > 0) - (a.chairs.length > 0) || (Number(b.rating) || 0) - (Number(a.rating) || 0));
  }, [staff, stations]);

  if (!loaded || team.length === 0) return null;

  return (
    <section className="mt-2 lg:mt-0 bg-white pt-3 pb-4 lg:p-5 border-b lg:border lg:rounded-2xl border-stone-200/70 px-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-brand-maroon" /> Our Stylists ({team.length})
        </h2>
        <span className="text-[10px] text-stone-400">Ratings from verified bookings</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {team.map((p) => {
          const r = ratingLabel(p.rating, p.reviewCount);
          return (
            <div key={idOf(p._id || p.id)} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-stone-200/80 bg-stone-50/40">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-brand-maroon font-bold text-sm flex items-center justify-center shrink-0 uppercase">
                {(p.name || '?').charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-stone-900 truncate">{p.name}</span>
                  {p.role && <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">{p.role}</span>}
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                    {r.text}
                    {r.count > 0 && <span className="font-normal text-stone-500">({r.count})</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {p.chairs.length > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-stone-600">
                      <Armchair className="w-3 h-3 text-stone-400" /> {p.chairs.join(', ')}
                    </span>
                  )}
                  {Array.isArray(p.serviceCategories) && p.serviceCategories.length > 0 && (
                    <span className="text-[10px] text-stone-500 truncate">
                      {p.chairs.length > 0 ? '• ' : ''}
                      {p.serviceCategories.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
