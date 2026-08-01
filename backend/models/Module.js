const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    required: [true, 'Please provide a module number'],
    unique: true,
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

moduleSchema.index({ moduleNumber: 1 });

module.exports = mongoose.model('Module', moduleSchema);
