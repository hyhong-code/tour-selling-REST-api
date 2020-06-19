const mongoose = require('mongoose');
const Tour = require('./tourModel');

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at lease 1'],
      max: [5, 'Rating must be not more than 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belongs to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belongs to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ReviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Enforces a user can only create one review for each tour
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// statics because we need to aggregate on the model
ReviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length) {
    const [{ nRatings: ratingsQuantity, avgRatings: ratingsAverage }] = stats;
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage,
      ratingsQuantity,
    });
  } else {
    // No reviews
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// Save to get new rating, then re-calc avg
ReviewSchema.post('save', async function (doc, next) {
  // doc middleware, this points to doc
  await this.constructor.calcAverageRatings(this.tour);
  next();
});

// Update/delete to get new rating, then re-calc avg
ReviewSchema.post(/^findOneAnd/, async function (doc, next) {
  // query middleware, this points to query
  await doc.constructor.calcAverageRatings(doc.tour);
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);
