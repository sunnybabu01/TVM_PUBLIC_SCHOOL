/**
 * Middleware to catch 404 errors (page not found) and render a custom 404 EJS page.
 */
const handleNotFound = (req, res, next) => {
  res.status(404);
  res.render('public/error', {
    title: '404 - Page Not Found',
    errorCode: 404,
    errorMessage: 'Oops! The page you are looking for does not exist or has been relocated.',
    user: req.session ? req.session.user : null
  });
};

/**
 * Global Express error handling middleware to catch 500 errors.
 */
const handleServerError = (err, req, res, next) => {
  console.error('\x1b[31m[Global Application Error]\x1b[0m', err.stack || err);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.render('public/error', {
    title: `${statusCode} - Server Error`,
    errorCode: statusCode,
    errorMessage: process.env.NODE_ENV === 'production' 
      ? 'An unexpected database or server error occurred. Our administration team has been notified.' 
      : err.message,
    user: req.session ? req.session.user : null
  });
};

module.exports = {
  handleNotFound,
  handleServerError
};
