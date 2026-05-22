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
   MONGODB_URI=mongodb://127.0.0.1:27017/tvm_school_erp
   SESSION_SECRET=super_secret_tvm_erp_session_key_2026
   
   # Optional SMTP (Gmail / Mailtrap)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM="TVM Public School" <your_email@gmail.com>
   ```

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
