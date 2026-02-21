const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes for getting active discounts (must come BEFORE authenticate middleware)
router.get('/active/list', authenticate, discountController.getActiveDiscounts);
router.get('/product/:productId', authenticate, discountController.getProductDiscount);

// All other discount routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin routes
router.get('/', discountController.getAllDiscounts);
router.get('/:id', discountController.getDiscountById);
router.post('/', discountController.createDiscount);
router.put('/:id', discountController.updateDiscount);
router.delete('/:id', discountController.deleteDiscount);

module.exports = router;