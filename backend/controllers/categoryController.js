const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/categories');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'cat-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

exports.uploadCategoryMiddleware = upload.single('image');

// Sub-category → services (name, duration in minutes, price) sent as JSON string (FormData) or array.
// Returns a clean array, or undefined when not sent.
const parseSubcategoryGroups = (raw) => {
    if (raw === undefined || raw === null || raw === '') return undefined;
    let data = raw;
    if (typeof raw === 'string') {
        try { data = JSON.parse(raw); } catch (e) { return undefined; }
    }
    if (!Array.isArray(data)) return undefined;
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();
    const groups = [];
    for (const g of data.slice(0, 50)) {
        const name = clean(g && g.name);
        if (!name) continue;
        const seen = new Set();
        const services = [];
        for (const sv of (Array.isArray(g.services) ? g.services : []).slice(0, 100)) {
            const sName = clean(sv && sv.name);
            if (!sName || seen.has(sName.toLowerCase())) continue;
            seen.add(sName.toLowerCase());
            const dur = Number(sv.duration);
            const price = Number(sv.price);
            services.push({
                name: sName,
                duration: Number.isFinite(dur) && dur > 0 ? Math.round(dur) : null,
                price: Number.isFinite(price) && price > 0 ? Math.round(price) : 0
            });
        }
        groups.push({ name, services });
    }
    return groups;
};

// Keep the flat tag list in sync: every catalog service name is also a tag (offers / matching use tags)
const withGroupServiceTags = (tags, groups) => {
    const out = Array.isArray(tags) ? [...tags] : [];
    const lower = new Set(out.map((t) => String(t).toLowerCase()));
    (groups || []).forEach((g) => g.services.forEach((sv) => {
        if (!lower.has(sv.name.toLowerCase())) { lower.add(sv.name.toLowerCase()); out.push(sv.name); }
    }));
    return out;
};

// Same category name can't be added twice for the same salon (or again when it's already global).
// Returns a friendly message if it's a duplicate, else null.
const findDuplicateCategory = async ({ name, slug, salonId, excludeId }) => {
    const clean = String(name || '').trim();
    const sid = salonId && salonId !== 'all' && salonId !== 'null' ? String(salonId) : null;
    const notSelf = excludeId ? { _id: { $ne: excludeId } } : {};
    if (clean) {
        const esc = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const sameName = await Category.find({ ...notSelf, name: { $regex: `^\\s*${esc}\\s*$`, $options: 'i' } }).select('salonId salonName').lean();
        const global = sameName.find((c) => !c.salonId);
        if (global) return `"${clean}" category is already added for All Salons.`;
        const sameSalon = sid && sameName.find((c) => String(c.salonId) === sid);
        if (sameSalon) return `"${clean}" category is already added for ${sameSalon.salonName || 'this salon'}.`;
    }
    if (slug && (await Category.exists({ ...notSelf, slug: String(slug).trim() }))) {
        return `Slug "${String(slug).trim()}" is already used by another category. Please use a different slug.`;
    }
    return null;
};

exports.createCategory = async (req, res) => {
    try {
        const { name, shortName, slug, gender, serviceCategories, description, isActive, colSpan, price, discount, originalPrice, salonId, salonName } = req.body;

        const duplicate = await findDuplicateCategory({ name, slug, salonId });
        if (duplicate) return res.status(409).json({ success: false, code: 'DUPLICATE', message: duplicate });

        let imageUrl = '';
        if (req.file) {
            const baseUrl = req.protocol + '://' + req.get('host');
            imageUrl = `${baseUrl}/uploads/categories/${req.file.filename}`;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        }

        // Handle serviceCategories coming as string or array
        let parsedServiceCategories = [];
        if (serviceCategories) {
            if (typeof serviceCategories === 'string') {
                try {
                    // Try parsing if it's stringified JSON array
                    parsedServiceCategories = JSON.parse(serviceCategories);
                } catch(e) {
                    // Otherwise it's comma separated
                    parsedServiceCategories = serviceCategories.split(',').map(s => s.trim()).filter(Boolean);
                }
            } else if (Array.isArray(serviceCategories)) {
                parsedServiceCategories = serviceCategories;
            }
        } else {
            parsedServiceCategories = [name];
        }

        const subcategoryGroups = parseSubcategoryGroups(req.body.subcategoryGroups) || [];
        parsedServiceCategories = withGroupServiceTags(parsedServiceCategories, subcategoryGroups);

        const category = new Category({
            name,
            subcategoryGroups,
            shortName: shortName || name,
            slug,
            gender: gender || 'unisex',
            homeSection: ['trending', 'featured'].includes(req.body.homeSection) ? req.body.homeSection : '',
            serviceCategories: parsedServiceCategories,
            description,
            isActive: isActive === 'true' || isActive === true,
            colSpan: colSpan ? Number(colSpan) : 1,
            price: price ? Number(price) : 0,
            discount: discount ? Number(discount) : 0,
            originalPrice: originalPrice ? Number(originalPrice) : (price ? Number(price) : 0),
            salonId: salonId && salonId !== 'all' && salonId !== 'null' ? salonId : null,
            salonName: salonName || 'All Salons (Global)',
            image: imageUrl
        });

        await category.save();
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, shortName, slug, gender, serviceCategories, description, isActive, colSpan, price, discount, originalPrice, salonId, salonName } = req.body;
        
        const updateData = {
            name,
            shortName,
            slug,
            gender,
            description,
            salonId: salonId && salonId !== 'all' && salonId !== 'null' ? salonId : null,
            salonName: salonName || 'All Salons (Global)',
            isActive: isActive === 'true' || isActive === true,
            colSpan: colSpan ? Number(colSpan) : 1,
            price: price ? Number(price) : 0,
            discount: discount !== undefined ? Number(discount) : 0,
            originalPrice: originalPrice !== undefined ? Number(originalPrice) : (price ? Number(price) : 0),
        };
        // Home page section (only when the form sends it)
        if (req.body.homeSection !== undefined) {
            updateData.homeSection = ['trending', 'featured'].includes(req.body.homeSection) ? req.body.homeSection : '';
        }

        if (serviceCategories) {
             if (typeof serviceCategories === 'string') {
                try {
                    updateData.serviceCategories = JSON.parse(serviceCategories);
                } catch(e) {
                    updateData.serviceCategories = serviceCategories.split(',').map(s => s.trim()).filter(Boolean);
                }
            } else if (Array.isArray(serviceCategories)) {
                updateData.serviceCategories = serviceCategories;
            }
        }

        const groups = parseSubcategoryGroups(req.body.subcategoryGroups);
        if (groups !== undefined) {
            updateData.subcategoryGroups = groups;
            if (updateData.serviceCategories) updateData.serviceCategories = withGroupServiceTags(updateData.serviceCategories, groups);
        }

        if (req.file) {
            const baseUrl = req.protocol + '://' + req.get('host');
            updateData.image = `${baseUrl}/uploads/categories/${req.file.filename}`;
        }

        const duplicate = await findDuplicateCategory({ name, slug, salonId, excludeId: req.params.id });
        if (duplicate) return res.status(409).json({ success: false, code: 'DUPLICATE', message: duplicate });

        const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        
        if (category.image && category.image.includes('/uploads/categories/')) {
            const filename = category.image.split('/uploads/categories/')[1];
            const filepath = path.join(__dirname, '../uploads/categories', filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }

        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.toggleCategoryActive = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        
        category.isActive = !category.isActive;
        await category.save();
        
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
