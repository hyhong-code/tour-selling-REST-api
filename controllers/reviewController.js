// const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const factory = require('../controllers/handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // Attach tour and user to request body
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  next();
};

exports.getReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
