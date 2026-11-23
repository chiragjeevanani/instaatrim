const express = require('express');
const router = express.Router();
const { requireAdmin, requireLogin, requireCustomer, requireSalonOrAdmin, requireSalonParamOrAdmin, requireCustomerParamOrAdmin } = require('../middlewares/accessControl');
const multer = require('multer');
const { imageExt, imageUploadOptions } = require('../utils/imageUpload');
const path = require('path');
const fs = require('fs');
const ritualController = require('../controllers/ritualController');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = imageExt(file);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

const upload = multer(imageUploadOptions(storage));

router.get('/', ritualController.getAllRituals);
router.post('/', requireAdmin, upload.single('image'), ritualController.createRitual);
router.put('/:id', requireAdmin, upload.single('image'), ritualController.updateRitual);
router.delete('/:id', requireAdmin, ritualController.deleteRitual);

module.exports = router;
