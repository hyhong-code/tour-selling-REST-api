require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

mongoose
  .connect(process.env.MONGO_DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(console.log(`MongoDB connected`));

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server up on port ${PORT} in ${process.env.NODE_ENV} mode`)
);

// Prevent unhandledRejection globally
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log(`Caught unhandled rejection! server shutting down...`);

  // Let server finish handling pending reqs then shut down.
  server.close(() => process.exit(1)); // Exit on unhandled rejection use code 1
});
