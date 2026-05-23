const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const { sendEmail } = require('../config/nodemailer');

/**
 * Generate cryptographically simple 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Render Shared Login Page
 */
const getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login | TVM Public School ERP',
    user: null
  });
};

/**
 * Handle Login Credentials Submission (Phase 1)
 */
const postLogin = async (req, res, next) => {
  const { userId, password, role } = req.body;

  if (!userId || !password || !role) {
    req.flash('error_msg', 'Please fill in all credentials.');
    return res.redirect('/login');
  }

  try {
    let userRecord = null;

    // 1. Locate user record in respective collection based on selected role
    if (role === 'admin') {
      // Admin can log in using either username or email
      userRecord = await Admin.findOne({
        $or: [{ username: userId }, { email: userId.toLowerCase() }]
      });
    } else if (role === 'teacher') {
      // Teacher can log in using teacherId or email
      userRecord = await Teacher.findOne({
        $or: [{ teacherId: userId }, { email: userId.toLowerCase() }]
      });
    } else if (role === 'student') {
      // Student can log in using studentId or email
      userRecord = await Student.findOne({
        $or: [{ studentId: userId }, { email: userId.toLowerCase() }]
      });
    }

    if (!userRecord) {
      req.flash('error_msg', 'Invalid User ID or role selected.');
      return res.redirect('/login');
    }

    // 2. Validate hashed password
    const isMatch = await userRecord.comparePassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid password.');
      return res.redirect('/login');
    }

    if (role === 'student' && userRecord.status === 'inactive') {
      req.flash('error_msg', 'Your account has been deactivated. Please contact administration.');
      return res.redirect('/login');
    }

    // 3. Password matched. Generate dynamic login OTP (Two-Factor Auth)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes TTL

    userRecord.otp = otp;
    userRecord.otpExpires = otpExpires;
    await userRecord.save();

    // 4. Send Email containing OTP
    const emailSubject = 'Your TVM ERP Login Verification Code';
    const emailBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4F46E5; margin-bottom: 20px;">TVM Public School ERP Portal</h2>
        <p>Dear ${userRecord.name || 'User'},</p>
        <p>You have requested login access to your school dashboard. Please use the verification code below to complete the authentication:</p>
        <div style="font-size: 24px; font-weight: bold; background-color: #F3F4F6; padding: 15px; border-radius: 6px; letter-spacing: 4px; text-align: center; margin: 20px 0; color: #111;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #666;">This code is private, valid for <strong>5 minutes</strong>, and can only be used once. If you did not trigger this login request, please change your password immediately.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 11px; color: #999; text-align: center;">TVM Public School, Patna &copy; 2026. All Rights Reserved.</p>
      </div>
    `;

    let smtpFailed = false;
    try {
      await sendEmail({
        to: userRecord.email,
        subject: emailSubject,
        html: emailBody,
        text: `Your TVM Public School ERP Login verification code is: ${otp}. It expires in 5 minutes.`
      });
    } catch (emailError) {
      console.warn('[Email Service Failsafe] SMTP delivery failed. Login code will be shown on UI.', emailError.message);
      smtpFailed = true;
    }

    // 5. Save intermediate credentials to a temporary session structure
    req.session.tempUser = {
      dbId: userRecord._id,
      userId: role === 'admin' ? userRecord.username : (role === 'teacher' ? userRecord.teacherId : userRecord.studentId),
      role: role,
      email: userRecord.email,
      smtpFailed: smtpFailed
    };

    if (smtpFailed) {
      req.flash('success_msg', 'Verification OTP generated (SMTP delivery failed, local debug code is shown).');
    } else {
      req.flash('success_msg', 'Verification OTP sent to your registered email.');
    }
    res.redirect('/verify-otp');

  } catch (error) {
    next(error);
  }
};

/**
 * Render OTP Verification Screen
 */
const getVerifyOtp = async (req, res, next) => {
  if (!req.session.tempUser) {
    req.flash('error_msg', 'Session expired. Please log in again.');
    return res.redirect('/login');
  }

  try {
    const { dbId, role, smtpFailed } = req.session.tempUser;
    let userRecord = null;
    if (role === 'admin') userRecord = await Admin.findById(dbId);
    else if (role === 'teacher') userRecord = await Teacher.findById(dbId);
    else if (role === 'student') userRecord = await Student.findById(dbId);

    // If SMTP_USER is not configured or SMTP failed, we expose the OTP on the UI.
    const isSmtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    const debugOtp = ((!isSmtpConfigured || smtpFailed) && userRecord) ? userRecord.otp : null;

    res.render('auth/verify-otp', {
      title: 'Verify OTP | TVM Public School ERP',
      tempUser: req.session.tempUser,
      debugOtp,
      user: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Login OTP Verification (Phase 2)
 */
const postVerifyOtp = async (req, res, next) => {
  const { otp } = req.body;

  if (!req.session.tempUser) {
    req.flash('error_msg', 'Session expired. Please log in again.');
    return res.redirect('/login');
  }

  if (!otp) {
    req.flash('error_msg', 'Please input the 6-digit OTP code.');
    return res.redirect('/verify-otp');
  }

  const { dbId, role } = req.session.tempUser;

  try {
    let userRecord = null;

    if (role === 'admin') {
      userRecord = await Admin.findById(dbId);
    } else if (role === 'teacher') {
      userRecord = await Teacher.findById(dbId);
    } else if (role === 'student') {
      userRecord = await Student.findById(dbId);
    }

    if (!userRecord || !userRecord.otp || !userRecord.otpExpires) {
      req.flash('error_msg', 'Invalid authentication session.');
      return res.redirect('/login');
    }

    // Check expiration
    if (new Date() > userRecord.otpExpires) {
      req.flash('error_msg', 'OTP has expired. Please re-submit login.');
      return res.redirect('/login');
    }

    // Check code match
    if (userRecord.otp !== otp) {
      req.flash('error_msg', 'Incorrect OTP code. Please try again.');
      return res.redirect('/verify-otp');
    }

    // OTP matched! Reset database OTP fields
    userRecord.otp = null;
    userRecord.otpExpires = null;
    await userRecord.save();

    // Establish official session user object
    req.session.user = {
      _id: userRecord._id,
      id: role === 'admin' ? userRecord.username : (role === 'teacher' ? userRecord.teacherId : userRecord.studentId),
      name: userRecord.name,
      role: userRecord.role,
      email: userRecord.email,
      photo: userRecord.photo || '/uploads/default-avatar.png',
      className: userRecord.className || null,
      section: userRecord.section || null,
      rollNumber: userRecord.rollNumber || null
    };

    // Remove temp auth values
    delete req.session.tempUser;

    req.flash('success_msg', `Welcome back, ${userRecord.name}!`);

    // Dashboard redirection
    if (role === 'admin') return res.redirect('/admin/dashboard');
    if (role === 'teacher') return res.redirect('/teacher/dashboard');
    if (role === 'student') return res.redirect('/student/dashboard');

    res.redirect('/');

  } catch (error) {
    next(error);
  }
};

/**
 * Render Forgot Password Screen
 */
const getForgotPassword = (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password | TVM Public School ERP',
    user: null
  });
};

/**
 * Handle Forgot Password OTP Generation
 */
const postForgotPassword = async (req, res, next) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    req.flash('error_msg', 'Please provide your User ID/Email and Role.');
    return res.redirect('/forgot-password');
  }

  try {
    let userRecord = null;

    if (role === 'admin') {
      userRecord = await Admin.findOne({
        $or: [{ username: userId }, { email: userId.toLowerCase() }]
      });
    } else if (role === 'teacher') {
      userRecord = await Teacher.findOne({
        $or: [{ teacherId: userId }, { email: userId.toLowerCase() }]
      });
    } else if (role === 'student') {
      userRecord = await Student.findOne({
        $or: [{ studentId: userId }, { email: userId.toLowerCase() }]
      });
    }

    if (!userRecord) {
      req.flash('error_msg', 'No matching user found with the provided details.');
      return res.redirect('/forgot-password');
    }

    // User verified. Generate Recovery OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min TTL

    userRecord.otp = otp;
    userRecord.otpExpires = otpExpires;
    await userRecord.save();

    // Send reset code email
    const emailSubject = 'Password Recovery Request - TVM ERP';
    const emailBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #EF4444; margin-bottom: 20px;">TVM ERP Password Reset Request</h2>
        <p>Dear ${userRecord.name},</p>
        <p>We received a request to reset your school portal password. Use the following security verification code to set a new password:</p>
        <div style="font-size: 24px; font-weight: bold; background-color: #FEF2F2; padding: 15px; border-radius: 6px; letter-spacing: 4px; text-align: center; margin: 20px 0; color: #DC2626;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #666;">This code is valid for <strong>5 minutes</strong>. If you did not make this request, you can safely ignore this email; your current password remains secure.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 11px; color: #999; text-align: center;">TVM Public School, Patna &copy; 2026. All Rights Reserved.</p>
      </div>
    `;

    let smtpFailed = false;
    try {
      await sendEmail({
        to: userRecord.email,
        subject: emailSubject,
        html: emailBody,
        text: `Your TVM Public School ERP password recovery code is: ${otp}. It expires in 5 minutes.`
      });
      req.flash('success_msg', 'Password recovery code sent to your registered email.');
    } catch (emailError) {
      console.warn('[Email Service Failsafe] SMTP delivery failed. Recovery code will be shown on UI.', emailError.message);
      smtpFailed = true;
      req.session.smtpFailed = true;
      req.flash('success_msg', 'Verification session created (SMTP delivery failed, local debug code is shown).');
    }

    res.redirect(`/reset-password?userId=${encodeURIComponent(userId)}&role=${role}${smtpFailed ? '&smtpFailed=true' : ''}`);

  } catch (error) {
    next(error);
  }
};

/**
 * Render Reset Password Screen
 */
const getResetPassword = async (req, res, next) => {
  const { userId, role, smtpFailed: querySmtpFailed } = req.query;
  
  try {
    let debugOtp = null;
    const isSmtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    const smtpFailed = req.session.smtpFailed || querySmtpFailed === 'true';

    if ((!isSmtpConfigured || smtpFailed) && userId && role) {
      let userRecord = null;
      if (role === 'admin') {
        userRecord = await Admin.findOne({ $or: [{ username: userId }, { email: userId.toLowerCase() }] });
      } else if (role === 'teacher') {
        userRecord = await Teacher.findOne({ $or: [{ teacherId: userId }, { email: userId.toLowerCase() }] });
      } else if (role === 'student') {
        userRecord = await Student.findOne({ $or: [{ studentId: userId }, { email: userId.toLowerCase() }] });
      }
      if (userRecord) {
        debugOtp = userRecord.otp;
      }
    }

    // Clean up reset session variable
    delete req.session.smtpFailed;

    res.render('auth/reset-password', {
      title: 'Reset Password | TVM Public School ERP',
      userId: userId || '',
      role: role || 'student',
      debugOtp,
      user: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process Password Reset Submission
 */
const postResetPassword = async (req, res, next) => {
  const { userId, role, otp, newPassword, confirmPassword } = req.body;

  if (!userId || !role || !otp || !newPassword || !confirmPassword) {
    req.flash('error_msg', 'Please fill in all password fields and recovery OTP.');
    return res.redirect(`/reset-password?userId=${encodeURIComponent(userId)}&role=${role}`);
  }

  if (newPassword !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match.');
    return res.redirect(`/reset-password?userId=${encodeURIComponent(userId)}&role=${role}`);
  }

  try {
    let userRecord = null;

    if (role === 'admin') {
      userRecord = await Admin.findOne({
        $or: [{ username: userId }, { email: userId.toLowerCase() }]
      });
    } else if (role === 'teacher') {
      userRecord = await Teacher.findOne({
        $or: [{ teacherId: userId }, { email: userId.toLowerCase() }]
      });
    } else if (role === 'student') {
      userRecord = await Student.findOne({
        $or: [{ studentId: userId }, { email: userId.toLowerCase() }]
      });
    }

    if (!userRecord || !userRecord.otp || !userRecord.otpExpires) {
      req.flash('error_msg', 'No active reset session found.');
      return res.redirect('/forgot-password');
    }

    if (new Date() > userRecord.otpExpires) {
      req.flash('error_msg', 'Recovery OTP has expired. Please request a new code.');
      return res.redirect('/forgot-password');
    }

    if (userRecord.otp !== otp) {
      req.flash('error_msg', 'Incorrect recovery OTP code.');
      return res.redirect(`/reset-password?userId=${encodeURIComponent(userId)}&role=${role}`);
    }

    // Set new password (bcrypt pre-save hook will hash it)
    userRecord.password = newPassword;
    userRecord.otp = null;
    userRecord.otpExpires = null;
    await userRecord.save();

    req.flash('success_msg', 'Password reset successful! You can now log in with your new password.');
    res.redirect('/login');

  } catch (error) {
    next(error);
  }
};

/**
 * Terminate Session (Logout)
 */
const getLogout = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error during logout:', err);
      }
      res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
};

/**
 * Render Student Self-Registration Page
 */
const getRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Register | TVM Public School ERP',
    user: null
  });
};

/**
 * Handle Student Self-Registration Submission
 */
const postRegister = async (req, res, next) => {
  const { name, email, className, section, rollNumber, fatherName, password, confirmPassword } = req.body;

  if (!name || !email || !className || !section || !rollNumber || !fatherName || !password || !confirmPassword) {
    req.flash('error_msg', 'Please fill in all fields.');
    return res.redirect('/register');
  }

  if (password !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match.');
    return res.redirect('/register');
  }

  try {
    // Check if email already exists in Student collection
    const emailExists = await Student.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      req.flash('error_msg', 'An account with this email already exists.');
      return res.redirect('/register');
    }

    // Auto-generate next Student ID (STDYYYYNNNN)
    const year = new Date().getFullYear();
    const count = await Student.countDocuments();
    const nextSeq = (count + 1).toString().padStart(4, '0');
    const studentId = `STD${year}${nextSeq}`;

    // Create student (pre-save hook in Student.js handles bcrypt password hashing)
    const newStudent = new Student({
      studentId,
      password,
      email: email.toLowerCase(),
      name,
      className,
      section,
      rollNumber: parseInt(rollNumber),
      fatherName
    });

    await newStudent.save();

    // Send credentials email in background
    try {
      await sendEmail({
        to: newStudent.email,
        subject: 'Welcome to TVM Public School ERP Portal',
        html: `
          <h3>Welcome ${name}!</h3>
          <p>Your self-registration is successful! Here are your secured credentials to log in to our ERP Portal:</p>
          <p><strong>Login URL:</strong> http://localhost:3000/login</p>
          <p><strong>Student ID:</strong> ${studentId}</p>
          <p><strong>Password:</strong> The password you created during signup</p>
          <p>You can use these details to secure your session and start accessing features.</p>
        `
      });
    } catch (e) {
      console.warn('Could not send registration email:', e.message);
    }

    req.flash('success_msg', `Registration successful! Your generated Student ID is: ${studentId}. Please use it to log in.`);
    res.redirect('/login');

  } catch (error) {
    req.flash('error_msg', 'Registration failed: ' + error.message);
    res.redirect('/register');
  }
};

module.exports = {
  getLogin,
  postLogin,
  getVerifyOtp,
  postVerifyOtp,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
  getLogout,
  getRegister,
  postRegister
};
