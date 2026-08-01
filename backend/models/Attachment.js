const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  qrId: {
    type: String,
    required: [true, 'QR ID is required'],
    unique: true,
    trim: true,
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module is required'],
  },
  attachmentTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttachmentType',
    required: [true, 'Attachment type is required'],
  },
  qrImage: {
    type: String, // Base64 encoded QR code image
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure unique module + attachment type combinations
attachmentSchema.index({ moduleId: 1, attachmentTypeId: 1 }, { unique: true });
attachmentSchema.index({ qrId: 1 });

module.exports = mongoose.model('Attachment', attachmentSchema);
