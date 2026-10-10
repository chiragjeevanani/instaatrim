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

exports.createCategory = async (req, res) => {
    try {
        const { name, shortName, slug, gender, serviceCategories, description, isActive, colSpan, price } = req.body;
        
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

        const category = new Category({
            name,
            shortName: shortName || name,
            slug,
            gender: gender || 'unisex',
            serviceCategories: parsedServiceCategories,
            description,
            isActive: isActive === 'true' || isActive === true,
            colSpan: colSpan ? Number(colSpan) : 1,
            price: price ? Number(price) : 0,
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
        const { name, shortName, slug, gender, serviceCategories, description, isActive, colSpan, price } = req.body;
        
        const updateData = {
            name,
            shortName,
            slug,
            gender,
            description,
            isActive: isActive === 'true' || isActive === true,
            colSpan: colSpan ? Number(colSpan) : 1,
            price: price ? Number(price) : 0,
        };

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

        if (req.file) {
            const baseUrl = req.protocol + '://' + req.get('host');
            updateData.image = `${baseUrl}/uploads/categories/${req.file.filename}`;
        }

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
