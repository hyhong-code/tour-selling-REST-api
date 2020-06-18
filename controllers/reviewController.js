const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');

exports.getReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.addReview = catchAsync(async (req, res, next) => {
  // Attach tour and user to request body
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user._id;

  // Check if tour exists
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError(`No such tour with id ${req.params.tourId}`, 404));
  }

  // Create the review
  const review = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { review },
  });
});

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
