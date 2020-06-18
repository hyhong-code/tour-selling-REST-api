const express = require('express');

const {
  getReviews,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.route('/').get(getReviews).post(protect, restrictTo('user'), addReview);

router.route('/:id').patch(updateReview).delete(deleteReview);

module.exports = router;
