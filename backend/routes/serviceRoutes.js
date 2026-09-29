const express = require('express');
const { getServices } = require('../controllers/serviceController');
const { protectAdmin } = require('../middlewares/authMiddleware'); // we can protect if we want, but GET is fine

const router = express.Router();

router.get('/', getServices);

module.exports = router;
