const YieldAlert = require('../models/YieldAlert');

// ── Empty-chair alert, calculated live from DB (no fixed / fake numbers) ──
// Looks at the rest of TODAY (salon hours, IST), counts how many of the salon's active stations
// are booked in every 30-min slot, and picks the next window (up to 3 h) with the most free stations.
const Booking = require('../models/Booking');
const Station = require('../models/Station');
const Salon = require('../models/Salon');

const parseClock = (s) => {
    const m = String(s || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!m) return null;
    let h = Number(m[1]);
    const min = Number(m[2]);
    const ap = m[3] ? m[3].toUpperCase() : null;
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return h * 60 + min;
};
const fmtClock = (mins) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const durationMins = (b) => {
    const total = (b.services || []).reduce((sum, s) => {
        const v = s.duration;
        if (typeof v === 'number') return sum + v;
        const str = String(v || '').toLowerCase();
        const hr = Number((str.match(/(\d+)\s*h/) || [])[1] || 0);
        const mn = Number((str.match(/(\d+)\s*m/) || [])[1] || (/^\d+$/.test(str) ? str : 0));
        return sum + hr * 60 + mn;
    }, 0);
    return total > 0 ? total : 60;
};
const istNow = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
};

exports.getYieldAlert = async (req, res) => {
    try {
        const { salonId } = req.params;
        const off = { isActive: false };
        const salon = await Salon.findById(salonId).select('openTime closeTime totalChairs').lean();
        if (!salon) return res.status(200).json({ success: true, data: off });

        const open = parseClock(salon.openTime);
        const close = parseClock(salon.closeTime);
        const stations = await Station.countDocuments({ salonId, isActive: { $ne: false } }); // real stations only
        if (open === null || close === null || close <= open || stations <= 0) {
            return res.status(200).json({ success: true, data: off });
        }

        const now = istNow();
        const start = Math.max(open, Math.ceil(now.minutes / 30) * 30);
        if (close - start < 60) return res.status(200).json({ success: true, data: off }); // day almost over

        const todays = await Booking.find({
            salonId: String(salonId),
            dateKey: now.date,
            status: { $nin: ['Cancelled', 'No-Show', 'No Show'] }
        }).select('time services').lean();
        const busy = todays
            .map((b) => {
                const s = parseClock(b.time);
                return s === null ? null : [s, s + durationMins(b)];
            })
            .filter(Boolean);

        // free stations in each 30-min slot for the rest of today
        const slots = [];
        for (let t = start; t + 30 <= close; t += 30) {
            const used = busy.filter(([s, e]) => s < t + 30 && e > t).length;
            slots.push({ t, free: Math.max(0, stations - used) });
        }
        const len = Math.min(6, slots.length); // up to 3 hours
        let best = null;
        for (let i = 0; i + len <= slots.length; i++) {
            const free = Math.min(...slots.slice(i, i + len).map((x) => x.free));
            if (!best || free > best.free) best = { i, free };
        }
        if (!best || best.free <= 0) return res.status(200).json({ success: true, data: off });

        const ratio = best.free / stations;
        res.status(200).json({
            success: true,
            data: {
                isActive: true,
                timeWindow: `${fmtClock(slots[best.i].t)} - ${fmtClock(slots[best.i + len - 1].t + 30)}`,
                idleStations: best.free,
                totalStations: stations,
                // suggestion only; the salon picks the real % when it creates the offer
                recommendedDiscount: ratio >= 0.66 ? 25 : ratio >= 0.34 ? 15 : 10,
                basedOn: 'today-bookings'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateYieldAlert = async (req, res) => {
    try {
        const { salonId } = req.params;
        let alert = await YieldAlert.findOne({ salonId });

        if (!alert) {
            alert = await YieldAlert.create({ salonId, ...req.body });
        } else {
            Object.assign(alert, req.body);
            await alert.save();
        }

        res.status(200).json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
