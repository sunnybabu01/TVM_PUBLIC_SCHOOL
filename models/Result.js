const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam reference is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true
  },
  marksObtained: {
    type: Number,
    required: [true, 'Marks obtained is required'],
    min: 0
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total possible marks is required'],
    min: 1
  },
  grade: {
    type: String,
    required: [true, 'Grade is required']
  },
  remarks: {
    type: String,
    default: 'Satisfactory'
  }
}, { timestamps: true });

// Compound index so a student gets only one record per exam
resultSchema.index({ studentId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
