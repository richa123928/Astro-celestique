const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sessionId:  { type: String, required: true, index: true },
  userId:      { type: String },
  astrologerId:{ type: String },
  senderType: { type: String, enum: ['user', 'astrologer'], required: true },
  senderName: { type: String },
  message:           { type: String, required: true },   // as typed by sender
  translatedMessage: { type: String },                    // shown to the other party
  createdAt: { type: Date, default: Date.now }
});

// Auto-delete documents 2 days (172800 seconds) after createdAt.
// This runs as a background MongoDB task — no manual cleanup job needed.
ChatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 172800 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);