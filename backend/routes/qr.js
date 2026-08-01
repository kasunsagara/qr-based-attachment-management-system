const express = require('express');
const router = express.Router();
const {
  generateQR,
  bulkGenerateQR,
  bulkCreateAndGenerate,
  scanQR,
  downloadQR,
  generatePDF,
} = require('../controllers/qrController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route - QR scan (no authentication needed for workers)
router.get('/scan/:qrId', scanQR);

// Protected routes - Admin only
router.post('/generate/:attachmentId', protect, adminOnly, generateQR);
router.post('/bulk-generate', protect, adminOnly, bulkGenerateQR);
router.post('/bulk-create', protect, adminOnly, bulkCreateAndGenerate);
router.get('/download/:attachmentId', protect, adminOnly, downloadQR);
router.post('/pdf', protect, adminOnly, generatePDF);

module.exports = router;
