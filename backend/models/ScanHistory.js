const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  attachmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment',
    required: true,
  },
  qrId: {
    type: String,
    required: true,
  },
  moduleNumber: {
    type: Number,
    required: true,
  },
  attachmentName: {
    type: String,
    required: true,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  },
  deviceInfo: {
    type: String,
    default: '',
  },
});

scanHistorySchema.index({ scannedAt: -1 });
scanHistorySchema.index({ qrId: 1 });

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
