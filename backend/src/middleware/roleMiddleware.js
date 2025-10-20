const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
      try {
        if (!req.user || !req.user.role) {
          return res.status(403).json({
            status: 'error',
            message: 'Access denied: user role not found'
          });
        }
  
        // If multiple roles are allowed (e.g. ['manager', 'admin'])
        if (Array.isArray(requiredRole)) {
          if (!requiredRole.includes(req.user.role)) {
            return res.status(403).json({
              status: 'error',
              message: 'Access denied: insufficient permissions'
            });
          }
        } else {
          // Single role check
          if (req.user.role !== requiredRole) {
            return res.status(403).json({
              status: 'error',
              message: 'Access denied: insufficient permissions'
            });
          }
        }
  
        next();
      } catch (err) {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized access'
        });
      }
    };
  };
  
  module.exports = roleMiddleware;
  