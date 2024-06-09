const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto'); // Import the crypto module

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true
  },
  profilePicture: {
    type: String,
    default: 'default-profile.png'
  },
  education: {
    institution: String,
    status: { type: String, enum: ['alumni', 'student'] },
    faculty: String
  },
  currentJob: {
    company: String,
    position: String
  },
  mentorInterest: Boolean,
  profileLink: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.methods.generateResetToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return token;
};

module.exports = mongoose.model('User', userSchema);

