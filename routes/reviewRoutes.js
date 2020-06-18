const express = require('express');

const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getReviews)
  .post(restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .patch(restrictTo('user', 'admiin'), updateReview)
  .delete(restrictTo('user', 'admiin'), deleteReview)
  .get(getReview);

module.exports = router;
