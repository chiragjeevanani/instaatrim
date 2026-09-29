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

module.exports = router;
