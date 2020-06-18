const mongoose = require('mongoose');
const validator = require('validator');

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
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirmation is required'],
    validate: {
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

module.exports = mongoose.model('User', UserSchema);
