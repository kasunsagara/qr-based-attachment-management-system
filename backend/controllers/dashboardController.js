const Module = require('../models/Module');
const AttachmentType = require('../models/AttachmentType');
const Attachment = require('../models/Attachment');
const ScanHistory = require('../models/ScanHistory');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private/Admin
 */
exports.getStats = async (req, res) => {
  try {
    const [totalModules, totalAttachmentTypes, totalQRCodes, totalScans] =
      await Promise.all([
        Module.countDocuments(),
        AttachmentType.countDocuments(),
        Attachment.countDocuments(),
        ScanHistory.countDocuments(),
      ]);

    // Get QR codes with images generated
    const qrGenerated = await Attachment.countDocuments({
      qrImage: { $ne: '' },
    });

    // Total physical attachments (sum of quantity)
    const physicalAttachments = await Attachment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' }
        }
      }
    ]);
    const totalPhysicalAttachments = physicalAttachments.length > 0 ? physicalAttachments[0].total : 0;

    // Active vs Inactive
    const activeAttachments = await Attachment.countDocuments({ status: 'active' });
    const inactiveAttachments = await Attachment.countDocuments({ status: 'inactive' });

    // Recent scans (last 10)
    const recentScans = await ScanHistory.find()
      .sort({ scannedAt: -1 })
      .limit(10);

    // Scans per module (aggregation)
    const scansPerModule = await ScanHistory.aggregate([
      {
        $group: {
          _id: '$moduleNumber',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Today's scans
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayScans = await ScanHistory.countDocuments({
      scannedAt: { $gte: today },
    });

    res.status(200).json({
      success: true,
      data: {
        totalModules,
        totalAttachmentTypes,
        totalQRCodes,
        totalPhysicalAttachments,
        qrGenerated,
        totalScans,
        todayScans,
        activeAttachments,
        inactiveAttachments,
        recentScans,
        scansPerModule,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
