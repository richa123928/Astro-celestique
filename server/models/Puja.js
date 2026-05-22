const mongoose = require('mongoose');

const PujaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pujaType: {
    type: String,
    required: true,
    enum: [
      'grah_shanti',
      'death_shanti',
      'lakshmi_vriddhi',
      'love_relationship',
      'new_home',
      'saraswati',
      'marriage',
      'sarv_karya_samporan'
    ]
  },
  // Primary person details
  primaryPerson: {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    timeOfBirth: { type: String },
    timeNotAvailable: { type: Boolean, default: false },
    placeOfBirth: { type: String, required: true }
  },
  // For love/relationship and marriage puja
  secondaryPerson: {
    name: String,
    dob: Date,
    timeOfBirth: String,
    placeOfBirth: String
  },
  // For death shanti puja
  deceasedDetails: {
    name: String,
    dateOfDeath: Date,
    placeOfDeath: String
  },
  preferredDate: {
    type: Date
  },
  specialNotes: {
    type: String
  },
  // Pricing
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR'
  },
  amountINR: {
    type: Number
  },
  amountPaid: {
    type: Number
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Payment
  paymentId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe']
  },
  reportUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Puja', PujaSchema);