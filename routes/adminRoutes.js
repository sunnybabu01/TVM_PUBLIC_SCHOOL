const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isRole } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Shield all admin routes with authentication and role-check
router.use(isAuthenticated, isRole(['admin']));

// Profile Settings
router.get('/profile', adminController.getProfile);
router.post('/profile/update', (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      req.flash('error_msg', err.message);
      return res.redirect('/admin/profile');
    }
    next();
  });
}, adminController.postUpdateProfile);

// Dashboards
router.get('/dashboard', adminController.getDashboard);

// Students CRUD
router.get('/students', adminController.getStudents);
router.post('/students/add', (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      req.flash('error_msg', err.message);
      return res.redirect('/admin/students');
    }
    next();
  });
}, adminController.postAddStudent);
router.post('/students/edit/:id', (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      req.flash('error_msg', err.message);
      return res.redirect('/admin/students');
    }
    next();
  });
}, adminController.postEditStudent);
router.post('/students/delete/:id', adminController.postDeleteStudent);

// Teachers CRUD
router.get('/teachers', adminController.getTeachers);
router.post('/teachers/add', adminController.postAddTeacher);
router.post('/teachers/edit/:id', adminController.postEditTeacher);
router.post('/teachers/delete/:id', adminController.postDeleteTeacher);

// Attendance Reports
router.get('/attendance', adminController.getAttendance);

// Fees Management
router.get('/fees', adminController.getFees);
router.post('/fees/create', adminController.postCreateFee);
router.post('/fees/pay-offline', adminController.postRecordOfflinePayment);

// Library Management
router.get('/library', adminController.getLibrary);
router.post('/library/add', adminController.postAddBook);
router.post('/library/issue', adminController.postIssueBook);
router.post('/library/return', adminController.postReturnBook);

// Inventory Management
router.get('/inventory', adminController.getInventory);
router.post('/inventory/add', adminController.postAddInventory);

// Notification System
router.get('/notifications', adminController.getNotifications);
router.post('/notifications/create', adminController.postCreateNotification);

// Topper Management System
router.get('/toppers', adminController.getToppers);
router.post('/toppers/add', (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      req.flash('error_msg', err.message);
      return res.redirect('/admin/toppers');
    }
    next();
  });
}, adminController.postAddTopper);
router.post('/toppers/edit/:id', (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      req.flash('error_msg', err.message);
      return res.redirect('/admin/toppers');
    }
    next();
  });
}, adminController.postEditTopper);
router.post('/toppers/delete/:id', adminController.postDeleteTopper);

module.exports = router;
