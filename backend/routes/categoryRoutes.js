const express = require('express');
const { 
    createCategory, 
    getCategories, 
    updateCategory, 
    deleteCategory, 
    toggleCategoryActive, 
    uploadCategoryMiddleware 
} = require('../controllers/categoryController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', protectAdmin, uploadCategoryMiddleware, createCategory);
router.get('/', getCategories); // Public or protected depending on needs, but GET usually public for customer/salons
router.put('/:id', protectAdmin, uploadCategoryMiddleware, updateCategory);
router.delete('/:id', protectAdmin, deleteCategory);
router.patch('/:id/toggle', protectAdmin, toggleCategoryActive);
// Admin: create a salon's starter menu (services + price) from this category's sub-categories
router.post('/:id/salon-services', protectAdmin, require('../controllers/categoryMenuController').addCategoryServicesToSalon);

module.exports = router;
