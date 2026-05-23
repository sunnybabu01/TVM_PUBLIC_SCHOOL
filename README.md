# TVM Public School ERP Management System

A complete, modern, responsive, and secure School ERP Management System built with Node.js, Express.js, EJS, and MongoDB.

## Features

- **Main Login System**: Secure authentication for Admin, Teacher, and Student roles with a sleek, glassmorphic login gate.
- **Two-Factor Authentication (2FA)**: Relies on cryptographically secure 6-digit OTP verification. If SMTP is unconfigured or fails, the portal falls back gracefully to a debug interface.
- **Dark & Light Themes**: Real-time theme switching with localStorage state persistence and zero screen-flashing on page reloads.
- **Admin Portal**: Complete school oversight including student registration, teacher records, batch invoicing, real-time metrics, library catalogs, and inventories.
- **Teacher Workspace**: Attendance marking registers, MCQ exam builders, grading utilities, and class homework boards.
- **Student Dashboard**: Real-time attendance statistics, printable dynamic ID Cards & Exam Admit Cards (with dynamic base64 QR codes), pending bills checkouts with simulated Stripe checkout interfaces, and course study materials.
- **Premium Front-end Landing Page**: Includes smooth sliding campus carousel, custom gradients, and feature highlights of student activities.

## Technology Stack

- **Backend**: Node.js & Express.js
- **Database**: MongoDB & Mongoose
- **Templating Engine**: EJS (Embedded JavaScript)
- **Styling**: Bootstrap 5, Custom CSS3, Glassmorphic animations, FontAwesome 6 icons
- **Utilities**: Multer, Nodemailer, Bcryptjs, Express-session, QRCode

## Setup & Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sunnybabu01/-TVM-PUBLIC-SCHOOL-ERP-MANAGEMENT-SYSTEM.git
   cd -TVM-PUBLIC-SCHOOL-ERP-MANAGEMENT-SYSTEM
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment variables**:
   Create a `.env` file in the root folder with:
   ```ini
  PORT=3000
MONGODB_URI=mongodb+srv://sunny824118_db_user:p5A6TZ9Mn2EwunKJ@cluster0.uxcsxtc.mongodb.net/
SESSION_SECRET=super_secret_tvm_erp_session_key_2026

# SMTP Server details for Email Authentication / OTP
# If empty, OTPs will be printed to the server terminal console for easy testing.
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sunny824118@gmail.com
EMAIL_PASS=skgofhphjnddoaei
EMAIL_FROM=noreply@tvmschoolpatna.edu.in

# Stripe Keys (Simulated Payment mode is active if these are left blank)
STRIPE_PUBLISHABLE_KEY=pk_test_51TMBQ5LZidVuhY14rml7paWJRLA4vH5qzyFa2wBrFPZvI8i3Qqwa1M5DpyVbvmtPzeXXx43ObFse2qQrTZ3CLtyT00PKBeJHrf
STRIPE_SECRET_KEY=sk_test_51TMBQ5LZidVuhY14EJVOMXxSy6xtKb3OkIgIRzJUGBuvHz8X58pgSD1RyDXZ5HJpRlSNo5THm6NJIZUSGlCBB3w100jRpyyIJF


CLOUDINARY_CLOUD_NAME=dhd9nwxb7
CLOUDINARY_API_KEY=147841561584472
CLOUDINARY_API_SECRET=RMlvxzkr9u-CSmneLN6gC-90708

# Razorpay Keys (Simulated Payment mode is active if these are left blank)
RAZORPAY_KEY_ID=rzp_test_SsLxwDqSpG14GW
RAZORPAY_KEY_SECRET=6oaW56Sr24bM7StouegqMYSW

NODE_ENV=development

4. **Seed Database Records**:
   ```bash
   npm run seed
   ```

5. **Start Dev Server**:
   ```bash
   npm run dev
   ```

## License

Licensed under the MIT License.
