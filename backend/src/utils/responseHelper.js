const sendSuccess = (res, data, message = null, statusCode = 200) => {
  const response = {
    status: 'success',
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return res.status(statusCode).json(response);
};

const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    status: 'error',
    message
  });
};

const sendSuccessMessage = (res, message, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendSuccessMessage
};

