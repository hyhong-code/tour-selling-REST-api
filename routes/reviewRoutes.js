const express = require('express');

const { getReviews, addReview } = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.route('/').get(getReviews).post(protect, restrictTo('user'), addReview);

module.exports = router;
