const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Notification content is required'],
    trim: true
  },
  targetRole: {
    type: String,
    enum: ['all', 'student', 'teacher', 'admin'],
    default: 'all'
  },
  createdBy: {
    type: String,
    required: [true, 'Creator identifier is required']
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
