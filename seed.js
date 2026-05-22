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
