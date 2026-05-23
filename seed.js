require('dotenv').config();
const mongoose = require('mongoose');

const Admin = require('./models/Admin');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Fee = require('./models/Fee');
const Library = require('./models/Library');
const Inventory = require('./models/Inventory');
const Notification = require('./models/Notification');
const Attendance = require('./models/Attendance');
const Exam = require('./models/Exam');
const Result = require('./models/Result');
const Event = require('./models/Event');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tvm_school_erp';

async function seedDatabase() {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Database connected successfully!');

    // 1. Clear Existing Data
    console.log('Clearing existing collections...');
    await Admin.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await Fee.deleteMany({});
    await Library.deleteMany({});
    await Inventory.deleteMany({});
    await Notification.deleteMany({});
    await Attendance.deleteMany({});
    await Exam.deleteMany({});
    await Result.deleteMany({});
    await Event.deleteMany({});
    console.log('All collections cleared!');

    // 2. Seed Admin
    console.log('Seeding Director (Admin) Account...');
    const admin = new Admin({
      username: 'ADM001',
      name: 'Dr. Ramesh Kumar',
      email: 'sunny824118@gmail.com',
      password: 'admin123' // Hashed by Mongoose pre-save hook
    });
    await admin.save();
    console.log('Admin account created: ADM001 / admin123');

    // 3. Seed Teachers
    console.log('Seeding Faculty (Teacher) Accounts...');
    const teacher1 = new Teacher({
      teacherId: 'TCH20260001',
      name: 'Prof. Satish Chandra',
      email: 'satish@tvm.edu',
      subject: 'Physics',
      phone: '9876543210',
      password: 'teacher123' // Hashed by hook
    });
    await teacher1.save();

    const teacher2 = new Teacher({
      teacherId: 'TCH20260002',
      name: 'Prof. Nita Sinha',
      email: 'nita@tvm.edu',
      subject: 'Mathematics',
      phone: '9876543211',
      password: 'teacher123'
    });
    await teacher2.save();
    console.log('Teacher accounts created: TCH20260001, TCH20260002 / teacher123');

    // 4. Seed Students
    console.log('Seeding Student Accounts...');
    const student1 = new Student({
      studentId: 'STD20260001',
      name: 'Aarav Roy',
      email: 'aarav@gmail.com',
      className: '9',
      section: 'A',
      rollNumber: 12,
      fatherName: 'Sanjay Roy',
      password: 'student123'
    });
    await student1.save();

    const student2 = new Student({
      studentId: 'STD20260002',
      name: 'Ananya Sharma',
      email: 'ananya@gmail.com',
      className: '10',
      section: 'B',
      rollNumber: 4,
      fatherName: 'Dev Sharma',
      password: 'student123'
    });
    await student2.save();
    console.log('Student accounts created: STD20260001, STD20260002 / student123');

    // 5. Seed Fee Invoices
    console.log('Seeding Fee Invoices...');
    const fee1 = new Fee({
      studentId: 'STD20260001',
      title: 'Class 9 Term 1 Tuition Fee',
      amount: 12500,
      dueDate: new Date('2026-06-30'),
      status: 'unpaid'
    });
    await fee1.save();

    const fee2 = new Fee({
      studentId: 'STD20260001',
      title: 'Annual Registration Fee 2026',
      amount: 5000,
      dueDate: new Date('2026-04-15'),
      status: 'paid',
      paymentMethod: 'Stripe',
      paymentId: 'STR-SIM-128374829',
      paidAt: new Date('2026-04-12')
    });
    await fee2.save();

    const fee3 = new Fee({
      studentId: 'STD20260002',
      title: 'Class 10 Term 1 Tuition Fee',
      amount: 13500,
      dueDate: new Date('2026-06-30'),
      status: 'unpaid'
    });
    await fee3.save();
    console.log('Fee invoices seeded!');

    // 6. Seed Library Books
    console.log('Seeding Library Book Catalogue...');
    const book1 = new Library({
      title: 'Concepts of Physics Vol 1',
      author: 'Dr. H.C. Verma',
      isbn: '9788177091878',
      category: 'Physics',
      quantity: 8,
      available: 8
    });
    await book1.save();

    const book2 = new Library({
      title: 'Higher Algebra',
      author: 'Hall & Knight',
      isbn: '9788185386072',
      category: 'Mathematics',
      quantity: 5,
      available: 5
    });
    await book2.save();

    const book3 = new Library({
      title: 'Organic Chemistry',
      author: 'Morrison & Boyd',
      isbn: '9788131704813',
      category: 'Chemistry',
      quantity: 6,
      available: 6
    });
    await book3.save();
    console.log('Library items seeded!');

    // 7. Seed Inventory
    console.log('Seeding Physical Lab Assets & Inventory...');
    const item1 = new Inventory({
      itemName: 'Sartorius Electronic Balance',
      category: 'Lab Equipment',
      quantity: 3,
      roomNo: 'Chemistry Lab (Block B - Room 204)',
      condition: 'Excellent',
      lastUpdatedBy: 'Administration'
    });
    await item1.save();

    const item2 = new Inventory({
      itemName: 'Dell Optiplex 7080 Workstation',
      category: 'Electronics',
      quantity: 25,
      roomNo: 'Computer Science Lab (Block A - Room 105)',
      condition: 'Good',
      lastUpdatedBy: 'Administration'
    });
    await item2.save();

    const item3 = new Inventory({
      itemName: 'Wooden Classroom Desks',
      category: 'Furniture',
      quantity: 60,
      roomNo: 'Classroom 9-A (Block A - Room 12)',
      condition: 'Good',
      lastUpdatedBy: 'Administration'
    });
    await item3.save();
    console.log('Inventory items seeded!');

    // 8. Seed Announcements / Notices
    console.log('Seeding Notice Board Announcements...');
    const notice1 = new Notification({
      title: 'Welcome to the TVM ERP Portal!',
      content: 'We are thrilled to launch our new glassmorphic school ERP system for TVM Public School, Patna. Students and faculty can now access reports, quizzes, homework, and billing receipts securely offline!',
      targetRole: 'all',
      createdBy: 'Administration'
    });
    await notice1.save();

    const notice2 = new Notification({
      title: '[Homework] Physics Lab Schedule Update',
      content: 'Target Class: 9\n\nDescription: The practical schedule for Class 9 Physics Lab has been moved to Thursday afternoons from 2:00 PM onwards. Please carry your lab record books.',
      targetRole: 'student',
      createdBy: 'Prof. Satish Chandra'
    });
    await notice2.save();
    console.log('Notice board announcements seeded!');

    // 9. Seed Attendance Records (past 30 days, except Sundays)
    console.log('Seeding Student Attendance logs (last 30 days)...');
    const attendanceRecords = [];
    const studentIds = [student1.studentId, student2.studentId];
    
    // Last 30 days from today
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0); // normalize to midnight
      
      // Skip Sundays (0 = Sunday)
      if (date.getDay() === 0) continue;
      
      for (const studentId of studentIds) {
        // Probability distribution: 85% present, 10% late, 5% absent
        const rand = Math.random();
        let status = 'present';
        if (rand < 0.05) {
          status = 'absent';
        } else if (rand < 0.15) {
          status = 'late';
        }
        
        attendanceRecords.push({
          date,
          userRole: 'student',
          userId: studentId,
          status,
          markedBy: 'TCH20260001'
        });
      }
    }
    
    await Attendance.insertMany(attendanceRecords);
    console.log(`Seeded ${attendanceRecords.length} attendance records successfully!`);

    // 10. Seed Exams (Past & Upcoming)
    console.log('Seeding Exam Schedules & Question Banks...');
    
    // Class 9 Exams
    const examClass9Past1 = new Exam({
      title: 'Class 9 Mid-Term Physics Examination',
      className: '9',
      subject: 'Physics',
      examDate: new Date('2026-04-20T10:00:00'),
      durationMinutes: 90,
      questions: [
        {
          questionText: 'What is the SI unit of force?',
          options: ['Newton', 'Joule', 'Watt', 'Pascal'],
          correctOptionIndex: 0
        },
        {
          questionText: 'Which of the following is a vector quantity?',
          options: ['Mass', 'Temperature', 'Velocity', 'Speed'],
          correctOptionIndex: 2
        }
      ]
    });
    await examClass9Past1.save();

    const examClass9Past2 = new Exam({
      title: 'Class 9 First Term Mathematics Examination',
      className: '9',
      subject: 'Mathematics',
      examDate: new Date('2026-04-22T10:00:00'),
      durationMinutes: 120,
      questions: [
        {
          questionText: 'What is the value of pi (rounded to two decimal places)?',
          options: ['3.12', '3.14', '3.16', '3.18'],
          correctOptionIndex: 1
        },
        {
          questionText: 'Solve for x: 2x + 5 = 15',
          options: ['5', '10', '15', '20'],
          correctOptionIndex: 0
        }
      ]
    });
    await examClass9Past2.save();

    const examClass9Upcoming1 = new Exam({
      title: 'Class 9 Chemistry Unit Assessment - Acids & Bases',
      className: '9',
      subject: 'Chemistry',
      examDate: new Date('2026-06-10T09:30:00'),
      durationMinutes: 60,
      questions: [
        {
          questionText: 'What is the pH value of a neutral solution?',
          options: ['0', '5', '7', '14'],
          correctOptionIndex: 2
        }
      ]
    });
    await examClass9Upcoming1.save();

    const examClass9Upcoming2 = new Exam({
      title: 'Class 9 English Grammar Assessment',
      className: '9',
      subject: 'English',
      examDate: new Date('2026-06-12T11:00:00'),
      durationMinutes: 45,
      questions: [
        {
          questionText: 'Which word is a verb in: "The quick brown fox jumps over the lazy dog"?',
          options: ['quick', 'jumps', 'fox', 'lazy'],
          correctOptionIndex: 1
        }
      ]
    });
    await examClass9Upcoming2.save();

    // Class 10 Exams
    const examClass10Past1 = new Exam({
      title: 'Class 10 Mid-Term Chemistry Examination',
      className: '10',
      subject: 'Chemistry',
      examDate: new Date('2026-04-20T10:00:00'),
      durationMinutes: 90,
      questions: [
        {
          questionText: 'What is the chemical formula for common table salt?',
          options: ['HCl', 'NaOH', 'NaCl', 'H2O'],
          correctOptionIndex: 2
        }
      ]
    });
    await examClass10Past1.save();

    const examClass10Past2 = new Exam({
      title: 'Class 10 First Term English Literature Assessment',
      className: '10',
      subject: 'English',
      examDate: new Date('2026-04-24T10:00:00'),
      durationMinutes: 90,
      questions: [
        {
          questionText: 'Who wrote the play "Julius Caesar"?',
          options: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Leo Tolstoy'],
          correctOptionIndex: 0
        }
      ]
    });
    await examClass10Past2.save();

    const examClass10Upcoming1 = new Exam({
      title: 'Class 10 Pre-Board Physics Examination',
      className: '10',
      subject: 'Physics',
      examDate: new Date('2026-06-15T09:30:00'),
      durationMinutes: 180,
      questions: [
        {
          questionText: 'What is the speed of light in a vacuum?',
          options: ['3 x 10^8 m/s', '3 x 10^6 m/s', '1.5 x 10^8 m/s', '3 x 10^10 m/s'],
          correctOptionIndex: 0
        }
      ]
    });
    await examClass10Upcoming1.save();

    const examClass10Upcoming2 = new Exam({
      title: 'Class 10 Revision Mathematics Mock Test',
      className: '10',
      subject: 'Mathematics',
      examDate: new Date('2026-06-18T10:00:00'),
      durationMinutes: 120,
      questions: [
        {
          questionText: 'If a quadratic equation ax^2 + bx + c = 0 has equal roots, then the discriminant (D) is:',
          options: ['D > 0', 'D < 0', 'D = 0', 'D is undefined'],
          correctOptionIndex: 2
        }
      ]
    });
    await examClass10Upcoming2.save();
    
    console.log('Seeded past and upcoming exams successfully!');

    // 11. Seed Results (for past exams)
    console.log('Seeding Exam Results and Grades...');
    
    // For STD20260001 (Class 9) - examClass9Past1 (Physics) and examClass9Past2 (Mathematics)
    const result1 = new Result({
      studentId: 'STD20260001',
      examId: examClass9Past1._id,
      subject: 'Physics',
      marksObtained: 88,
      totalMarks: 100,
      grade: 'A',
      remarks: 'Excellent understanding of laws of motion and classical physics. Consistent effort shown in assignments.'
    });
    await result1.save();

    const result2 = new Result({
      studentId: 'STD20260001',
      examId: examClass9Past2._id,
      subject: 'Mathematics',
      marksObtained: 95,
      totalMarks: 100,
      grade: 'A+',
      remarks: 'Outshining performance! Highly skilled with algebra and numerical proofs. Exemplary learner.'
    });
    await result2.save();

    // For STD20260002 (Class 10) - examClass10Past1 (Chemistry) and examClass10Past2 (English)
    const result3 = new Result({
      studentId: 'STD20260002',
      examId: examClass10Past1._id,
      subject: 'Chemistry',
      marksObtained: 76,
      totalMarks: 100,
      grade: 'B',
      remarks: 'Good progress. Needs minor improvements in organic compound structures and lab equation balancing.'
    });
    await result3.save();

    const result4 = new Result({
      studentId: 'STD20260002',
      examId: examClass10Past2._id,
      subject: 'English',
      marksObtained: 84,
      totalMarks: 100,
      grade: 'A',
      remarks: 'Very creative answers in drama and reading sections. Showcases highly mature vocabulary and clear expression.'
    });
    await result4.save();

    console.log('Seeded exam results and grading registers successfully!');

    // 12. Seed Public Events & Gallery
    console.log('Seeding Calendar Events and Gallery Showcase...');
    
    const event1 = new Event({
      title: 'Annual Science & Robotics Exhibition 2026',
      description: 'Join us at the TVM Block B Science Auditorium to explore marvelous innovative models, automated solar arrays, and robot cars built entirely by Class 9 and 10 young scientists!',
      eventDate: new Date('2026-06-25T09:00:00'),
      image: '/images/science_exhibit.png',
      category: 'Science Exhibition',
      isFeatured: true
    });
    await event1.save();

    const event2 = new Event({
      title: 'Inter-School Athletic Meet and Sports Championship',
      description: 'The mega annual athletic fest featuring 100m sprint, long jump, high jump, volleyball tournament, and relay finals. Chief guest is former National Gold Medalist!',
      eventDate: new Date('2026-06-28T08:00:00'),
      image: '/images/sports_day.png',
      category: 'Sports',
      isFeatured: true
    });
    await event2.save();

    const event3 = new Event({
      title: 'Republic Day Cultural Parade & Flag Hoisting',
      description: 'Glorious celebration of the Constitution of India at the main assembly lawn of TVM Public School, featuring patriotic group dance, choir, and dramatic skits by kindergarten and senior students.',
      eventDate: new Date('2026-01-26T08:30:00'),
      image: '/images/cultural_fest.png',
      category: 'Cultural',
      isFeatured: true
    });
    await event3.save();

    const event4 = new Event({
      title: 'Summer Vacation Commencement Notice',
      description: 'As per the orders of the local administration, the summer vacation for academic year 2026-27 will commence on June 1st and conclude on June 22nd. Enjoy a happy and healthy break!',
      eventDate: new Date('2026-06-01T00:00:00'),
      image: '/images/cultural_fest.png',
      category: 'Holiday',
      isFeatured: false
    });
    await event4.save();

    // Gallery Category Only
    const event5 = new Event({
      title: 'Tech Fest 2025 Highlights',
      description: 'Outstanding moments from TVM Tech Fest 2025 where students participated in coding battles, graphic design sprint, and quiz rounds.',
      eventDate: new Date('2025-11-15T10:00:00'),
      image: '/images/science_exhibit.png',
      category: 'Gallery Only',
      isFeatured: false
    });
    await event5.save();

    const event6 = new Event({
      title: 'Independence Day Celebrations 2025',
      description: 'Precious snaps from our Independence Day flag hoisting ceremony, parade review, and subsequent prize distribution for academic and sports champions of the previous year.',
      eventDate: new Date('2025-08-15T08:00:00'),
      image: '/images/cultural_fest.png',
      category: 'Gallery Only',
      isFeatured: false
    });
    await event6.save();

    console.log('Seeded calendar events and gallery pictures successfully!');

    console.log(`
      ======================================================
         TVM PUBLIC SCHOOL DATABASE SEEDING COMPLETED!
      ======================================================
      
      Test Accounts Available:
      
      1. ADMIN / DIRECTOR
         - User ID / Username: ADM001
         - Password: admin123
         
      2. TEACHING FACULTY
         - User ID: TCH20260001 (Physics)
         - Password: teacher123
         
         - User ID: TCH20260002 (Mathematics)
         - Password: teacher123
         
      3. STUDENT PORTAL
         - User ID: STD20260001 (Class 9-A)
         - Password: student123
         
         - User ID: STD20260002 (Class 10-B)
         - Password: student123
         
      ======================================================
    `);

    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding process crashed with error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();
