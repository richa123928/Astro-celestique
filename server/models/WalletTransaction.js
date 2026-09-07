const mongoose = require('mongoose');

const WalletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['welcome_bonus', 'referral_bonus', 'topup', 'ai_chat_debit', 'consultation_debit', 'call_debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true   // positive = credit, negative = debit
  },
  description: {
    type: String,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WalletTransaction', WalletTransactionSchema);