const Booking = require('../models/Booking');
const Payout = require('../models/Payout');

exports.getSalonAnalytics = async (req, res) => {
    try {
        const { id: salonId } = req.params;

        // Fetch bookings for this salon
        const bookings = await Booking.find({ salonId });

        // Fetch payouts for this salon
        const payouts = await Payout.find({ salonId });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOf30Days = new Date(now);
        startOf30Days.setDate(now.getDate() - 30);

        const completedBookings = bookings.filter(b => b.status === 'Completed');
        const cancelledBookings = bookings.filter(b => b.status === 'Cancelled');
        const totalTerminal = completedBookings.length + cancelledBookings.length;

        // Revenue Calculations based on Business Rules
        let totalGmv = 0; // Total Customer Paid
        let totalSalonRevenue = 0;
        let instaaTrimDirectRevenue = 0;
        let instaaTrimIndirectRevenue = 0;

        completedBookings.forEach(b => {
            const billValue = b.totalAmount || 0;
            const finalPaid = b.finalPaid !== undefined ? b.finalPaid : billValue;

            // 1. Promotional and Discount Rules
            const salonPromoBudget = billValue * 0.50; // 50% of bill value
            const customerVisibleDiscount = billValue * 0.40; // 40% of bill value

            // 2. Split of Customer Visible Discount
            const instantDiscount = customerVisibleDiscount * 0.50;
            const walletCashbackIssued = customerVisibleDiscount * 0.50;

            // 3. Deduction Logic
            // Wallet Redeemed is whatever discount remains after instant discount
            const walletRedeemed = Math.max(0, (billValue - finalPaid) - instantDiscount);

            // 4. Revenue Sharing
            const customerPays = finalPaid;
            const salonRevenue = billValue - salonPromoBudget;

            // 5. InstaaTrim Revenue Accounting (Direct = Cash in hand after paying salon & issuing cashback, plus recovered redeemed wallet)
            const directRevenue = customerPays - salonRevenue - walletCashbackIssued + walletRedeemed;

            totalGmv += customerPays;
            totalSalonRevenue += salonRevenue;
            instaaTrimDirectRevenue += directRevenue;
            instaaTrimIndirectRevenue += (walletCashbackIssued - walletRedeemed);
        });

        // Payouts Settled or Pending
        const totalPayouts = payouts
            .filter(p => ['Transferred', 'Pending', 'Approved'].includes(p.status))
            .reduce((sum, p) => sum + p.grossAmount, 0);

        // Available Payout for Salon is based on actual Salon Revenue, not GMV
        const availablePayout = Math.max(0, totalSalonRevenue - totalPayouts);

        // MTD Revenue (Salon's Revenue = Bill Value - 50% Promo Budget as per Excel)
        const mtdBookings = completedBookings.filter(b => new Date(b.createdAt) >= startOfMonth);
        const mtdRevenue = mtdBookings.reduce((sum, b) => {
            const billValue = b.totalAmount || 0;
            const salonPromoBudget = billValue * 0.50;
            return sum + (billValue - salonPromoBudget);
        }, 0);

        const timeOfDayBookings = { morning: 0, afternoon: 0, evening: 0 };
        bookings.forEach((booking) => {
            if (booking.status === 'Cancelled' || !booking.dateKey || !booking.time) return;
            const bookingDate = new Date(`${booking.dateKey}T00:00:00`);
            if (Number.isNaN(bookingDate.getTime()) || bookingDate < startOf30Days || bookingDate > now) return;
            const match = booking.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (!match) return;
            let hour = Number(match[1]) % 12;
            if (match[3].toUpperCase() === 'PM') hour += 12;
            if (hour >= 10 && hour < 13) timeOfDayBookings.morning += 1;
            else if (hour >= 13 && hour < 16) timeOfDayBookings.afternoon += 1;
            else if (hour >= 16 && hour < 21) timeOfDayBookings.evening += 1;
        });
        const timedBookingTotal = Object.values(timeOfDayBookings).reduce((sum, count) => sum + count, 0);
        const timeOfDayDemand = Object.fromEntries(
            Object.entries(timeOfDayBookings).map(([period, count]) => [
                period,
                { count, percent: timedBookingTotal ? Math.round((count / timedBookingTotal) * 100) : 0 }
            ])
        );

        // Avg Order Value
        const avgOrderValue = completedBookings.length > 0 ? (totalGmv / completedBookings.length) : 0;

        // Completion Rate
        const completionRate = totalTerminal > 0 ? (completedBookings.length / totalTerminal) * 100 : 100;
        const cancellationRate = 100 - completionRate;

        // Repeat Clients
        const customerCounts = {};
        completedBookings.forEach((b) => {
            if (b.customerId) {
                customerCounts[b.customerId] = (customerCounts[b.customerId] || 0) + 1;
            }
        });
        const totalUniqueCustomers = Object.keys(customerCounts).length;
        const repeatCustomers = Object.values(customerCounts).filter(c => c > 1).length;
        const repeatClientRate = totalUniqueCustomers > 0 ? (repeatCustomers / totalUniqueCustomers) * 100 : 0;

        // Top Performing Services
        const serviceCounts = {};
        completedBookings.forEach(b => {
            if (b.services) {
                b.services.forEach(s => {
                    if (s.name) {
                        if (!serviceCounts[s.name]) serviceCounts[s.name] = { count: 0, revenue: 0 };
                        serviceCounts[s.name].count += 1;
                        serviceCounts[s.name].revenue += s.price || 0;
                    }
                });
            }
        });

        const topServices = Object.keys(serviceCounts).map(name => ({
            name,
            count: serviceCounts[name].count,
            revenue: serviceCounts[name].revenue
        })).sort((a, b) => b.revenue - a.revenue).slice(0, 3);

        const data = {
            availablePayout,
            mtdRevenue,
            timeOfDayDemand,
            avgOrderValue,
            completionRate: parseFloat(completionRate.toFixed(1)),
            cancellationRate: parseFloat(cancellationRate.toFixed(1)),
            repeatClientRate: parseFloat(repeatClientRate.toFixed(1)),
            repeatCustomers,
            totalUniqueCustomers,
            totalAppointments: completedBookings.length,
            topServices
        };

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
