/**
 * Check if the user is authenticated in the session.
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Access denied. Please log in first.');
  res.redirect('/login');
};

/**
 * Restrict routes to specific user roles (admin, teacher, student).
 * @param {Array<string>} roles - Array of permitted role names
 */
const isRole = (roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      req.flash('error_msg', 'Access denied. Please log in.');
      return res.redirect('/login');
    }

    if (roles.includes(req.session.user.role)) {
      return next();
    }

    req.flash('error_msg', 'Access unauthorized for this section.');
    
    // Redirect based on current role
    switch (req.session.user.role) {
      case 'admin':
        return res.redirect('/admin/dashboard');
      case 'teacher':
        return res.redirect('/teacher/dashboard');
      case 'student':
        return res.redirect('/student/dashboard');
      default:
        return res.redirect('/');
    }
  };
};

/**
 * Redirect logged-in users away from the login page to their dashboards.
 */
const redirectIfLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    switch (req.session.user.role) {
      case 'admin':
        return res.redirect('/admin/dashboard');
      case 'teacher':
        return res.redirect('/teacher/dashboard');
      case 'student':
        return res.redirect('/student/dashboard');
      default:
        return next();
    }
  }
  next();
};

module.exports = {
  isAuthenticated,
  isRole,
  redirectIfLoggedIn
};
