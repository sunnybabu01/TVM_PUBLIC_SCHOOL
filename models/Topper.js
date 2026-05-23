const mongoose = require('mongoose');

const topperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Topper student name is required'],
    trim: true
  },
  className: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  marks: {
    type: String,
    required: [true, 'Marks/Percentage is required'],
    trim: true
  },
  photo: {
    type: String,
    required: [true, 'Topper profile photo is required']
  },
  testimonial: {
    type: String,
    required: [true, 'Student testimonial details are required'],
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Topper', topperSchema);
