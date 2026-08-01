const ScanHistory = require('../models/ScanHistory');

/**
 * @desc    Get scan history
 * @route   GET /api/scans
 * @access  Private/Admin
 */
exports.getScans = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { qrId: { $regex: search, $options: 'i' } },
        { attachmentName: { $regex: search, $options: 'i' } },
      ];
      const searchNum = parseInt(search);
      if (!isNaN(searchNum)) {
        query.$or.push({ moduleNumber: searchNum });
      }
    }

    const total = await ScanHistory.countDocuments(query);
    const scans = await ScanHistory.find(query)
      .sort({ scannedAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: scans,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get scans error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get recent scans
 * @route   GET /api/scans/recent
 * @access  Private/Admin
 */
exports.getRecentScans = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const scans = await ScanHistory.find()
      .sort({ scannedAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: scans,
    });
  } catch (error) {
    console.error('Get recent scans error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
