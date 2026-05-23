const net = require('net');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const checkPort = (port, host) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

const startLocalMongo = async () => {
  // We only attempt to start local Mongo in development environment
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const isRunning = await checkPort(27017, '127.0.0.1');
  if (isRunning) {
    console.log('\x1b[32m[Database Starter]\x1b[0m Local MongoDB is already running on port 27017.');
    return;
  }

  // Path to the portable MongoDB executable
  const possiblePaths = [
    path.join(__dirname, '..', '.mongo', 'mongod.exe'),
    'C:\\Users\\hp\\Desktop\\TVM School\\.mongo\\mongod.exe'
  ];

  let mongodPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      mongodPath = p;
      break;
    }
  }

  if (!mongodPath) {
    console.log('\x1b[33m[Database Starter]\x1b[0m Local portable MongoDB binary not found in standard paths. Falling back to default system connection...');
    return;
  }

  const dbDataDir = path.join(__dirname, '..', '.mongo_data');
  if (!fs.existsSync(dbDataDir)) {
    fs.mkdirSync(dbDataDir, { recursive: true });
  }

  console.log(`\x1b[36m[Database Starter]\x1b[0m Starting local MongoDB server from ${mongodPath}...`);
  try {
    const mongoProcess = spawn(mongodPath, ['--dbpath', dbDataDir, '--port', '27017'], {
      detached: true,
      stdio: 'ignore'
    });
    mongoProcess.unref();

    // Wait a few seconds for it to start up
    console.log('\x1b[36m[Database Starter]\x1b[0m Waiting for MongoDB to initialize (4s)...');
    await new Promise((resolve) => setTimeout(resolve, 4000));
    
    const nowRunning = await checkPort(27017, '127.0.0.1');
    if (nowRunning) {
      console.log('\x1b[32m[Database Starter]\x1b[0m Local MongoDB started successfully!');
    } else {
      console.log('\x1b[31m[Database Starter]\x1b[0m Failed to start MongoDB on port 27017.');
    }
  } catch (error) {
    console.error('\x1b[31m[Database Starter]\x1b[0m Error spawning MongoDB:', error.message);
  }
};

module.exports = { startLocalMongo };
