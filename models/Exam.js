const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true
  },
  className: {
    type: String,
    required: [true, 'Class name is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  examDate: {
    type: Date,
    required: [true, 'Exam date/schedule is required']
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Exam duration in minutes is required'],
    default: 60
  },
  questions: [{
    questionText: {
      type: String,
      required: [true, 'Question content is required']
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: [options => options.length >= 2, 'At least 2 options are required']
    },
    correctOptionIndex: {
      type: Number,
      required: [true, 'Correct option index is required'],
      min: 0
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
