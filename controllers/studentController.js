const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Fee = require('../models/Fee');
const Exam = require('../models/Exam');
const Notification = require('../models/Notification');
const { generateQRCode, formatDate } = require('../utils/helpers');

/**
 * Render Student Dashboard with stats, notifications, and fees outstanding
 */
const getDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ studentId: req.session.user.id });
    if (!student) {
      req.flash('error_msg', 'Student profile not found.');
      return res.redirect('/login');
    }

    // 1. Calculate Attendance Percentage
    const totalDays = await Attendance.countDocuments({ userId: student.studentId, userRole: 'student' });
    const presentDays = await Attendance.countDocuments({ userId: student.studentId, userRole: 'student', status: { $in: ['present', 'late'] } });
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '100.0';

    // 2. Fetch Fee summary
    const unpaidFeeCount = await Fee.countDocuments({ studentId: student.studentId, status: 'unpaid' });
    const paidFeesResult = await Fee.aggregate([
      { $match: { studentId: student.studentId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const paidAmount = paidFeesResult.length > 0 ? paidFeesResult[0].total : 0;

    // 3. Fetch notifications targeting all students or their specific class
    const notifications = await Notification.find({
      $or: [
        { targetRole: 'all' },
        { targetRole: 'student' }
      ]
    }).sort({ createdAt: -1 }).limit(5);

    res.render('student/dashboard', {
      title: 'Student Dashboard | TVM ERP',
      user: req.session.user,
      student,
      stats: {
        attendance: attendancePercentage,
        unpaidCount: unpaidFeeCount,
        paidFees: paidAmount
      },
      notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render Student Profile Page
 */
const getProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ studentId: req.session.user.id });
    res.render('student/profile', {
      title: 'My Profile | TVM ERP',
      user: req.session.user,
      student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render Student Attendance Report
 */
const getAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ userId: req.session.user.id, userRole: 'student' })
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;

    res.render('student/attendance', {
      title: 'My Attendance Reports | TVM ERP',
      user: req.session.user,
      records,
      stats: { total, present, absent, late }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * View Exam Results and Report Cards
 */
const getResults = async (req, res, next) => {
  try {
    const results = await Result.find({ studentId: req.session.user.id })
      .populate('examId')
      .sort({ createdAt: -1 });

    res.render('student/results', {
      title: 'My Examination Results | TVM ERP',
      user: req.session.user,
      results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate Printable ID Card with offline Base64 QR Code
 */
const getIdCard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ studentId: req.session.user.id });
    if (!student) {
      req.flash('error_msg', 'Student details missing.');
      return res.redirect('/student/dashboard');
    }

    // QR Data
    const qrText = `TVM PUBLIC SCHOOL\nID: ${student.studentId}\nName: ${student.name}\nClass: ${student.className}-${student.section}\nRoll: ${student.rollNumber}`;
    const qrCodeDataUrl = await generateQRCode(qrText);

    res.render('student/id-card', {
      title: 'Student ID Card | TVM Public School',
      user: req.session.user,
      student,
      qrCodeDataUrl
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate Printable Exam Admit Card with offline Base64 QR Code
 */
const getAdmitCard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ studentId: req.session.user.id });
    if (!student) {
      req.flash('error_msg', 'Student details missing.');
      return res.redirect('/student/dashboard');
    }

    // Fetch upcoming exams scheduled for their class
    const upcomingExams = await Exam.find({ className: student.className })
      .sort({ examDate: 1 });

    // Generate QR
    const qrText = `ADMIT CARD\nTVM Public School Patna\nID: ${student.studentId}\nName: ${student.name}\nClass: ${student.className}\nRoll: ${student.rollNumber}\nExams Checked: ${upcomingExams.length}`;
    const qrCodeDataUrl = await generateQRCode(qrText);

    res.render('student/admit-card', {
      title: 'Exam Admit Card | TVM Public School',
      user: req.session.user,
      student,
      exams: upcomingExams,
      qrCodeDataUrl,
      formatDate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render Class-specific Homework Lists
 */
const getHomework = async (req, res, next) => {
  try {
    const student = await Student.findOne({ studentId: req.session.user.id });
    
    // Homework postings are announcements that target 'student' and contain their className in the description/body text
    const homeworkPosts = await Notification.find({
      targetRole: 'student',
      content: { $regex: new RegExp('Target Class:\\s*' + student.className + '\\b', 'i') }
    }).sort({ createdAt: -1 });

    res.render('student/homework', {
      title: 'Homework & Study Material | TVM ERP',
      user: req.session.user,
      homeworkPosts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ONLINE FEES PAYMENT SECTION
 */
const getFeePayment = async (req, res, next) => {
  try {
    const invoices = await Fee.find({ studentId: req.session.user.id }).sort({ dueDate: 1 });
    res.render('student/fee-payment', {
      title: 'Fees Invoice & Payments | TVM ERP',
      user: req.session.user,
      invoices,
      formatDate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Simulated Payment Checkout Portal
 */
const getSimulatedCheckout = async (req, res, next) => {
  const { invoiceId } = req.params;

  try {
    const invoice = await Fee.findById(invoiceId);
    if (!invoice || invoice.studentId !== req.session.user.id) {
      req.flash('error_msg', 'Invoice not found or unauthorized.');
      return res.redirect('/student/fee-payment');
    }

    if (invoice.status === 'paid') {
      req.flash('error_msg', 'This invoice has already been paid.');
      return res.redirect('/student/fee-payment');
    }

    res.render('student/checkout-simulated', {
      title: 'Secure Checkout | TVM Public School',
      user: req.session.user,
      invoice,
      stripeKey: process.env.STRIPE_PUBLISHABLE_KEY || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete Simulated Payment Checkout
 */
const postSimulatedCheckout = async (req, res, next) => {
  const { invoiceId } = req.body;

  try {
    const invoice = await Fee.findById(invoiceId);
    if (!invoice || invoice.studentId !== req.session.user.id) {
      req.flash('error_msg', 'Invoice session invalid.');
      return res.redirect('/student/fee-payment');
    }

    // Complete transaction
    invoice.status = 'paid';
    invoice.paymentMethod = 'Stripe'; // Simulated online gateway
    invoice.paidAt = new Date();
    invoice.paymentId = `STR-SIM-${Math.floor(100000000 + Math.random() * 900000000)}`;
    await invoice.save();

    req.flash('success_msg', 'Fee payment successfully authorized! Receipt generated.');
    res.redirect('/student/fee-payment');
  } catch (error) {
    next(error);
  }
};

/**
 * View / Download Printable Fee Receipt
 */
const getFeeReceipt = async (req, res, next) => {
  const { invoiceId } = req.params;

  try {
    const invoice = await Fee.findById(invoiceId);
    const student = await Student.findOne({ studentId: req.session.user.id });

    if (!invoice || invoice.studentId !== req.session.user.id) {
      req.flash('error_msg', 'Receipt unauthorized or missing.');
      return res.redirect('/student/fee-payment');
    }

    if (invoice.status !== 'paid') {
      req.flash('error_msg', 'This invoice is unpaid. Payment is required to print receipt.');
      return res.redirect('/student/fee-payment');
    }

    // Generate verification QR
    const qrText = `RECEIPT VERIFIED\nTVM Public School Patna\nReceipt Ref: ${invoice.paymentId}\nStudent ID: ${invoice.studentId}\nAmount: ₹${invoice.amount}\nPaid via: ${invoice.paymentMethod}\nDate: ${invoice.paidAt}`;
    const qrCodeDataUrl = await generateQRCode(qrText);

    res.render('student/fee-receipt', {
      title: `Fee Receipt - ${invoice.paymentId} | TVM ERP`,
      user: req.session.user,
      student,
      invoice,
      qrCodeDataUrl,
      formatDate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Render Class notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const student = await Student.findOne({ studentId: req.session.user.id });
    const notices = await Notification.find({
      $or: [
        { targetRole: 'all' },
        { targetRole: 'student' }
      ]
    }).sort({ createdAt: -1 });

    res.render('student/notifications', {
      title: 'Alerts & Notifications | TVM ERP',
      user: req.session.user,
      notices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Student Profile Updates (Email, Password, Photo)
 */
const postUpdateProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.session.user._id);
    if (!student) {
      req.flash('error_msg', 'Student account not found.');
      return res.redirect('/student/dashboard');
    }

    const { email, password, confirmPassword } = req.body;

    // Validate email uniqueness if changed
    if (email && email.toLowerCase() !== student.email.toLowerCase()) {
      const emailExists = await Student.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        req.flash('error_msg', 'Email is already taken by another student account.');
        return res.redirect('/student/profile');
      }
      student.email = email.toLowerCase();
    }

    // Handle Password Update if requested
    if (password && password.trim() !== '') {
      if (password !== confirmPassword) {
        req.flash('error_msg', 'Passwords do not match.');
        return res.redirect('/student/profile');
      }
      student.password = password;
    }

    // Handle Photo Upload
    if (req.file) {
      student.photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    await student.save();

    // Sync session user
    req.session.user.email = student.email;
    req.session.user.photo = student.photo;

    req.flash('success_msg', 'Student profile updated successfully.');
    res.redirect('/student/profile');
  } catch (error) {
    req.flash('error_msg', 'Failed to update profile: ' + error.message);
    res.redirect('/student/profile');
  }
};

module.exports = {
  getDashboard,
  getProfile,
  getAttendance,
  getResults,
  getIdCard,
  getAdmitCard,
  getHomework,
  getFeePayment,
  getSimulatedCheckout,
  postSimulatedCheckout,
  getFeeReceipt,
  getNotifications,
  postUpdateProfile
};
