const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    itemId:   { type: Number, required: true },   // matches the REMEDIES catalog id on frontend
    name:     { type: String, required: true },
    price:    { type: Number, required: true },   // unit price at time of order (INR)
    qty:      { type: Number, required: true, default: 1 },
    category: { type: String }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    line1:    { type: String, required: true },
    line2:    { type: String },
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    pincode:  { type: String, required: true }
  },
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR'
  },
  amount: {
    type: Number,
    required: true   // total amount in INR (what Razorpay actually charged)
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);