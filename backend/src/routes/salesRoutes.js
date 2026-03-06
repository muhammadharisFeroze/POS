const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, salesController.createSale);
router.get('/', authenticate, salesController.getAllSales);
router.get('/dashboard', authenticate, salesController.getDashboardStats);
router.get('/reports/daily', authenticate, salesController.getDailySalesReport);
router.get('/reports/product-wise', authenticate, salesController.getProductWiseSalesReport);
router.get('/reports/user-wise', authenticate, salesController.getUserWiseSalesReport);
router.get('/reports/user-wise-daily', authenticate, salesController.getUserWiseDailySalesReport);
router.get('/reports/tax', authenticate, salesController.getTaxReport);
router.get('/:id', authenticate, salesController.getSaleById);

module.exports = router;
