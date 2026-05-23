const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Topper = require('../models/Topper');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Library = require('../models/Library');
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');
const Event = require('../models/Event');
const { sendEmail } = require('../config/nodemailer');

/**
 * Helper to generate sequential IDs (STDYYYYNNNN)
 */
const generateStudentId = async () => {
  const year = new Date().getFullYear();
  const count = await Student.countDocuments();
  const nextSeq = (count + 1).toString().padStart(4, '0');
  return `STD${year}${nextSeq}`;
};

/**
 * Helper to generate sequential Teacher IDs (TCHYYYYNNNN)
 */
const generateTeacherId = async () => {
  const year = new Date().getFullYear();
  const count = await Teacher.countDocuments();
  const nextSeq = (count + 1).toString().padStart(4, '0');
  return `TCH${year}${nextSeq}`;
};

/**
 * Render Admin Main Dashboard with Charts and Analytics Data
 */
const getDashboard = async (req, res, next) => {
  try {
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const booksCount = await Library.countDocuments();
    const toppersCount = await Topper.countDocuments();
    
    // Sum paid fee invoices
    const paidFeesResult = await Fee.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCollectedFees = paidFeesResult.length > 0 ? paidFeesResult[0].total : 0;

    // Monthly Fee Collection (Chart data - last 6 months)
    const monthlyFeeData = await Fee.aggregate([
      { $match: { status: 'paid', paidAt: { $ne: null } } },
      {
        $group: {
          _id: { $month: '$paidAt' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartLabels = [];
    const chartData = [];

    monthlyFeeData.forEach(item => {
      chartLabels.push(monthNames[item._id - 1] || 'Month');
      chartData.push(item.total);
    });

    // Recent items
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5);
    const recentNotifications = await Notification.find().sort({ createdAt: -1 }).limit(5);
    const recentToppers = await Topper.find().sort({ createdAt: -1 }).limit(3);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard | TVM ERP',
      user: req.session.user,
      stats: {
        students: studentCount,
        teachers: teacherCount,
        books: booksCount,
        fees: totalCollectedFees,
        toppers: toppersCount
      },
      chart: {
        labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
        data: chartData.length > 0 ? chartData : [0]
      },
      recentStudents,
      recentNotifications,
      recentToppers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * STUDENT MANAGEMENT
 */
const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().sort({ studentId: 1 });
    res.render('admin/students', {
      title: 'Manage Students | TVM ERP',
      user: req.session.user,
      students
    });
  } catch (error) {
    next(error);
  }
};

const postAddStudent = async (req, res, next) => {
  const { name, email, className, section, rollNumber, fatherName, password } = req.body;

  try {
    const studentId = await generateStudentId();
    const defaultPassword = password || 'student123'; // Seed default password

    let photo = '/uploads/default-avatar.png';
    if (req.file) {
      photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const newStudent = new Student({
      studentId,
      password: defaultPassword,
      email: email ? email.toLowerCase() : '',
      name,
      className,
      section,
      rollNumber: rollNumber ? parseInt(rollNumber) : undefined,
      fatherName,
      photo
    });

    await newStudent.save();

    // Send credentials to student
    try {
      await sendEmail({
        to: newStudent.email,
        subject: 'Welcome to TVM Public School ERP Portal',
        html: `
          <h3>Welcome ${name}!</h3>
          <p>Your student profile has been registered in the ERP portal. Use the credentials below to log in:</p>
          <p><strong>URL:</strong> http://localhost:3000/login</p>
          <p><strong>Student ID:</strong> ${studentId}</p>
          <p><strong>Password:</strong> ${defaultPassword}</p>
          <p>Upon logging in, you will receive an OTP code on this email address to secure your session.</p>
        `
      });
    } catch (e) {
      console.warn('Could not send registration email:', e.message);
    }

    req.flash('success_msg', `Student ${name} successfully registered with ID: ${studentId}`);
    res.redirect('/admin/students');
  } catch (error) {
    req.flash('error_msg', error.message.includes('duplicate') ? 'Email or Student ID already exists.' : error.message);
    res.redirect('/admin/students');
  }
};

const postEditStudent = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, className, section, rollNumber, fatherName, status } = req.body;

  try {
    const updateData = {
      name,
      email: email ? email.toLowerCase() : '',
      className,
      section,
      rollNumber: rollNumber ? parseInt(rollNumber) : undefined,
      fatherName,
      status
    };

    if (req.file) {
      updateData.photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    await Student.findByIdAndUpdate(id, updateData, { runValidators: true });

    req.flash('success_msg', 'Student records updated successfully.');
    res.redirect('/admin/students');
  } catch (error) {
    req.flash('error_msg', error.message);
    res.redirect('/admin/students');
  }
};

const postDeleteStudent = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Student.findByIdAndDelete(id);
    req.flash('success_msg', 'Student deleted successfully from ERP.');
    res.redirect('/admin/students');
  } catch (error) {
    next(error);
  }
};

/**
 * TEACHER MANAGEMENT
 */
const getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().sort({ teacherId: 1 });
    res.render('admin/teachers', {
      title: 'Manage Teachers | TVM ERP',
      user: req.session.user,
      teachers
    });
  } catch (error) {
    next(error);
  }
};

const postAddTeacher = async (req, res, next) => {
  const { name, email, subject, phone, password } = req.body;

  try {
    const teacherId = await generateTeacherId();
    const defaultPassword = password || 'teacher123';

    const newTeacher = new Teacher({
      teacherId,
      password: defaultPassword,
      email: email ? email.toLowerCase() : '',
      name,
      subject,
      phone
    });

    await newTeacher.save();

    // Send credentials
    try {
      await sendEmail({
        to: newTeacher.email,
        subject: 'Faculty Account Provisioned | TVM ERP',
        html: `
          <h3>Welcome Prof. ${name}!</h3>
          <p>Your faculty profile has been provisioned in our school ERP. Log in using the following details:</p>
          <p><strong>URL:</strong> http://localhost:3000/login</p>
          <p><strong>Teacher ID:</strong> ${teacherId}</p>
          <p><strong>Temporary Password:</strong> ${defaultPassword}</p>
        `
      });
    } catch (e) {
      console.warn('Could not send registration email:', e.message);
    }

    req.flash('success_msg', `Faculty ${name} registered successfully with ID: ${teacherId}`);
    res.redirect('/admin/teachers');
  } catch (error) {
    req.flash('error_msg', error.message.includes('duplicate') ? 'Email or Teacher ID already exists.' : error.message);
    res.redirect('/admin/teachers');
  }
};

const postEditTeacher = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, subject, phone } = req.body;

  try {
    await Teacher.findByIdAndUpdate(id, {
      name,
      email: email ? email.toLowerCase() : '',
      subject,
      phone
    }, { runValidators: true });

    req.flash('success_msg', 'Faculty records updated successfully.');
    res.redirect('/admin/teachers');
  } catch (error) {
    req.flash('error_msg', error.message);
    res.redirect('/admin/teachers');
  }
};

const postDeleteTeacher = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Teacher.findByIdAndDelete(id);
    req.flash('success_msg', 'Teacher record removed successfully.');
    res.redirect('/admin/teachers');
  } catch (error) {
    next(error);
  }
};

/**
 * ATTENDANCE MANAGEMENT
 */
const getAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find().sort({ date: -1 });
    res.render('admin/attendance', {
      title: 'Attendance Reports | TVM ERP',
      user: req.session.user,
      records
    });
  } catch (error) {
    next(error);
  }
};

/**
 * FEES MANAGEMENT
 */
const getFees = async (req, res, next) => {
  try {
    const invoices = await Fee.find().sort({ createdAt: -1 });
    const students = await Student.find({}, 'studentId name className');

    res.render('admin/fees', {
      title: 'Fee Invoicing & Payments | TVM ERP',
      user: req.session.user,
      invoices,
      students
    });
  } catch (error) {
    next(error);
  }
};

const postCreateFee = async (req, res, next) => {
  const { type, studentId, className, title, amount, dueDate } = req.body;

  try {
    if (type === 'individual') {
      const student = await Student.findOne({ studentId });
      if (!student) {
        req.flash('error_msg', `Student with ID ${studentId} not found.`);
        return res.redirect('/admin/fees');
      }

      const newInvoice = new Fee({
        studentId,
        title,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate)
      });
      await newInvoice.save();
      req.flash('success_msg', `Fee invoice created for student ${student.name}`);
    } else if (type === 'class') {
      const students = await Student.find({ className });
      if (students.length === 0) {
        req.flash('error_msg', `No students found in Class: ${className}`);
        return res.redirect('/admin/fees');
      }

      const invoicePromises = students.map(student => {
        return new Fee({
          studentId: student.studentId,
          title,
          amount: parseFloat(amount),
          dueDate: new Date(dueDate)
        }).save();
      });

      await Promise.all(invoicePromises);
      req.flash('success_msg', `Successfully batch-created ${students.length} invoices for Class: ${className}`);
    }

    res.redirect('/admin/fees');
  } catch (error) {
    req.flash('error_msg', error.message);
    res.redirect('/admin/fees');
  }
};

const postRecordOfflinePayment = async (req, res, next) => {
  const { invoiceId } = req.body;

  try {
    const invoice = await Fee.findById(invoiceId);
    if (!invoice) {
      req.flash('error_msg', 'Invoice not found.');
      return res.redirect('/admin/fees');
    }

    invoice.status = 'paid';
    invoice.paymentMethod = 'Offline';
    invoice.paidAt = new Date();
    invoice.paymentId = `CASH-REC-${Math.floor(100000 + Math.random() * 900000)}`;
    await invoice.save();

    req.flash('success_msg', `Payment successfully recorded offline for Student: ${invoice.studentId}`);
    res.redirect('/admin/fees');
  } catch (error) {
    next(error);
  }
};

/**
 * LIBRARY MANAGEMENT
 */
const getLibrary = async (req, res, next) => {
  try {
    const books = await Library.find().sort({ title: 1 });
    const students = await Student.find({}, 'studentId name');
    res.render('admin/library', {
      title: 'Library System | TVM ERP',
      user: req.session.user,
      books,
      students
    });
  } catch (error) {
    next(error);
  }
};

const postAddBook = async (req, res, next) => {
  const { title, author, isbn, category, quantity } = req.body;

  try {
    const qty = parseInt(quantity);
    const newBook = new Library({
      title,
      author,
      isbn,
      category,
      quantity: qty,
      available: qty
    });
    await newBook.save();
    req.flash('success_msg', `Book '${title}' added to the library catalogue.`);
    res.redirect('/admin/library');
  } catch (error) {
    req.flash('error_msg', error.message);
    res.redirect('/admin/library');
  }
};

const postIssueBook = async (req, res, next) => {
  const { bookId, studentId, dueDate } = req.body;

  try {
    const book = await Library.findById(bookId);
    const student = await Student.findOne({ studentId });

    if (!book) {
      req.flash('error_msg', 'Book not found.');
      return res.redirect('/admin/library');
    }
    if (!student) {
      req.flash('error_msg', 'Student ID does not exist.');
      return res.redirect('/admin/library');
    }

    if (book.available <= 0) {
      req.flash('error_msg', 'Book is currently out of stock.');
      return res.redirect('/admin/library');
    }

    // Book is available, proceed to checkout
    book.available -= 1;
    book.issues.push({
      studentId: student.studentId,
      studentName: student.name,
      dueDate: new Date(dueDate),
      status: 'issued'
    });

    await book.save();
    req.flash('success_msg', `Book '${book.title}' issued to student ${student.name}`);
    res.redirect('/admin/library');
  } catch (error) {
    next(error);
  }
};

const postReturnBook = async (req, res, next) => {
  const { bookId, issueId, fineAmount } = req.body;

  try {
    const book = await Library.findById(bookId);
    if (!book) {
      req.flash('error_msg', 'Book record not found.');
      return res.redirect('/admin/library');
    }

    const issueRecord = book.issues.id(issueId);
    if (!issueRecord) {
      req.flash('error_msg', 'Checkout record not found.');
      return res.redirect('/admin/library');
    }

    // Process return
    book.available += 1;
    issueRecord.status = 'returned';
    issueRecord.returnDate = new Date();
    issueRecord.fineAmount = parseFloat(fineAmount) || 0;

    await book.save();
    req.flash('success_msg', `Book returned successfully. Outstanding fine: ₹${issueRecord.fineAmount}`);
    res.redirect('/admin/library');
  } catch (error) {
    next(error);
  }
};

/**
 * INVENTORY MANAGEMENT
 */
const getInventory = async (req, res, next) => {
  try {
    const items = await Inventory.find().sort({ category: 1, itemName: 1 });
    res.render('admin/inventory', {
      title: 'Inventory & Assets | TVM ERP',
      user: req.session.user,
      items
    });
  } catch (error) {
    next(error);
  }
};

const postAddInventory = async (req, res, next) => {
  const { itemName, category, quantity, condition, roomNo } = req.body;

  try {
    const newItem = new Inventory({
      itemName,
      category,
      quantity: parseInt(quantity),
      condition,
      roomNo,
      lastUpdatedBy: req.session.user.id
    });
    await newItem.save();

    req.flash('success_msg', `Inventory item '${itemName}' added successfully.`);
    res.redirect('/admin/inventory');
  } catch (error) {
    req.flash('error_msg', error.message);
    res.redirect('/admin/inventory');
  }
};

/**
 * SYSTEM NOTIFICATION & ANNOUNCEMENT MANAGEMENT
 */
const getNotifications = async (req, res, next) => {
  try {
    const notices = await Notification.find().sort({ createdAt: -1 });
    res.render('admin/notifications', {
      title: 'Announcements Center | TVM ERP',
      user: req.session.user,
      notices
    });
  } catch (error) {
    next(error);
  }
};

const postCreateNotification = async (req, res, next) => {
  const { title, content, targetRole } = req.body;

  try {
    const notice = new Notification({
      title,
      content,
      targetRole,
      createdBy: 'Administration'
    });
    await notice.save();

    req.flash('success_msg', 'Announcement posted successfully.');
    res.redirect('/admin/notifications');
  } catch (error) {
    req.flash('error_msg', error.message);
    res.redirect('/admin/notifications');
  }
};

/**
 * Render Admin Profile Page
 */
const getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.session.user._id);
    if (!admin) {
      req.flash('error_msg', 'Admin profile not found.');
      return res.redirect('/admin/dashboard');
    }
    res.render('admin/profile', {
      title: 'My Profile | TVM ERP',
      user: req.session.user,
      admin
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Admin Profile Details and Photo Update
 */
const postUpdateProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.session.user._id);
    if (!admin) {
      req.flash('error_msg', 'Admin account not found.');
      return res.redirect('/admin/dashboard');
    }

    const { name, email, password, confirmPassword } = req.body;

    // Validate email uniqueness if changed
    if (email && email.toLowerCase() !== admin.email.toLowerCase()) {
      const emailExists = await Admin.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        req.flash('error_msg', 'Email is already taken by another admin account.');
        return res.redirect('/admin/profile');
      }
      admin.email = email.toLowerCase();
    }

    if (name) admin.name = name;

    // Handle Password Update if requested
    if (password && password.trim() !== '') {
      if (password !== confirmPassword) {
        req.flash('error_msg', 'Passwords do not match.');
        return res.redirect('/admin/profile');
      }
      admin.password = password;
    }

    // Handle Photo Upload
    if (req.file) {
      admin.photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    await admin.save();

    // Sync session user
    req.session.user.name = admin.name;
    req.session.user.email = admin.email;
    req.session.user.photo = admin.photo;

    req.flash('success_msg', 'Admin profile updated successfully.');
    res.redirect('/admin/profile');
  } catch (error) {
    req.flash('error_msg', 'Failed to update profile: ' + error.message);
    res.redirect('/admin/profile');
  }
};

/**
 * TOPPER MANAGEMENT
 */
const getToppers = async (req, res, next) => {
  try {
    const toppers = await Topper.find().sort({ createdAt: -1 });
    res.render('admin/toppers', {
      title: 'Manage Toppers | TVM ERP',
      user: req.session.user,
      toppers
    });
  } catch (error) {
    next(error);
  }
};

const postAddTopper = async (req, res, next) => {
  const { name, className, marks, testimonial } = req.body;

  if (!name || !className || !marks || !testimonial) {
    req.flash('error_msg', 'Please fill in all details for the academic topper.');
    return res.redirect('/admin/toppers');
  }

  if (!req.file) {
    req.flash('error_msg', 'Topper profile photo is required.');
    return res.redirect('/admin/toppers');
  }

  try {
    const base64Photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const newTopper = new Topper({
      name,
      className,
      marks,
      photo: base64Photo,
      testimonial
    });

    await newTopper.save();

    req.flash('success_msg', `Academic Topper ${name} registered successfully!`);
    res.redirect('/admin/toppers');
  } catch (error) {
    req.flash('error_msg', 'Failed to add topper: ' + error.message);
    res.redirect('/admin/toppers');
  }
};

const postEditTopper = async (req, res, next) => {
  const { id } = req.params;
  const { name, className, marks, testimonial, isFeatured } = req.body;

  try {
    const updateData = {
      name,
      className,
      marks,
      testimonial,
      isFeatured: isFeatured === 'true'
    };

    if (req.file) {
      updateData.photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    await Topper.findByIdAndUpdate(id, updateData, { runValidators: true });

    req.flash('success_msg', 'Topper record updated successfully.');
    res.redirect('/admin/toppers');
  } catch (error) {
    req.flash('error_msg', 'Failed to edit topper: ' + error.message);
    res.redirect('/admin/toppers');
  }
};

const postDeleteTopper = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Topper.findByIdAndDelete(id);
    req.flash('success_msg', 'Topper record removed from the portal.');
    res.redirect('/admin/toppers');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getStudents,
  postAddStudent,
  postEditStudent,
  postDeleteStudent,
  getTeachers,
  postAddTeacher,
  postEditTeacher,
  postDeleteTeacher,
  getAttendance,
  getFees,
  postCreateFee,
  postRecordOfflinePayment,
  getLibrary,
  postAddBook,
  postIssueBook,
  postReturnBook,
  getInventory,
  postAddInventory,
  getNotifications,
  postCreateNotification,
  getProfile,
  postUpdateProfile,
  getToppers,
  postAddTopper,
  postEditTopper,
  postDeleteTopper
};
