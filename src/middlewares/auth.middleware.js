const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const roleAuth = (roles = []) => {
  // roles param can be a single role string (e.g., 'admin')
  // or an array of roles (e.g., ['admin', 'moderator'])
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      // 1. Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ 
          status: "error", 
          message: "No token provided" 
        });
      }

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 3. Find user and check if they exist
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          status: "error", 
          message: "User not found" 
        });
      }

      // 4. Check if user's role is included in the allowed roles
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ 
          status: "error", 
          message: "You don't have permission to access this resource" 
        });
      }

      // 5. Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          status: "error", 
          message: "Invalid token" 
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          status: "error", 
          message: "Token expired" 
        });
      }
      
      res.status(500).json({ 
        status: "error", 
        message: "Internal server error"
      });
    }
  };
};

module.exports = roleAuth;