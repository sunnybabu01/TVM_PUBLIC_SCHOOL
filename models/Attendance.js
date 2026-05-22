const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Attendance date is required'],
    default: () => new Date().setHours(0,0,0,0) // Normalize to midnight
  },
  userRole: {
    type: String,
    enum: ['student', 'teacher'],
    required: [true, 'User role is required']
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'] // refers to studentId or teacherId
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: [true, 'Attendance status is required']
  },
  markedBy: {
    type: String,
    required: [true, 'Marked-by user ID is required']
  }
}, { timestamps: true });

// Create composite index for querying efficiency and unique checking
attendanceSchema.index({ date: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
