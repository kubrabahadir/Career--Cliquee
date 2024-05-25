const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  bio: {
    type: String,
    default: ''
  },
  profilePicture: {
    type: String,
    default: 'default-profile.png'
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: String
  },
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number
  }],
  workExperience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  skills: [String],
  languages: [{
    language: String,
    proficiency: String // Beginner, Intermediate, Advanced
  }],
  certifications: [{
    name: String,
    issuingOrganization: String,
    date: Date
  }],
  graduated: {
    type: Boolean,
    default: false
  },
  currentlyWorking: {
    type: Boolean,
    default: false
  },
  currentJob: {
    company: String,
    position: String
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
