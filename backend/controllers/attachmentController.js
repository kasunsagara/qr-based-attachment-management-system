const Attachment = require('../models/Attachment');
const Module = require('../models/Module');
const AttachmentType = require('../models/AttachmentType');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all attachments
 * @route   GET /api/attachments
 * @access  Private/Admin
 */
exports.getAttachments = async (req, res) => {
  try {
    const { search, moduleId, attachmentTypeId, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (moduleId) query.moduleId = moduleId;
    if (attachmentTypeId) query.attachmentTypeId = attachmentTypeId;
    if (status) query.status = status;
    if (search) {
      query.qrId = { $regex: search, $options: 'i' };
    }

    const total = await Attachment.countDocuments(query);
    const attachments = await Attachment.find(query)
      .populate('moduleId', 'moduleNumber description')
      .populate('attachmentTypeId', 'attachmentName description')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: attachments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get single attachment
 * @route   GET /api/attachments/:id
 * @access  Private/Admin
 */
exports.getAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id)
      .populate('moduleId', 'moduleNumber description')
      .populate('attachmentTypeId', 'attachmentName description');

    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }
    res.status(200).json({ success: true, data: attachment });
  } catch (error) {
    console.error('Get attachment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Generate a unique QR ID like QR0001, QR0002, etc.
 */
async function generateQrId() {
  const lastAttachment = await Attachment.findOne().sort({ qrId: -1 });
  if (!lastAttachment || !lastAttachment.qrId) {
    return 'QR0001';
  }
  const lastNum = parseInt(lastAttachment.qrId.replace('QR', ''));
  const nextNum = lastNum + 1;
  return `QR${String(nextNum).padStart(4, '0')}`;
}

/**
 * @desc    Create attachment
 * @route   POST /api/attachments
 * @access  Private/Admin
 */
exports.createAttachment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { moduleId, attachmentTypeId } = req.body;

    // Validate module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Validate attachment type exists
    const attachmentType = await AttachmentType.findById(attachmentTypeId);
    if (!attachmentType) {
      return res.status(404).json({ success: false, message: 'Attachment type not found' });
    }

    // Check if combination already exists
    const existing = await Attachment.findOne({ moduleId, attachmentTypeId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Module ${module.moduleNumber} + ${attachmentType.attachmentName} already exists (${existing.qrId})`,
      });
    }

    const qrId = await generateQrId();

    const attachment = await Attachment.create({
      qrId,
      moduleId,
      attachmentTypeId,
      status: req.body.status || 'active',
      quantity: req.body.quantity || 1,
    });

    const populated = await Attachment.findById(attachment._id)
      .populate('moduleId', 'moduleNumber description')
      .populate('attachmentTypeId', 'attachmentName description');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Create attachment error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'This module + attachment type combination already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update attachment
 * @route   PUT /api/attachments/:id
 * @access  Private/Admin
 */
exports.updateAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    // Only allow updating status and quantity
    const updateFields = {};
    if (req.body.status) updateFields.status = req.body.status;
    if (req.body.quantity) updateFields.quantity = req.body.quantity;

    const updated = await Attachment.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    })
      .populate('moduleId', 'moduleNumber description')
      .populate('attachmentTypeId', 'attachmentName description');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Update attachment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete attachment
 * @route   DELETE /api/attachments/:id
 * @access  Private/Admin
 */
exports.deleteAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    await Attachment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
