const AttachmentType = require('../models/AttachmentType');
const Attachment = require('../models/Attachment');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all attachment types
 * @route   GET /api/attachment-types
 * @access  Private/Admin
 */
exports.getAttachmentTypes = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.attachmentName = { $regex: search, $options: 'i' };
    }

    const total = await AttachmentType.countDocuments(query);
    const types = await AttachmentType.find(query)
      .sort({ attachmentName: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: types,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get attachment types error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get single attachment type
 * @route   GET /api/attachment-types/:id
 * @access  Private/Admin
 */
exports.getAttachmentType = async (req, res) => {
  try {
    const type = await AttachmentType.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ success: false, message: 'Attachment type not found' });
    }
    res.status(200).json({ success: true, data: type });
  } catch (error) {
    console.error('Get attachment type error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create attachment type
 * @route   POST /api/attachment-types
 * @access  Private/Admin
 */
exports.createAttachmentType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { attachmentName, description } = req.body;

    const existing = await AttachmentType.findOne({ attachmentName });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Attachment type "${attachmentName}" already exists`,
      });
    }

    const type = await AttachmentType.create({ attachmentName, description });
    res.status(201).json({ success: true, data: type });
  } catch (error) {
    console.error('Create attachment type error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Attachment type already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update attachment type
 * @route   PUT /api/attachment-types/:id
 * @access  Private/Admin
 */
exports.updateAttachmentType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const type = await AttachmentType.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ success: false, message: 'Attachment type not found' });
    }

    if (req.body.attachmentName && req.body.attachmentName !== type.attachmentName) {
      const existing = await AttachmentType.findOne({ attachmentName: req.body.attachmentName });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Attachment type "${req.body.attachmentName}" already exists`,
        });
      }
    }

    const updated = await AttachmentType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Update attachment type error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete attachment type
 * @route   DELETE /api/attachment-types/:id
 * @access  Private/Admin
 */
exports.deleteAttachmentType = async (req, res) => {
  try {
    const type = await AttachmentType.findById(req.params.id);
    if (!type) {
      return res.status(404).json({ success: false, message: 'Attachment type not found' });
    }

    const attachmentCount = await Attachment.countDocuments({ attachmentTypeId: req.params.id });
    if (attachmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete. ${attachmentCount} attachment(s) use this type. Delete them first.`,
      });
    }

    await AttachmentType.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Attachment type deleted successfully' });
  } catch (error) {
    console.error('Delete attachment type error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
