const express = require('express');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);

router.route('/').get(protect, getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
