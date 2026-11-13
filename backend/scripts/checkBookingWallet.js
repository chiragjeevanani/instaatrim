// READ-ONLY check: why didn't a booking's cashback reach the customer's wallet?
// Usage:  node scripts/checkBookingWallet.js IT-220011
require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');

(async () => {
    const id = process.argv[2];
    if (!id) { console.log('Usage: node scripts/checkBookingWallet.js <BOOKING_ID>'); process.exit(1); }
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

    const b = await Booking.findById(id).lean();
    if (!b) { console.log(`Booking ${id} not found`); process.exit(0); }
    console.log(`Booking ${id}`);
    console.log(`  customerId      : ${b.customerId}  (${b.customerName || ''}, ${b.customerPhone || ''})`);
    console.log(`  bill / paid     : ₹${b.totalAmount} / ₹${b.finalPaid}`);
    console.log(`  instant / wallet used / cashback : ₹${b.instantDiscount ?? '-'} / ₹${b.walletRedeemed ?? '-'} / ₹${b.walletCashback ?? '-'}`);

    let cust = null;
    if (mongoose.Types.ObjectId.isValid(String(b.customerId))) cust = await Customer.findById(b.customerId).lean();
    if (cust) {
        console.log(`  ✅ Customer found: ${cust.name} (${cust.phone}) — wallet now ₹${cust.wallet_balance || 0}`);
    } else {
        console.log('  ❌ No customer in DB with this customerId → wallet could not be updated.');
        if (b.customerPhone) {
            const digits = String(b.customerPhone).replace(/\D/g, '').slice(-10);
            const byPhone = await Customer.findOne({ phone: { $regex: `${digits}$` } }).lean();
            if (byPhone) console.log(`     A customer with the same phone exists: ${byPhone.name} (id ${byPhone._id}), wallet ₹${byPhone.wallet_balance || 0}`);
        }
    }
    if (b.walletCashback === undefined) console.log('  ℹ️ This booking was made before the new wallet code (backend not restarted then).');
    await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
