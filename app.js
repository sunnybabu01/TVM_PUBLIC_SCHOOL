const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Security Middleware (Customized Helmet to allow FontAwesome & Google Fonts CDN)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://kit.fontawesome.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://use.fontawesome.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://ka-f.fontawesome.com", "https://use.fontawesome.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://images.pexels.com"],
      connectSrc: ["'self'", "https://ka-f.fontawesome.com"]
    }
  }
}));

app.use(cors());

// Body Parser Middleware
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Static Assets
app.use(express.static(path.join(__dirname, 'public')));
// Ensure a directory for student uploads is exposed
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Express Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'tvm_public_school_erp_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 Hours session validity
    secure: false // Set to true if deploying over HTTPS
  }
}));

// Flash Message system
app.use(flash());

// Global local variables for EJS Views (Flash messages and logged-in user profiles)
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); // Passport session errors if any
  res.locals.user = req.session ? req.session.user : null;
  next();
});

// Setup EJS Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mount Modular Routes
const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');

app.use('/', publicRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);

// Error Handling Middlewares (404 and 500)
const { handleNotFound, handleServerError } = require('./middleware/errorMiddleware');
app.use(handleNotFound);
app.use(handleServerError);

module.exports = app;
