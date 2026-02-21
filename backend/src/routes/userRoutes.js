const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', userController.createUser);
router.post('/login', require('../controllers/authController').login);

// Protected routes (require authentication)
router.use(authenticate);

// User management routes (admin only)
router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/:id', authorize('admin'), userController.getUserById);
router.post('/', authorize('admin'), userController.createUser);
router.put('/:id', authorize('admin'), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);
router.patch('/:id/password', authorize('admin'), userController.changePassword);

// Profile routes (user can access their own profile)
router.get('/profile/:id', authenticate, (req, res, next) => {
  if (req.user.id == req.params.id || req.user.role === 'admin') {
    userController.getUserById(req, res, next);
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
});

module.exports = router;