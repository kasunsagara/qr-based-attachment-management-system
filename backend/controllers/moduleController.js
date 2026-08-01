const Module = require('../models/Module');
const Attachment = require('../models/Attachment');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all modules
 * @route   GET /api/modules
 * @access  Private/Admin
 */
exports.getModules = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      const searchNum = parseInt(search);
      if (!isNaN(searchNum)) {
        query.moduleNumber = searchNum;
      } else {
        query.description = { $regex: search, $options: 'i' };
      }
    }

    const total = await Module.countDocuments(query);
    const modules = await Module.find(query)
      .sort({ moduleNumber: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: modules,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get single module
 * @route   GET /api/modules/:id
 * @access  Private/Admin
 */
exports.getModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }
    res.status(200).json({ success: true, data: module });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create module
 * @route   POST /api/modules
 * @access  Private/Admin
 */
exports.createModule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { moduleNumber, description } = req.body;

    // Check if module number already exists
    const existing = await Module.findOne({ moduleNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Module ${moduleNumber} already exists`,
      });
    }

    const module = await Module.create({ moduleNumber, description });
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    console.error('Create module error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Module number already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update module
 * @route   PUT /api/modules/:id
 * @access  Private/Admin
 */
exports.updateModule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Check for duplicate module number if changed
    if (req.body.moduleNumber && req.body.moduleNumber !== module.moduleNumber) {
      const existing = await Module.findOne({ moduleNumber: req.body.moduleNumber });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Module ${req.body.moduleNumber} already exists`,
        });
      }
    }

    const updated = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete module
 * @route   DELETE /api/modules/:id
 * @access  Private/Admin
 */
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Check if module has attachments
    const attachmentCount = await Attachment.countDocuments({ moduleId: req.params.id });
    if (attachmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete module. It has ${attachmentCount} attachment(s). Delete them first.`,
      });
    }

    await Module.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
