const { AppError } = require('../utils/errors');
const { sendError } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 400);
  }

  if (err.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400);
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, `${field} already exists`, 409);
  }

  // Map common error messages to status codes for better HTTP compliance
  const message = err.message || '';
  let statusCode = err.statusCode || 500;

  // 404 - Not Found
  if (/not found/i.test(message)) {
    statusCode = 404;
  } 
  // 403 - Forbidden
  else if (/not authorized/i.test(message) || /insufficient permissions/i.test(message) || /permission denied/i.test(message) || /cannot/i.test(message)) {
    statusCode = 403;
  } 
  // 401 - Unauthorized
  else if (/unauthorized/i.test(message) || /authentication/i.test(message) || /login/i.test(message)) {
    statusCode = 401;
  }
  // 400 - Bad Request (validation errors)
  else if (/invalid/i.test(message) || /required/i.test(message) || /must be/i.test(message) || /should/i.test(message)) {
    statusCode = 400;
  }

  return sendError(res, message || 'Internal server error', statusCode);
};

module.exports = errorHandler;

