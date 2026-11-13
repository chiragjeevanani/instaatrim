import { useEffect, useState } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useAppData } from '../../../shared/store/AppDataProvider';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';

/**
 * "Choose Stylist" — the salon's active staff from DB (same staff the salon adds in its Staff page).
 * Selection is kept in bookingSlot (staffId + staffName), so Cart and Checkout always show the same pick
 * and it is sent with the booking. Hidden when the salon has no staff.
 */
const idOf = (v) => (v && typeof v === 'object' ? String(v._id || v.id || '') : String(v || ''));

export const StylistPicker = ({ salonId: rawSalonId, cartItem = null, className = '' }) => {
  const { bookingSlot, setBookingSlot } = useCustomer();
  const { state } = useAppData();
  const [staff, setStaff] = useState([]);
  // Salon of the cart: from the cart item; if missing / not a DB id, take it from the service in DB
  let salonId = idOf(rawSalonId ?? cartItem?.salonId);
  if (!/^[a-f0-9]{24}$/i.test(salonId) && cartItem?.id) {
    const svc = (state.services || []).find((s) => String(s.id || s._id) === String(cartItem.id));
    if (svc) salonId = idOf(svc.salonId);
  }
  const selectedId = bookingSlot?.staffId ? String(bookingSlot.staffId) : null;

  const pick = (p) =>
    setBookingSlot((prev) => ({
      ...prev,
      staffId: p ? String(p._id || p.id) : null,
      staffName: p ? p.name : null
    }));

  useEffect(() => {
    if (!salonId) return;
    let alive = true;
    fetch(`${API_BASE}/staff/salon/${salonId}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        const list = (Array.isArray(j?.data) ? j.data : []).filter((p) => p.isActive !== false);
        setStaff(list);
        // previously picked stylist is not in this salon (or removed) → back to "Any Stylist"
        setBookingSlot((prev) =>
          prev?.staffId && !list.some((p) => String(p._id || p.id) === String(prev.staffId))
            ? { ...prev, staffId: null, staffName: null }
            : prev
        );
      })
      .catch((e) => console.warn('[StylistPicker] could not load staff for salon', salonId, e));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  if (staff.length === 0) return null;
  // slot picker may have set a staffId that isn't one of this salon's DB staff → treat as "Any Stylist"
  const activeId = selectedId && staff.some((p) => String(p._id || p.id) === selectedId) ? selectedId : null;

  return (
    <div className={`bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2 ${className}`}>
      <label className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider block">Choose Stylist</label>
      <select
        value={activeId || ''}
        onChange={(e) => pick(staff.find((p) => String(p._id || p.id) === e.target.value) || null)}
        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 outline-none focus:border-brand-maroon cursor-pointer"
      >
        <option value="">Any Stylist (Salon will assign)</option>
        {staff.map((p) => (
          <option key={String(p._id || p.id)} value={String(p._id || p.id)}>
            {p.name}
            {p.role ? ` — ${p.role}` : ''}
            {Number(p.rating) > 0 ? ` • ★ ${Number(p.rating).toFixed(1)}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};
