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
  photo: {
    type: String,
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 6 characters'],
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Hash password pre save
UserSchema.pre('save', async function (next) {
  // Only run if password is modified
  if (!this.modifiedPaths().includes('password')) return next();
  // Hash with 12 rounds of salt
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // required is only for input validation
  next();
});

module.exports = mongoose.model('User', UserSchema);
