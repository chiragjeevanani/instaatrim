const { z } = require('zod');

// Middleware generator that validates body against Zod schema and sanitizes input
const validateAndSanitize = (schema) => (req, res, next) => {
    try {
        // Parse and validate with Zod
        const validated = schema.parse(req.body);
        req.body = validated; // Assign cleanly stripped/sanitized fields
        next();
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Input validation failed',
                errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        next(err);
    }
};

// Common reusable schemas
const schemas = {
    phoneOtpSchema: z.object({
        phone: z.string().trim().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    }),
    verifyOtpSchema: z.object({
        phone: z.string().trim().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
        otp: z.string().trim().min(4, 'OTP must be at least 4 digits'),
        name: z.string().trim().max(100).optional(),
        fcmtoken: z.string().optional(),
        fcmtokenweb: z.string().optional()
    }),
    salonLoginSchema: z.object({
        identifier: z.string().trim().min(3, 'Phone or email is required'),
        password: z.string().min(6, 'Password must be at least 6 characters')
    }),
    enterprisePasswordPolicy: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one digit')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
};

module.exports = {
    validateAndSanitize,
    schemas
};
