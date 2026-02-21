const DiscountService = require('../services/discountService');

// Get all discounts
exports.getAllDiscounts = async (req, res) => {
  try {
    const filters = req.query;
    const discounts = await DiscountService.getAllDiscounts(filters);
    
    res.json({
      success: true,
      data: discounts
    });
  } catch (error) {
    console.error('Get discounts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch discounts'
    });
  }
};

// Get discount by ID
exports.getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;
    const discount = await DiscountService.getDiscountById(id);
    
    res.json({
      success: true,
      data: discount
    });
  } catch (error) {
    console.error('Get discount error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Discount not found'
    });
  }
};

// Create new discount
exports.createDiscount = async (req, res) => {
  try {
    const discountData = req.body;
    
    // Validation
    if (!discountData.product_id || !discountData.discount_percent || 
        !discountData.valid_from || !discountData.valid_till) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, discount percent, valid from, and valid till are required'
      });
    }
    
    // Validate discount percentage
    const discountPercent = parseFloat(discountData.discount_percent);
    if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return res.status(400).json({
        success: false,
        message: 'Discount percentage must be between 0 and 100'
      });
    }
    
    const discount = await DiscountService.createDiscount({
      ...discountData,
      discount_percent: discountPercent
    });
    
    res.status(201).json({
      success: true,
      message: 'Discount created successfully',
      data: discount
    });
  } catch (error) {
    console.error('Create discount error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create discount'
    });
  }
};

// Update discount
exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const discountData = req.body;
    
    // Validate discount percentage if provided
    if (discountData.discount_percent !== undefined) {
      const discountPercent = parseFloat(discountData.discount_percent);
      if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
        return res.status(400).json({
          success: false,
          message: 'Discount percentage must be between 0 and 100'
        });
      }
      discountData.discount_percent = discountPercent;
    }
    
    const discount = await DiscountService.updateDiscount(id, discountData);
    
    res.json({
      success: true,
      message: 'Discount updated successfully',
      data: discount
    });
  } catch (error) {
    console.error('Update discount error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update discount'
    });
  }
};

// Delete discount
exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DiscountService.deleteDiscount(id);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Delete discount error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete discount'
    });
  }
};

// Get active discounts
exports.getActiveDiscounts = async (req, res) => {
  try {
    const { date } = req.query;
    const discounts = await DiscountService.getActiveDiscounts(date ? new Date(date) : new Date());
    
    res.json({
      success: true,
      data: discounts
    });
  } catch (error) {
    console.error('Get active discounts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active discounts'
    });
  }
};

// Get product discount
exports.getProductDiscount = async (req, res) => {
  try {
    const { productId } = req.params;
    const { date } = req.query;
    
    const discount = await DiscountService.getProductDiscount(
      productId, 
      date ? new Date(date) : new Date()
    );
    
    res.json({
      success: true,
      data: discount
    });
  } catch (error) {
    console.error('Get product discount error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product discount'
    });
  }
};