const Razorpay = require('razorpay');
const crypto = require('crypto');

exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in rupees
        
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay keys are missing from environment variables!');
            return res.status(500).json({ success: false, message: 'Server configuration error: missing payment keys' });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: 'rcpt_' + Date.now()
        };
        
        const order = await razorpay.orders.create(options);
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment order' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');
            
        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid signature sent!' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
