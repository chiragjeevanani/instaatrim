const Customer = require('../models/Customer');

// GET /api/customers/me  (protected)
// Returns the logged-in customer's profile
const getMyProfile = async (req, res) => {
    try {
        // req.customer is attached by protectCustomer middleware
        const customer = req.customer;
        return res.status(200).json({
            success: true,
            customer: {
                id: customer._id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email || null,
                gender: customer.gender,
                dob: customer.dob || null,
                is_elite: customer.is_elite,
                referral_code: customer.referral_code || null,
                referred_by_code: customer.referred_by_code || null,
                favorite_salon_ids: customer.favorite_salon_ids || [],
                auth_provider: customer.auth_provider,
                createdAt: customer.createdAt,
            }
        });
    } catch (error) {
        console.error('getMyProfile error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/customers/me  (protected)
// Update logged-in customer's profile
const updateMyProfile = async (req, res) => {
    try {
        const { name, email, gender, dob } = req.body;
        const customer = req.customer;

        if (name !== undefined) customer.name = name.trim();
        if (email !== undefined) customer.email = email.trim();
        if (gender !== undefined) customer.gender = gender;
        if (dob !== undefined) customer.dob = dob;

        await customer.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            customer: {
                id: customer._id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email || null,
                gender: customer.gender,
                dob: customer.dob || null,
                is_elite: customer.is_elite,
                referral_code: customer.referral_code || null,
            }
        });
    } catch (error) {
        console.error('updateMyProfile error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/customers/all  (admin)
// Returns all customers from DB
const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        const data = customers.map(c => ({
            id: c._id.toString(),
            name: c.name,
            phone: c.phone,
            email: c.email || null,
            gender: c.gender,
            dob: c.dob || null,
            isElite: c.is_elite,
            referralCode: c.referral_code || null,
            authProvider: c.auth_provider,
            createdAt: c.createdAt,
        }));
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('getAllCustomers error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getMyProfile, updateMyProfile, getAllCustomers };
