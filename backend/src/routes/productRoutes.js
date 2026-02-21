const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, productController.getAllProducts);
router.get('/search', authenticate, productController.searchProducts);
router.post('/', authenticate, authorize('admin'), productController.createProduct);
router.post('/import', authenticate, authorize('admin'), productController.importProducts);
router.get('/:id', authenticate, productController.getProductById);
router.put('/:id', authenticate, authorize('admin'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

module.exports = router;
