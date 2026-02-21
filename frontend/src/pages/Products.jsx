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
  
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: '',
    price: '',
    tax_percent: '',
    stock_qty: '',
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
      // Mock data
      setProducts(mockProducts);
      // const response = await productAPI.getAll();
      // setProducts(response.data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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
      status: 'active'
    });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        // await productAPI.update(currentProduct.id, formData);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        // await productAPI.create(formData);
        setMessage({ type: 'success', text: 'Product created successfully!' });
      }
      handleCloseDialog();
      fetchProducts();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save product' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // await productAPI.delete(id);
        setMessage({ type: 'success', text: 'Product deleted successfully!' });
        fetchProducts();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete product' });
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onChange={(e) => setSearchTerm(e.target.value)}
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
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Name</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Barcode</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr key={product.id} style={{ borderBottom: index < filteredProducts.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{product.name}</td>
                  <td style={{ padding: '16px', color: '#666666', fontSize: '14px', fontFamily: 'monospace' }}>{product.barcode}</td>
                  <td style={{ padding: '16px', color: '#666666', fontSize: '14px' }}>{product.category}</td>
                  <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {product.price}</td>
                  <td style={{ padding: '16px', color: product.stock_qty < 10 ? '#dc2626' : '#16a34a', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{product.stock_qty}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: product.status === 'active' ? '#dcfce7' : '#fee2e2',
                      color: product.status === 'active' ? '#16a34a' : '#dc2626'
                    }}>
                      {product.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleOpenDialog(product)}
                      style={{
                        padding: '6px 16px',
                        marginRight: '8px',
                        background: '#f0f9ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '4px',
                        color: '#2563eb',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: '6px 16px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        color: '#dc2626',
                        fontSize: '13px',
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
      </div>

      <Dialog
        open={dialogOpen}
        onAfterClose={handleCloseDialog}
        headerText={editMode ? 'Edit Product' : 'Add New Product'}
        style={{ width: '500px' }}
      >
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Label required>Product Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label required>Barcode</Label>
            <Input
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label required>Category</Label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', marginTop: '8px' }}
            />
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
              <Label required>Tax %</Label>
              <Input
                type="number"
                value={formData.tax_percent}
                onChange={(e) => setFormData({ ...formData, tax_percent: e.target.value })}
                style={{ width: '100%', marginTop: '8px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <Label required>Stock Quantity</Label>
              <Input
                type="number"
                value={formData.stock_qty}
                onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
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
