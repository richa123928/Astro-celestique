const mongoose = require('mongoose');

const EarningSchema = new mongoose.Schema({
  astrologer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Astrologer',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['chat', 'call'],
    required: true
  },
  amount: {
    type: Number,
    required: true   // amount earned for this one minute tick
  },
  minutesBilled: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true   // createdAt used for "today's earnings" date filtering
});

module.exports = mongoose.model('Earning', EarningSchema);