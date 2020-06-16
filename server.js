const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Global middlewares
app.use((req, res, next) => {
  req.time = new Date().toISOString();
  next();
});
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
  console.log('Hello from middleware!');
  next();
});

// Mount routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server up on port ${PORT}`));
