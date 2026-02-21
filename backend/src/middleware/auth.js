const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      console.log('Token not found in header');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully. User:', decoded.email, 'Role:', decoded.role);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
