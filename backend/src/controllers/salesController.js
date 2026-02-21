const SalesService = require('../services/salesService');

// Create sale
exports.createSale = async (req, res) => {
  try {
    const saleData = req.body;
    
    // Validation
    if (!saleData.items || !Array.isArray(saleData.items) || saleData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }
    
    if (!saleData.payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }
    
    const sale = await SalesService.createSale(saleData, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Sale completed successfully',
      data: sale
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to complete sale'
    });
  }
};

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    const filters = req.query;
    const result = await SalesService.getAllSales(filters);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sales'
    });
  }
};

// Get sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await SalesService.getSaleById(id);
    
    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Sale not found'
    });
  }
};

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const { date } = req.query;
    const stats = await SalesService.getDashboardStats(date ? new Date(date) : new Date());
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard stats'
    });
  }
};

// Reports
exports.getDailySalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const report = await SalesService.getSalesReport(start_date, end_date);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Daily sales report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate report'
    });
  }
};

exports.getProductWiseSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const report = await SalesService.getProductWiseReport(start_date, end_date);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Product-wise sales report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate report'
    });
  }
};

exports.getTaxReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    const report = await SalesService.getTaxReport(start_date, end_date);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Tax report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate report'
    });
  }
};
