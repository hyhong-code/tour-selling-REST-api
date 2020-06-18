const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, 'Email is required'],
    unique: [true, 'Email must be unique'],
    validate: [validator.isEmail, 'Please enter a valid email address'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    required: [true, 'Password is required'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirmation is required'],
    validate: {
      // Only works on create() and save()
      validator: function (v) {
        return v === this.password;
      },
      message: 'Passwords must match',
    },
  },
  passwordChangedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// Hash password pre save
UserSchema.pre('save', async function (next) {
  // Only run if password is modified
  if (!this.isModified('password')) return next();
  // Hash with 12 rounds of salt
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // required is only for input validation
  next();
});

// Update passwordChangedAt when password changes
UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.methods.correctPassword = async function (plain, hashed) {
  // can't use this.password because set to select:false
  return await bcrypt.compare(plain, hashed);
};

// Check if user changed password after token issued
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // JWT Timestamp in seconds, getTime() returns milliseconds
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimestamp > JWTTimestamp;
  }
  return false;
};

UserSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins
  await this.save({ validateBeforeSave: false });

  return resetToken; // to send in email
};

module.exports = mongoose.model('User', UserSchema);
