const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Book author is required'],
    trim: true
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  quantity: {
    type: Number,
    required: [true, 'Total books quantity is required'],
    min: 0
  },
  available: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: 0
  },
  issues: [{
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: { type: String, enum: ['issued', 'returned'], default: 'issued' },
    fineAmount: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Library', librarySchema);
