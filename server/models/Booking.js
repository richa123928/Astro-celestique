const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  astrologer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Astrologer',
    required: true
  },
  type: {
    type: String,
    enum: ['chat', 'call', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  durationMinutes: {
    type: Number,
    default: 0
  },
  pricePerMin: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  roomId: {
    type: String
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);