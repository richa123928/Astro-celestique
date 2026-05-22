const mongoose = require('mongoose');

const AstrologerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  avatar: {
    type: String
  },
  expertise: [{
    type: String,
    enum: [
      'Vedic', 'KP System', 'Tarot', 'Numerology',
      'Vastu', 'Nadi', 'Prashna', 'Lal Kitab',
      'Palmistry', 'Love & Marriage', 'Career', 'Finance'
    ]
  }],
  languages: [{
    type: String
  }],
  experience: {
    type: Number,
    required: true
  },
  pricePerMin: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['online', 'busy', 'offline'],
    default: 'offline'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  totalEarnings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Astrologer', AstrologerSchema);