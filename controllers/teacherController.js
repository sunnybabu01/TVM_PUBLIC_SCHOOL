const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Notification = require('../models/Notification');
const { calculateGrade } = require('../utils/helpers');

/**
 * Render Teacher Dashboard with recent statistics and announcements
 */
const getDashboard = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ teacherId: req.session.user.id });
    if (!teacher) {
      req.flash('error_msg', 'Teacher profile not found.');
      return res.redirect('/login');
    }

    // Dynamic stats
    const studentCount = await Student.countDocuments({ status: 'active' });
    const examsCount = await Exam.countDocuments({ subject: teacher.subject });
    const announcements = await Notification.find({ targetRole: { $in: ['all', 'teacher'] } })
      .sort({ createdAt: -1 })
      .limit(5);

    const upcomingExams = await Exam.find({ subject: teacher.subject, examDate: { $gte: new Date() } })
      .sort({ examDate: 1 });

    res.render('teacher/dashboard', {
      title: 'Teacher Dashboard | TVM ERP',
      user: req.session.user,
      teacher,
      stats: {
        students: studentCount,
        exams: examsCount
      },
      announcements,
      upcomingExams
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ATTENDANCE MARKING
 */
const getAttendance = async (req, res, next) => {
  const { className, section, date } = req.query;
  const todayStr = date || new Date().toISOString().split('T')[0];

  try {
    let students = [];
    let markedRecords = [];

    if (className && section) {
      students = await Student.find({ className, section, status: 'active' }).sort({ rollNumber: 1 });
      
      const searchDate = new Date(todayStr);
      searchDate.setHours(0,0,0,0);

      markedRecords = await Attendance.find({
        date: searchDate,
        userRole: 'student',
        userId: { $in: students.map(s => s.studentId) }
      });
    }

    // Map existing attendance status to student objects
    const studentsWithAttendance = students.map(student => {
      const record = markedRecords.find(r => r.userId === student.studentId);
      return {
        ...student.toObject(),
        attendanceStatus: record ? record.status : 'present' // default to present
      };
    });

    res.render('teacher/attendance', {
      title: 'Mark Attendance | TVM ERP',
      user: req.session.user,
      className: className || '',
      section: section || '',
      date: todayStr,
      students: studentsWithAttendance
    });
  } catch (error) {
    next(error);
  }
};

const postMarkAttendance = async (req, res, next) => {
  const { className, section, date, attendance } = req.body; // attendance is { studentId: status }
  const searchDate = new Date(date);
  searchDate.setHours(0,0,0,0);

  try {
    if (!attendance || Object.keys(attendance).length === 0) {
      req.flash('error_msg', 'No attendance data submitted.');
      return res.redirect(`/teacher/attendance?className=${className}&section=${section}&date=${date}`);
    }

    const attendancePromises = Object.keys(attendance).map(studentId => {
      const status = attendance[studentId];
      return Attendance.findOneAndUpdate(
        { date: searchDate, userId: studentId },
        {
          date: searchDate,
          userRole: 'student',
          userId: studentId,
          status,
          markedBy: req.session.user.id
        },
        { upsert: true, new: true, runValidators: true }
      );
    });

    await Promise.all(attendancePromises);

    req.flash('success_msg', 'Attendance successfully updated in database.');
    res.redirect(`/teacher/attendance?className=${className}&section=${section}&date=${date}`);
  } catch (error) {
    req.flash('error_msg', 'Error updating attendance: ' + error.message);
    res.redirect(`/teacher/attendance?className=${className}&section=${section}&date=${date}`);
  }
};

/**
 * EXAM & QUIZ MANAGEMENT
 */
const getExams = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ teacherId: req.session.user.id });
    const exams = await Exam.find({ subject: teacher.subject }).sort({ examDate: -1 });

    res.render('teacher/exams', {
      title: 'Online Exams & Quizzes | TVM ERP',
      user: req.session.user,
      subject: teacher.subject,
      exams
    });
  } catch (error) {
    next(error);
  }
};

const postCreateExam = async (req, res, next) => {
  const { title, className, subject, examDate, durationMinutes, questions } = req.body;

  try {
    // Process submitted questions JSON structure
    // questions is an array of objects: { questionText, options: [str], correctOptionIndex }
    const parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;

    if (!parsedQuestions || parsedQuestions.length === 0) {
      req.flash('error_msg', 'An exam must have at least one question.');
      return res.redirect('/teacher/exams');
    }

    const newExam = new Exam({
      title,
      className,
      subject,
      examDate: new Date(examDate),
      durationMinutes: parseInt(durationMinutes) || 60,
      questions: parsedQuestions
    });

    await newExam.save();
    req.flash('success_msg', `Online Quiz / Exam '${title}' created successfully.`);
    res.redirect('/teacher/exams');
  } catch (error) {
    req.flash('error_msg', 'Error scheduling exam: ' + error.message);
    res.redirect('/teacher/exams');
  }
};

/**
 * GRADING & RESULT RECORDS MANAGEMENT
 */
const getMarks = async (req, res, next) => {
  const { examId } = req.query;

  try {
    const teacher = await Teacher.findOne({ teacherId: req.session.user.id });
    const exams = await Exam.find({ subject: teacher.subject }).sort({ examDate: -1 });

    let selectedExam = null;
    let students = [];
    let gradedResults = [];

    if (examId) {
      selectedExam = await Exam.findById(examId);
      if (selectedExam) {
        students = await Student.find({ className: selectedExam.className, status: 'active' }).sort({ rollNumber: 1 });
        gradedResults = await Result.find({ examId: selectedExam._id });
      }
    }

    // Map existing results to students
    const studentsWithGrades = students.map(student => {
      const result = gradedResults.find(r => r.studentId === student.studentId);
      return {
        ...student.toObject(),
        marksObtained: result ? result.marksObtained : '',
        totalMarks: result ? result.totalMarks : 100, // default total
        remarks: result ? result.remarks : ''
      };
    });

    res.render('teacher/marks', {
      title: 'Upload Results & Grades | TVM ERP',
      user: req.session.user,
      exams,
      selectedExam,
      students: studentsWithGrades
    });
  } catch (error) {
    next(error);
  }
};

const postUploadMarks = async (req, res, next) => {
  const { examId, results } = req.body; // results is an array of objects: { studentId, marksObtained, totalMarks, remarks }

  try {
    const exam = await Exam.findById(examId);
    if (!exam) {
      req.flash('error_msg', 'Selected exam does not exist.');
      return res.redirect('/teacher/marks');
    }

    const parsedResults = typeof results === 'string' ? JSON.parse(results) : results;

    const resultPromises = parsedResults.map(item => {
      const score = parseFloat(item.marksObtained);
      const total = parseFloat(item.totalMarks) || 100;
      
      // Calculate grade using helper
      const gradeResult = calculateGrade(score, total);

      return Result.findOneAndUpdate(
        { studentId: item.studentId, examId: exam._id },
        {
          studentId: item.studentId,
          examId: exam._id,
          subject: exam.subject,
          marksObtained: score,
          totalMarks: total,
          grade: gradeResult.grade,
          remarks: item.remarks || gradeResult.remarks
        },
        { upsert: true, new: true, runValidators: true }
      );
    });

    await Promise.all(resultPromises);

    req.flash('success_msg', 'Student exam grades uploaded and computed successfully.');
    res.redirect(`/teacher/marks?examId=${examId}`);
  } catch (error) {
    req.flash('error_msg', 'Failed to upload grades: ' + error.message);
    res.redirect('/teacher/marks');
  }
};

/**
 * HOMEWORK & MATERIAL MANAGEMENT
 */
const getHomework = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ teacherId: req.session.user.id });
    // Fetch notifications targeting specific classes that function as homework/syllabus updates
    const homeworkPosts = await Notification.find({
      createdBy: `Prof. ${teacher.name}`,
      title: { $regex: /Homework|Assignment|Study Material/i }
    }).sort({ createdAt: -1 });

    res.render('teacher/homework', {
      title: 'Upload Homework | TVM ERP',
      user: req.session.user,
      homeworkPosts,
      subject: teacher.subject
    });
  } catch (error) {
    next(error);
  }
};

const postUploadHomework = async (req, res, next) => {
  const { title, content, targetClass } = req.body;

  try {
    const teacher = await Teacher.findOne({ teacherId: req.session.user.id });
    
    // Create an announcement entry that serves as the homework record
    const homeworkNotice = new Notification({
      title: `[Homework] ${title} (${teacher.subject})`,
      content: `Target Class: ${targetClass}\n\nDescription: ${content}`,
      targetRole: 'student',
      createdBy: `Prof. ${teacher.name}`
    });

    await homeworkNotice.save();
    req.flash('success_msg', `Homework successfully assigned to students of Class: ${targetClass}`);
    res.redirect('/teacher/homework');
  } catch (error) {
    req.flash('error_msg', error.message);
    res.redirect('/teacher/homework');
  }
};

/**
 * Render Teacher Profile Page
 */
const getProfile = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.session.user._id);
    if (!teacher) {
      req.flash('error_msg', 'Teacher profile not found.');
      return res.redirect('/teacher/dashboard');
    }
    res.render('teacher/profile', {
      title: 'My Profile | TVM ERP',
      user: req.session.user,
      teacher
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Teacher Profile Details and Photo Update
 */
const postUpdateProfile = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.session.user._id);
    if (!teacher) {
      req.flash('error_msg', 'Teacher account not found.');
      return res.redirect('/teacher/dashboard');
    }

    const { name, email, phone, password, confirmPassword } = req.body;

    // Validate email uniqueness if changed
    if (email && email.toLowerCase() !== teacher.email.toLowerCase()) {
      const emailExists = await Teacher.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        req.flash('error_msg', 'Email is already taken by another teacher account.');
        return res.redirect('/teacher/profile');
      }
      teacher.email = email.toLowerCase();
    }

    if (name) teacher.name = name;
    if (phone) teacher.phone = phone;

    // Handle Password Update if requested
    if (password && password.trim() !== '') {
      if (password !== confirmPassword) {
        req.flash('error_msg', 'Passwords do not match.');
        return res.redirect('/teacher/profile');
      }
      teacher.password = password;
    }

    // Handle Photo Upload
    if (req.file) {
      teacher.photo = '/uploads/profiles/' + req.file.filename;
    }

    await teacher.save();

    // Sync session user
    req.session.user.name = teacher.name;
    req.session.user.email = teacher.email;
    req.session.user.photo = teacher.photo;

    req.flash('success_msg', 'Teacher profile updated successfully.');
    res.redirect('/teacher/profile');
  } catch (error) {
    req.flash('error_msg', 'Failed to update profile: ' + error.message);
    res.redirect('/teacher/profile');
  }
};

module.exports = {
  getDashboard,
  getAttendance,
  postMarkAttendance,
  getExams,
  postCreateExam,
  getMarks,
  postUploadMarks,
  getHomework,
  postUploadHomework,
  getProfile,
  postUpdateProfile
};
