const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { isAuthenticated, isRole } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Shield all routes under teacher panel
router.use(isAuthenticated, isRole(['teacher']));

// Profile Settings
router.get('/profile', teacherController.getProfile);
router.post('/profile/update', (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      req.flash('error_msg', err.message);
      return res.redirect('/teacher/profile');
    }
    next();
  });
}, teacherController.postUpdateProfile);

router.get('/dashboard', teacherController.getDashboard);

// Attendance routes
router.get('/attendance', teacherController.getAttendance);
router.post('/attendance/mark', teacherController.postMarkAttendance);

// Exam schedules
router.get('/exams', teacherController.getExams);
router.post('/exams/create', teacherController.postCreateExam);

// Grade management
router.get('/marks', teacherController.getMarks);
router.post('/marks/upload', teacherController.postUploadMarks);

// Homework distribution
router.get('/homework', teacherController.getHomework);
router.post('/homework/upload', teacherController.postUploadHomework);

module.exports = router;
