const assert = require('assert');

// The logic from salonAnalyticsController.js extracted for testing
function calculateBookingRevenue(bookings) {
    let totalGmv = 0; // Total Customer Paid
    let totalSalonRevenue = 0;
    let instaaTrimDirectRevenue = 0;
    let instaaTrimIndirectRevenue = 0;

    bookings.forEach(b => {
        const billValue = b.totalAmount || 0;
        const finalPaid = b.finalPaid !== undefined ? b.finalPaid : billValue;
        
        // 1. Promotional and Discount Rules
        const salonPromoBudget = billValue * 0.50; // 50% of bill value
        const customerVisibleDiscount = billValue * 0.40; // 40% of bill value
        
        // 2. Split of Customer Visible Discount
        const instantDiscount = customerVisibleDiscount * 0.50;
        const walletCashbackIssued = customerVisibleDiscount * 0.50;
        
        // 3. Deduction Logic
        const walletRedeemed = Math.max(0, (billValue - finalPaid) - instantDiscount);
        
        // 4. Revenue Sharing
        const customerPays = finalPaid;
        const salonRevenue = billValue - salonPromoBudget;
        
        // 5. InstaaTrim Revenue Accounting
        const directRevenue = customerPays - salonRevenue - walletCashbackIssued + walletRedeemed;

        totalGmv += customerPays;
        totalSalonRevenue += salonRevenue;
        instaaTrimDirectRevenue += directRevenue;
        instaaTrimIndirectRevenue += (walletCashbackIssued - walletRedeemed);
    });

    return { totalGmv, totalSalonRevenue, instaaTrimDirectRevenue, instaaTrimIndirectRevenue };
}

function runTests() {
    console.log("Running revenue calculation tests...");
    
    // Booking 1 (as per Excel screenshot)
    const booking1 = [{ totalAmount: 1000, finalPaid: 800 }]; // 1000 bill, 200 instant discount, 0 wallet redeemed
    const result1 = calculateBookingRevenue(booking1);
    
    assert.strictEqual(result1.totalGmv, 800, "Booking 1: GMV / Customer Paid should be 800");
    assert.strictEqual(result1.totalSalonRevenue, 500, "Booking 1: Salon Revenue should be 500");
    assert.strictEqual(result1.instaaTrimDirectRevenue, 100, "Booking 1: InstaaTrim Direct Revenue should be 100");
    assert.strictEqual(result1.instaaTrimIndirectRevenue, 200, "Booking 1: Indirect Revenue (Cashback issued) should be 200");
    
    console.log("✅ Booking 1 calculations passed.");
    
    // Booking 2 (as per Excel screenshot)
    const booking2 = [{ totalAmount: 1000, finalPaid: 700 }]; // 1000 bill, 200 instant discount, 100 wallet redeemed
    const result2 = calculateBookingRevenue(booking2);
    
    assert.strictEqual(result2.totalGmv, 700, "Booking 2: GMV / Customer Paid should be 700");
    assert.strictEqual(result2.totalSalonRevenue, 500, "Booking 2: Salon Revenue should be 500");
    assert.strictEqual(result2.instaaTrimDirectRevenue, 100, "Booking 2: InstaaTrim Direct Revenue should be 100");
    assert.strictEqual(result2.instaaTrimIndirectRevenue, 100, "Booking 2: Net Indirect Revenue should be 100");
    
    console.log("✅ Booking 2 calculations passed.");
    
    // Summary of Two Bookings (Booking 1 + Booking 2)
    const summaryBookings = [...booking1, ...booking2];
    const summaryResult = calculateBookingRevenue(summaryBookings);
    
    assert.strictEqual(summaryResult.totalGmv, 1500, "Summary: Total Booking Amount Paid should be 1500");
    assert.strictEqual(summaryResult.totalSalonRevenue, 1000, "Summary: Total Salon Revenue should be 1000");
    assert.strictEqual(summaryResult.instaaTrimDirectRevenue, 200, "Summary: Total Direct Revenue should be 200");
    assert.strictEqual(summaryResult.instaaTrimIndirectRevenue, 300, "Summary: Total Indirect Revenue should be 300");
    
    console.log("✅ Two Bookings Summary passed.");
    console.log("All tests completed successfully!");
}

runTests();
