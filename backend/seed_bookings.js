const http = require('http');

// Get today's date formatted properly
const today = new Date();
const dateKey = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const mockBookings = [
  {
    _id: 'IT-224098',
    customerId: 'cust-1',
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98765 43210',
    salonId: 'sal-1',
    salonName: 'Luxe Glow Salon & Spa',
    address: 'Indiranagar, Bangalore',
    bookingMode: 'Scheduled',
    status: 'Service Started',
    dateKey: dateKey,
    time: '04:30 PM',
    services: [
      { id: 'srv-1', name: 'Signature Hair Spa', price: 1500, time: 45 },
      { id: 'srv-2', name: 'Advanced Facial', price: 2500, time: 60 }
    ],
    totalAmount: 4000,
    discountAmount: 200,
    finalPaid: 3800,
    paymentMethod: 'UPI',
    paymentStatus: 'Successful',
    notes: 'Please use mild shampoo, sensitive scalp.',
    stationId: 'st-2',
    staffId: 'stf-2'
  },
  {
    _id: 'IT-224101',
    customerId: 'cust-2',
    customerName: 'Priya Patel',
    customerPhone: '+91 98765 00000',
    salonId: 'sal-1',
    salonName: 'Luxe Glow Salon & Spa',
    address: 'Indiranagar, Bangalore',
    bookingMode: 'Instant',
    status: 'Checked-In',
    dateKey: dateKey,
    time: '05:00 PM',
    services: [
      { id: 'srv-3', name: 'Keratin Treatment', price: 4000, time: 90 }
    ],
    totalAmount: 4000,
    discountAmount: 0,
    finalPaid: 4000,
    paymentMethod: 'Pay at Salon',
    paymentStatus: 'Pending',
    notes: '',
    stationId: 'st-3',
    staffId: 'stf-3'
  },
  {
    _id: 'IT-224105',
    customerId: 'cust-4',
    customerName: 'Rahul Verma',
    customerPhone: '+91 99999 11111',
    salonId: 'sal-1',
    salonName: 'Luxe Glow Salon & Spa',
    address: 'Indiranagar, Bangalore',
    bookingMode: 'Instant',
    status: 'Completed',
    dateKey: dateKey,
    time: '10:00 AM',
    services: [
      { id: 'srv-1', name: 'Signature Hair Spa', price: 1500, time: 45 }
    ],
    totalAmount: 1500,
    discountAmount: 150,
    finalPaid: 1350,
    paymentMethod: 'Credit Card',
    paymentStatus: 'Successful',
    notes: '',
    stationId: 'st-1',
    staffId: 'stf-1'
  }
];

const req = http.request('http://localhost:6200/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Booking 1 response:', data));
});
req.on('error', console.error);
req.write(JSON.stringify(mockBookings[0]));
req.end();

const req2 = http.request('http://localhost:6200/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Booking 2 response:', data));
});
req2.on('error', console.error);
req2.write(JSON.stringify(mockBookings[1]));
req2.end();

const req3 = http.request('http://localhost:6200/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Booking 3 response:', data));
});
req3.on('error', console.error);
req3.write(JSON.stringify(mockBookings[2]));
req3.end();
