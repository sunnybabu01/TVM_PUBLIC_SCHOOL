const app = require('./app');
const connectDB = require('./config/db');
const { startLocalMongo } = require('./utils/dbStarter');

// Set Server Listening Port
const PORT = process.env.PORT || 3000;

// Connect to Database and start web server
const startServer = async () => {
  try {
    // 0. Auto-start local MongoDB if not already running
    await startLocalMongo();

    // 1. Fire up database connection
    await connectDB();

    // 2. Start HTTP server
    app.listen(PORT, () => {
      const serverBanner = '='.repeat(50);
      console.log(`
\x1b[34m${serverBanner}\x1b[0m
\x1b[36m   TVM PUBLIC SCHOOL ERP MANAGEMENT SYSTEM   \x1b[0m
\x1b[32m   Server listening successfully on PORT: ${PORT} \x1b[0m
\x1b[33m   Application URL: http://localhost:${PORT} \x1b[0m
\x1b[35m   Environment: ${process.env.NODE_ENV || 'development'} \x1b[0m
\x1b[34m${serverBanner}\x1b[0m
      `);
    });
  } catch (error) {
    console.error('\x1b[31m[Critical Server Launch Error]\x1b[0m', error.message);
    process.exit(1);
  }
};

startServer();
