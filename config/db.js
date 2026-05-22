const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tvm_school_erp');
    console.log(`\x1b[32m[Database]\x1b[0m MongoDB Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);

    // Dynamic database startup sanitization and migration
    const Admin = require('../models/Admin');
    const Student = require('../models/Student');
    const Fee = require('../models/Fee');

    try {
      // 1. Sync Admin Email to the requested sunny824118@gmail.com
      const adminUpdate = await Admin.updateOne(
        { username: 'ADM001' },
        { email: 'sunny824118@gmail.com' }
      );
      if (adminUpdate.modifiedCount > 0) {
        console.log(`\x1b[34m[Migration]\x1b[0m Synced Admin ADM001 email to sunny824118@gmail.com.`);
      }

      // 2. Class Names Legacy Cleanup (Convert "Class X" to "X")
      const classesToMigrate = ['1', '2', '5', '9', '10'];
      for (const cls of classesToMigrate) {
        const legacyName = `Class ${cls}`;
        
        // Migrate Students
        const studentMigrate = await Student.updateMany(
          { className: legacyName },
          { className: cls }
        );
        if (studentMigrate.modifiedCount > 0) {
          console.log(`\x1b[34m[Migration]\x1b[0m Standardised ${studentMigrate.modifiedCount} student(s) from '${legacyName}' to '${cls}'.`);
        }

        // Migrate Fees
        const feeMigrate = await Fee.updateMany(
          { className: legacyName },
          { className: cls }
        );
        if (feeMigrate.modifiedCount > 0) {
          console.log(`\x1b[34m[Migration]\x1b[0m Standardised ${feeMigrate.modifiedCount} fee invoice(s) from '${legacyName}' to '${cls}'.`);
        }
      }
    } catch (migError) {
      console.warn(`\x1b[33m[Migration Warning]\x1b[0m Startup sanitization cleanup encountered errors: ${migError.message}`);
    }

  } catch (error) {
    console.error(`\x1b[31m[Database Connection Error]\x1b[0m Failed to connect to MongoDB.`);
    console.error(`Error message: ${error.message}`);
    console.error(`\x1b[33m[Suggestion]\x1b[0m Make sure local MongoDB is running: 'net start MongoDB' (Windows) or 'brew services start mongodb-community' (Mac).`);
    console.error(`Alternatively, you can provide a MongoDB Atlas cloud URI in your .env file.`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
