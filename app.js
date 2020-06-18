const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Global middlewares:

// Set security HTTP headers
app.use(helmet());
// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Rate limiting
const limiter = rateLimit({
  // 100 requests from same ip in one hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from this IP, try again in an hour',
});
app.use('/api', limiter);
// Body parser
app.use(express.json({ limit: '10kb' }));
// Data sanitization against NoSQL injection
app.use(mongoSanitize());
// Data sanitization against XSS attack
app.use(xss());
// Prevent http params polution (clears up query string)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
// Serve static files
app.use(express.static(`${__dirname}/public`));
// For testing
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    req.time = new Date().toISOString();
    next();
  });
}

// Mount routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handle not found
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server.`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
