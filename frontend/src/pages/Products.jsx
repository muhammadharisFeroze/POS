import { useState, useEffect } from 'react';
import {
  Title,
  Button,
  Input,
  Text,
  BusyIndicator,
  Dialog,
  Label,
  Select,
  Option,
  MessageStrip,
  CheckBox
} from '@ui5/webcomponents-react';
import { productAPI } from '../services/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: 'Towel',
    price: '',
    tax_percent: 0,
    stock_qty: '',
    unit: 'PCS',
    status: 'active'
  });

  // Mock data for demo
  const mockProducts = [
    { id: 1, name: 'Coca Cola 500ml', barcode: '123456789', category: 'Beverages', price: 150, tax_percent: 5, stock_qty: 45, status: 'active' },
    { id: 2, name: 'Lays Chips', barcode: '987654321', category: 'Snacks', price: 120, tax_percent: 5, stock_qty: 78, status: 'active' },
    { id: 3, name: 'Bread Loaf', barcode: '456789123', category: 'Bakery', price: 180, tax_percent: 5, stock_qty: 23, status: 'active' },
    { id: 4, name: 'Milk 1L', barcode: '789123456', category: 'Dairy', price: 280, tax_percent: 5, stock_qty: 34, status: 'active' },
    { id: 5, name: 'Eggs (12 pack)', barcode: '321654987', category: 'Dairy', price: 420, tax_percent: 5, stock_qty: 56, status: 'active' },
    { id: 6, name: 'Chicken Breast 1kg', barcode: '654987321', category: 'Meat', price: 850, tax_percent: 5, stock_qty: 12, status: 'active' },
    { id: 7, name: 'Rice 5kg', barcode: '147258369', category: 'Groceries', price: 1200, tax_percent: 5, stock_qty: 89, status: 'active' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();

      if (response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setMessage({ type: 'error', text: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditMode(true);
      setCurrentProduct(product);
      setFormData(product);
    } else {
      setEditMode(false);
      setCurrentProduct(null);
      setFormData({
        name: '',
        barcode: '',
        category: '',
        price: '',
        tax_percent: '',
        stock_qty: '',
        unit: 'PCS',
        status: 'active'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      name: '',
      barcode: '',
      category: '',
      price: '',
      tax_percent: '',
      stock_qty: '',
      unit: 'PCS',
      status: 'active'
    });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await productAPI.update(currentProduct.id, formData);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        await productAPI.create(formData);
        setMessage({ type: 'success', text: 'Product created successfully!' });
      }
      handleCloseDialog();
      fetchProducts();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Save product error:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save product' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        setMessage({ type: 'success', text: 'Product deleted successfully!' });
        fetchProducts();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        console.error('Delete product error:', error);
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete product' });
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <BusyIndicator active />
      </div>
    );
  }

  return (
    <div className="products-page">
      <div style={{ marginBottom: '32px' }}>
        <Title level="H2" style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
          Product Management
        </Title>
        <Text style={{ color: '#666666', fontSize: '14px' }}>Manage your inventory and products</Text>
      </div>

      {message.text && (
        <MessageStrip
          design={message.type === 'success' ? 'Positive' : 'Negative'}
          hideCloseButton
          style={{ marginBottom: '24px' }}
        >
          {message.text}
        </MessageStrip>
      )}

      <div style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <Input
          placeholder="Search by name, barcode, or category..."
          value={searchTerm}
          onInput={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, maxWidth: '400px' }}
        />
        <Button
          design="Emphasized"
          onClick={() => handleOpenDialog()}
          style={{ background: '#2563eb', minWidth: '140px' }}
        >
          + Add Product
        </Button>
      </div>

      <div style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Name</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Barcode</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: 'var(--text-primary)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product, index) => (
                <tr key={product.id} style={{ borderBottom: index < filteredProducts.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontSize: '12px', fontWeight: '500' }}>{product.name}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'monospace' }}>{product.barcode}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '12px' }}>{product.category}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontSize: '12px', fontWeight: '600', textAlign: 'right' }}>Rs. {product.price}</td>
                  <td style={{ padding: '10px 12px', color: product.stock_qty < 10 ? 'var(--error)' : 'var(--success)', fontSize: '12px', fontWeight: '700', textAlign: 'center' }}>{product.stock_qty}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '10px',
                      fontWeight: '600',
                      background: product.status === 'active' ? '#dcfce7' : '#fee2e2',
                      color: product.status === 'active' ? '#16a34a' : '#dc2626'
                    }}>
                      {product.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleOpenDialog(product)}
                      style={{
                        padding: '4px 12px',
                        marginRight: '6px',
                        background: 'var(--primary-blue-pale)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--primary-blue)',
                        fontSize: '11px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: '4px 12px',
                        background: 'var(--error-light)',
                        border: '1px solid #fecaca',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--error)',
                        fontSize: '11px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
            No products found
          </div>
        )}

        {/* Pagination Controls */}
        {filteredProducts.length > 0 && (
          <div style={{ 
            marginTop: '24px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: '24px',
            borderTop: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Text style={{ fontSize: '14px', color: '#666' }}>Rows per page:</Text>
              <Select
                value={pageSize.toString()}
                onChange={(e) => {
                  setPageSize(parseInt(e.detail.selectedOption.value));
                  setCurrentPage(1);
                }}
                style={{ width: '80px' }}
              >
                <Option value="5">5</Option>
                <Option value="10">10</Option>
                <Option value="20">20</Option>
                <Option value="50">50</Option>
                <Option value="100">100</Option>
              </Select>
              <Text style={{ fontSize: '14px', color: '#666' }}>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length}
              </Text>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                design="Transparent"
                style={{ minWidth: '40px' }}
              >
                ⟪
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                design="Transparent"
                style={{ minWidth: '40px' }}
              >
                ‹
              </Button>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', padding: '0 16px' }}>
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                design="Transparent"
                style={{ minWidth: '40px' }}
              >
                ›
              </Button>
              <Button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                design="Transparent"
                style={{ minWidth: '40px' }}
              >
                ⟫
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onAfterClose={handleCloseDialog}
        headerText={editMode ? 'Edit Product' : 'Add New Product'}
        style={{ width: '500px' }}
      >
        <div style={{ padding: '20px' }}>

          <div style={{ marginBottom: '16px' }}>
            <Label required>SKU Code</Label>
            <Input
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label required>Product Description</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>



          <div style={{ marginBottom: '16px' }}>
            <Label required>Category</Label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.detail.selectedOption.value })}
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Option value="Towel">Towel</Option>
              <Option value="Garment">Garment</Option>
              <Option value="Ahram">Ahram</Option>
            </Select>
          </div>
          {/* 
          <div style={{ marginBottom: '16px' }}>
            <Label>Category</Label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div> */}

          <div style={{ marginBottom: '16px' }}>
            <Label required>Unit</Label>
            <Select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.detail.selectedOption.value })}
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Option value="PCS">PCS</Option>
              <Option value="2PAC">2PAC</Option>
              <Option value="4PAC">4PAC</Option>
              <Option value="6PAC">6PAC</Option>
            </Select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <Label required>Price (Rs.)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{ width: '100%', marginTop: '8px' }}
              />
            </div>
            <div>
              <Label required>Stock Quantity</Label>
              <Input
                type="number"
                value={formData.stock_qty}
                onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                style={{ width: '100%', marginTop: '8px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <Label>Tax %</Label>
              <Input
                type="number"
                value={formData.tax_percent}
                onChange={(e) => setFormData({ ...formData, tax_percent: e.target.value })}
                style={{ width: '100%', marginTop: '8px' }}
              />
            </div>
            <div>
              <Label required>Status</Label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.detail.selectedOption.value })}
                style={{ width: '100%', marginTop: '8px' }}
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

            <div style={{ marginBottom: '20px' }}>
              <CheckBox
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                text="Active"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button design="Emphasized" onClick={handleSubmit} style={{ background: '#2563eb' }}>
              {editMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Products;
