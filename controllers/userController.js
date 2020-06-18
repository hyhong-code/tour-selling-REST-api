const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const factory = require('../controllers/handlerFactory');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

// Remove unwanted fields in req.body to get ready for update
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // Check if user tries to update password
  if (req.body.password || req.body.passwordComfirmed) {
    return next(
      new AppError(
        `This route is not for pasword updates, please use /api/v1/users/updatemypassword`,
        400
      )
    );
  }

  // Fileter out unwanted update fields (role...)
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Update user info
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

// Do not update password with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
