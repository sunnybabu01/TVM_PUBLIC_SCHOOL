const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
    default: Date.now
  },
  image: {
    type: String,
    default: '/uploads/default-event.jpg'
  },
  category: {
    type: String,
    enum: ['Academic', 'Sports', 'Cultural', 'Science Exhibition', 'Holiday', 'Gallery Only'],
    default: 'Academic'
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
