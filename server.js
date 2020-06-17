require('dotenv').config({ path: './config/config.env' });
const connectDB = require('./config/db');
// Prevent uncaughtException globally
process.on('uncaughtException', (err) => {
  console.log(`Caught uncaught exception! server shutting down...`);
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require('./app');

connectDB();

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server up on port ${PORT} in ${process.env.NODE_ENV} mode...`)
);

// Prevent unhandledRejection globally
process.on('unhandledRejection', (err) => {
  console.log(`Caught unhandled rejection! server shutting down...`);
  console.log(err.name, err.message);

  // Let server finish handling pending reqs then shut down.
  server.close(() => process.exit(1)); // Exit on unhandled rejection use code 1
});
