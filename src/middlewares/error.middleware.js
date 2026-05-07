// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  const response = {
    status: 'error',
    message: message,
  };
  
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  
  res.status(status).json(response);
};

module.exports = errorMiddleware;