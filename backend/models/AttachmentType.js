const mongoose = require('mongoose');

const attachmentTypeSchema = new mongoose.Schema({
  attachmentName: {
    type: String,
    required: [true, 'Please provide an attachment name'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

attachmentTypeSchema.index({ attachmentName: 1 });

module.exports = mongoose.model('AttachmentType', attachmentTypeSchema);
