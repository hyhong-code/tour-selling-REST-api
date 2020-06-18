const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');

exports.getReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.addReview = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  // Check if tour exists
  if (!tour) {
    return next(new AppError(`No such tour with id ${req.params.tourId}`, 404));
  }

  // Attach tour and user to request body
  req.body.tour = req.params.tourId;
  req.body.user = req.user._id;

  // Create the review
  const review = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { review },
  });
});
