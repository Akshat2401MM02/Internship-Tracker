const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role/position is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Wishlist', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    mode: {
      type: String,
      enum: ['Remote', 'Onsite', 'Hybrid'],
      default: 'Onsite',
    },
    stipend: {
      type: String,
      trim: true,
      default: '',
    },
    jobLink: {
      type: String,
      trim: true,
      default: '',
    },
    contactPerson: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

internshipSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Internship', internshipSchema);
