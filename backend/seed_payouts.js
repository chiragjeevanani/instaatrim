const http = require('http');

const payouts = [
  {
    id: 'pay-101',
    salonId: 'sal-1',
    salonName: 'Luxe Glow Salon & Spa',
    date: '2 Oct, 04:02 pm',
    bankAccount: '**** **** 4892',
    ifsc: 'HDFC0001234',
    grossAmount: 18500,
    commissionDeducted: 2220,
    commissionPercent: 12,
    netAmount: 16280,
    status: 'Pending',
    utr: null
  },
  {
    id: 'pay-100',
    salonId: 'sal-1',
    salonName: 'Luxe Glow Salon & Spa',
    date: '24 Sept, 09:02 pm',
    bankAccount: '**** **** 4892',
    ifsc: 'HDFC0001234',
    grossAmount: 24000,
    commissionDeducted: 2880,
    commissionPercent: 12,
    netAmount: 21120,
    status: 'Transferred',
    utr: 'UTR84920491824'
  },
  {
    id: 'pay-102',
    salonId: 'sal-2',
    salonName: 'Enrich Glamour Studio',
    date: '30 Sept, 09:02 pm',
    bankAccount: '**** **** 9921',
    ifsc: 'ICIC0000452',
    grossAmount: 14200,
    commissionDeducted: 1420,
    commissionPercent: 10,
    netAmount: 12780,
    status: 'Approved',
    utr: null
  }
];

const req = http.request('http://localhost:6200/api/payouts/seed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  console.log('Seed response:', res.statusCode);
});

req.on('error', console.error);
req.write(JSON.stringify({ payouts }));
req.end();
