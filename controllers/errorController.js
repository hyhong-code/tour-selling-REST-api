const AppError = require('../utils/appError');

// Development enviroment
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Production enviroment
const sendErrorProd = (err, res) => {
  // Identified operatinal error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unkown error
  } else {
    console.error('ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path} : ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateKeyDB = (error) => {
  const message = Object.keys(error.keyValue)
    .map(
      (key) =>
        `Value "${error.keyValue[key]}" is already taken for field "${key}"`
    )
    .join(', ');
  return new AppError(message, 400);
};

const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name; // err.name is enumerable field
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateKeyDB(error);
    sendErrorProd(error, res);
  }
};

module.exports = errorController;
