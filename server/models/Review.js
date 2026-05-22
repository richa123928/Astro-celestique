const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per astrologer
ReviewSchema.index({ user: 1, astrologer: 1 }, { unique: true });

// Static method to calculate average rating
ReviewSchema.statics.getAverageRating = async function(astrologerId) {
  const obj = await this.aggregate([
    { $match: { astrologer: astrologerId } },
    { $group: { _id: '$astrologer', averageRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
  ]);

  try {
    await this.model('Astrologer').findByIdAndUpdate(astrologerId, {
      rating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0,
      totalRatings: obj[0] ? obj[0].totalRatings : 0
    });
  } catch (err) {
    console.error(err);
  }
};

ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.astrologer);
});

ReviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.astrologer);
});

module.exports = mongoose.model('Review', ReviewSchema);