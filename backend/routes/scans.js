const express = require('express');
const router = express.Router();
const { getScans, getRecentScans } = require('../controllers/scanController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/', getScans);
router.get('/recent', getRecentScans);

module.exports = router;
