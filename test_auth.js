const http = require('http');
const querystring = require('querystring');
const mongoose = require('mongoose');

const Admin = require('./models/Admin');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');

const PORT = 3000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/tvm_school_erp';

// Helper function to make request
function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = data ? querystring.stringify(data) : '';
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: path,
      method: method,
      headers: {
        ...headers
      }
    };

    if (data) {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(postData);
    }
    req.end();
  });
}

// Extract session cookies
function getSessionCookie(headers) {
  const setCookie = headers['set-cookie'];
  if (setCookie && setCookie.length > 0) {
    // Find connect.sid
    const sessionCookie = setCookie.find(c => c.startsWith('connect.sid'));
    if (sessionCookie) {
      return sessionCookie.split(';')[0];
    }
  }
  return null;
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🛡 TVM PUBLIC SCHOOL ERP INTEGRATION VERIFICATION');
  console.log('======================================================\n');

  try {
    console.log('Connecting to MongoDB for OTP retrieval...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully.\n');

    // Test 1: Fetch Homepage
    console.log('Test 1: Fetching Public Homepage...');
    const home = await makeRequest('/');
    if (home.statusCode === 200 && home.body.includes('TVM Public School')) {
      console.log('✅ PASS: Homepage loaded successfully.');
    } else {
      console.log(`❌ FAIL: Homepage returned status ${home.statusCode}`);
    }

    // Test 2: Invalid Login Attempt
    console.log('\nTest 2: Attempting Login with Invalid Credentials...');
    const badLogin = await makeRequest('/login', 'POST', {
      userId: 'INVALID_USER',
      password: 'wrongpassword',
      role: 'admin'
    });
    if (badLogin.statusCode === 302 && badLogin.headers.location === '/login') {
      console.log('✅ PASS: Invalid login handled correctly (redirected to /login).');
    } else {
      console.log(`❌ FAIL: Unexpected status or redirect: ${badLogin.statusCode} -> ${badLogin.headers.location}`);
    }

    // Test 3: Admin Login Workflow
    console.log('\nTest 3: Initiating Admin Login (ADM001 / admin123)...');
    const adminLoginStep1 = await makeRequest('/login', 'POST', {
      userId: 'ADM001',
      password: 'admin123',
      role: 'admin'
    });

    let adminCookie = getSessionCookie(adminLoginStep1.headers);
    if (adminLoginStep1.statusCode === 302 && adminLoginStep1.headers.location === '/verify-otp' && adminCookie) {
      console.log('✅ PASS: Phase 1 login accepted. Redirected to /verify-otp.');

      // Wait a moment for database write and retrieve the generated OTP
      console.log('Retrieving generated OTP from MongoDB...');
      const adminUser = await Admin.findOne({ username: 'ADM001' });
      const otp = adminUser.otp;
      console.log(`🔑 Retrieved OTP from DB: ${otp}`);

      if (!otp) {
        throw new Error('OTP was not found in the Admin record.');
      }

      // Phase 2: Verify OTP
      console.log('Submitting OTP verification...');
      const adminLoginStep2 = await makeRequest('/verify-otp', 'POST', { otp: otp }, {
        Cookie: adminCookie
      });

      // Keep tracking session cookies (connect.sid might be re-issued)
      const newCookie = getSessionCookie(adminLoginStep2.headers);
      if (newCookie) adminCookie = newCookie;

      if (adminLoginStep2.statusCode === 302 && adminLoginStep2.headers.location === '/admin/dashboard') {
        console.log('✅ PASS: OTP verified successfully. Redirected to /admin/dashboard.');

        // Test 4: Access Admin Dashboard
        console.log('Test 4: Accessing Admin Dashboard with Authorized Session...');
        const adminDash = await makeRequest('/admin/dashboard', 'GET', null, {
          Cookie: adminCookie
        });
        if (adminDash.statusCode === 200 && adminDash.body.includes("Director's Control Centre")) {
          console.log('✅ PASS: Admin dashboard loaded and verified successfully.');
        } else {
          console.log(`❌ FAIL: Admin dashboard returned status ${adminDash.statusCode}. Header found? ${adminDash.body.includes("Director's Control Centre")}`);
        }
      } else {
        console.log(`❌ FAIL: OTP verification failed. Status: ${adminLoginStep2.statusCode}, Redirect: ${adminLoginStep2.headers.location}`);
      }
    } else {
      console.log(`❌ FAIL: Admin login phase 1 failed with status ${adminLoginStep1.statusCode}`);
    }

    // Test 5: Teacher Login Workflow
    console.log('\nTest 5: Initiating Teacher Login (TCH20260001 / teacher123)...');
    const teacherLoginStep1 = await makeRequest('/login', 'POST', {
      userId: 'TCH20260001',
      password: 'teacher123',
      role: 'teacher'
    });

    let teacherCookie = getSessionCookie(teacherLoginStep1.headers);
    if (teacherLoginStep1.statusCode === 302 && teacherLoginStep1.headers.location === '/verify-otp' && teacherCookie) {
      console.log('✅ PASS: Phase 1 login accepted. Redirected to /verify-otp.');

      console.log('Retrieving generated OTP from MongoDB...');
      const teacherUser = await Teacher.findOne({ teacherId: 'TCH20260001' });
      const otp = teacherUser.otp;
      console.log(`🔑 Retrieved OTP from DB: ${otp}`);

      console.log('Submitting OTP verification...');
      const teacherLoginStep2 = await makeRequest('/verify-otp', 'POST', { otp: otp }, {
        Cookie: teacherCookie
      });

      const newCookie = getSessionCookie(teacherLoginStep2.headers);
      if (newCookie) teacherCookie = newCookie;

      if (teacherLoginStep2.statusCode === 302 && teacherLoginStep2.headers.location === '/teacher/dashboard') {
        console.log('✅ PASS: OTP verified. Redirected to /teacher/dashboard.');

        // Test 6: Access Teacher Dashboard
        console.log('Test 6: Accessing Teacher Dashboard...');
        const teacherDash = await makeRequest('/teacher/dashboard', 'GET', null, {
          Cookie: teacherCookie
        });
        if (teacherDash.statusCode === 200 && teacherDash.body.includes('Faculty Portal')) {
          console.log('✅ PASS: Teacher dashboard loaded successfully.');
        } else {
          console.log(`❌ FAIL: Teacher dashboard returned status ${teacherDash.statusCode}`);
        }
      } else {
        console.log(`❌ FAIL: OTP verification failed.`);
      }
    } else {
      console.log(`❌ FAIL: Teacher login phase 1 failed.`);
    }

    // Test 7: Student Login Workflow
    console.log('\nTest 7: Initiating Student Login (STD20260001 / student123)...');
    const studentLoginStep1 = await makeRequest('/login', 'POST', {
      userId: 'STD20260001',
      password: 'student123',
      role: 'student'
    });

    let studentCookie = getSessionCookie(studentLoginStep1.headers);
    if (studentLoginStep1.statusCode === 302 && studentLoginStep1.headers.location === '/verify-otp' && studentCookie) {
      console.log('✅ PASS: Phase 1 login accepted. Redirected to /verify-otp.');

      console.log('Retrieving generated OTP from MongoDB...');
      const studentUser = await Student.findOne({ studentId: 'STD20260001' });
      const otp = studentUser.otp;
      console.log(`🔑 Retrieved OTP from DB: ${otp}`);

      console.log('Submitting OTP verification...');
      const studentLoginStep2 = await makeRequest('/verify-otp', 'POST', { otp: otp }, {
        Cookie: studentCookie
      });

      const newCookie = getSessionCookie(studentLoginStep2.headers);
      if (newCookie) studentCookie = newCookie;

      if (studentLoginStep2.statusCode === 302 && studentLoginStep2.headers.location === '/student/dashboard') {
        console.log('✅ PASS: OTP verified. Redirected to /student/dashboard.');

        // Test 8: Access Student Dashboard
        console.log('Test 8: Accessing Student Dashboard...');
        const studentDash = await makeRequest('/student/dashboard', 'GET', null, {
          Cookie: studentCookie
        });
        if (studentDash.statusCode === 200 && studentDash.body.includes('Student Portal')) {
          console.log('✅ PASS: Student dashboard loaded successfully.');
        } else {
          console.log(`❌ FAIL: Student dashboard returned status ${studentDash.statusCode}`);
        }
      } else {
        console.log(`❌ FAIL: OTP verification failed.`);
      }
    } else {
      console.log(`❌ FAIL: Student login phase 1 failed.`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL PORTAL INTERFACE VERIFICATION CHECKS COMPLETED!');
    console.log('======================================================\n');

  } catch (err) {
    console.error('❌ Integration check failed with an error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

runTests();
