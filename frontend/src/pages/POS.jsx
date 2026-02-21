import { useState, useEffect } from 'react';
import {
  Title,
  Button,
  Input,
  Text,
  Label,
  Select,
  Option,
  MessageStrip,
} from '@ui5/webcomponents-react';
import { useCartStore } from '../store/cartStore';
import { productAPI, salesAPI, discountAPI } from '../services/api';
import { generateThermalReceipt, formatSaleForReceipt } from '../utils/receiptPrinter';
import './POS.css';

const POS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [products, setProducts] = useState([]);
  const [activeDiscounts, setActiveDiscounts] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  const { cart, addToCart, updateQuantity, updateDiscount, removeFromCart, setInvoiceDiscount, invoiceDiscount, getCartSummary, clearCart } = useCartStore();

  useEffect(() => {
    fetchProducts();
    fetchActiveDiscounts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      if (response.data.products) {
        setProducts(response.data.products.filter(p => p.status === 'active'));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setMessage({ type: 'error', text: 'Failed to load products' });
    }
  };

  const fetchActiveDiscounts = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await discountAPI.getActiveDiscounts(today);
      
      if (response.data.success) {
        // Create a map of product_id -> discount info
        const discountMap = {};
        response.data.data.forEach(discount => {
          discountMap[discount.product_id] = discount;
        });
        setActiveDiscounts(discountMap);
      }
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
      // Don't show error message as discounts are optional
    }
  };

  const handleAddToCart = (product) => {
    // Add product to cart
    addToCart(product);
    
    // Check if product has an active discount
    const discount = activeDiscounts[product.id];
    if (discount) {
      // Calculate discount amount per unit
      const discountPercent = parseFloat(discount.discount_percent);
      const discountAmount = (product.price * discountPercent) / 100;
      updateDiscount(product.id, discountAmount, discountPercent);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  const summary = getCartSummary();

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setMessage({ type: 'error', text: 'Cart is empty!' });
      return;
    }
    
    setLoading(true);
    try {
      // Prepare sale data
      const saleData = {
        customer_name: customerName,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          tax_percent: item.tax_percent || 0
        }))
      };

      const response = await salesAPI.create(saleData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: `Sale completed! Invoice: ${response.data.data.invoice_no}` });
        
        // Print thermal receipt
        const receiptData = formatSaleForReceipt(response.data.data);
        if (receiptData) {
          generateThermalReceipt(receiptData);
        }
        
        clearCart();
        setCustomerName('Walk-in Customer');
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      }
    } catch (error) {
      console.error('Sale error:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to complete sale' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pos-page">
      {message.text && (
        <MessageStrip
          design={message.type === 'success' ? 'Positive' : 'Negative'}
          hideCloseButton={false}
          onClose={() => setMessage({ type: '', text: '' })}
          style={{ marginBottom: '16px' }}
        >
          {message.text}
        </MessageStrip>
      )}
      
      <div className="pos-container">
        {/* Left Panel - Products Grid */}
        <div className="pos-left">
          <div className="search-section">
            <Input
              placeholder="🔍 Search products by name or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', fontSize: '16px', padding: '12px' }}
            />
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => {
              const discount = activeDiscounts[product.id];
              const hasDiscount = discount && discount.discount_percent > 0;
              
              return (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => handleAddToCart(product)}
                  style={{ position: 'relative' }}
                >
                  {hasDiscount && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: '#dc2626',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      zIndex: 1
                    }}>
                      -{discount.discount_percent}%
                    </div>
                  )}
                  <div className="product-image">
                    <div className="product-icon">🛒</div>
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">
                      Rs. {product.price}
                      {hasDiscount && (
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#dc2626', 
                          marginLeft: '4px',
                          fontWeight: '600'
                        }}>
                          (Rs. {(product.price * (1 - discount.discount_percent / 100)).toFixed(2)})
                        </span>
                      )}
                    </div>
                    <div className="product-stock">Stock: {product.stock_qty}</div>
                  </div>
                  <div className="add-btn">+</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className="pos-right">
          <div className="cart-container">
            <div className="cart-header">
              <Title level="H3" style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>Current Order</Title>
              {cart.length > 0 && (
                <button onClick={clearCart} className="clear-btn">Clear All</button>
              )}
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-icon">🛒</div>
                  <Text style={{ color: '#999999', fontSize: '14px' }}>Cart is empty</Text>
                  <Text style={{ color: '#cccccc', fontSize: '12px' }}>Add products to start</Text>
                </div>
              ) : (
                cart.map((item) => {
                  const discount = activeDiscounts[item.id];
                  const hasDiscount = item.discount > 0;
                  const discountPercent = item.discountPercent || (discount ? discount.discount_percent : 0);
                  
                  return (
                    <div key={item.id} className="cart-item">
                      <div className="item-main">
                        <div className="item-details">
                          <div className="item-name">
                            {item.name}
                            {hasDiscount && discountPercent > 0 && (
                              <span style={{ 
                                marginLeft: '8px',
                                fontSize: '11px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontWeight: '600'
                              }}>
                                -{discountPercent}% OFF
                              </span>
                            )}
                          </div>
                          <div className="item-price">
                            {hasDiscount ? (
                              <>
                                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                                  Rs. {item.price}
                                </span>
                                {' '}
                                <span style={{ color: '#dc2626', fontWeight: '600' }}>
                                  Rs. {(item.price - item.discount).toFixed(2)}
                                </span>
                                {' each'}
                              </>
                            ) : (
                              <>Rs. {item.price} each</>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="remove-btn"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="item-controls">
                        <div className="quantity-control">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="qty-btn"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="qty-input"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>
                        <div className="item-total">
                          Rs. {((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="cart-summary">
                  <div className="summary-row">
                    <Text>Subtotal</Text>
                    <Text style={{ fontWeight: '600' }}>Rs. {summary.subtotal}</Text>
                  </div>
                  {parseFloat(summary.itemDiscount) > 0 && (
                    <div className="summary-row discount">
                      <Text>Item Discounts</Text>
                      <Text style={{ fontWeight: '600', color: '#dc2626' }}>−Rs. {summary.itemDiscount}</Text>
                    </div>
                  )}
                  {parseFloat(summary.discount) > 0 && (
                    <div className="summary-row discount">
                      <Text>Invoice Discount</Text>
                      <Text style={{ fontWeight: '600', color: '#dc2626' }}>−Rs. {summary.discount}</Text>
                    </div>
                  )}
                  <div className="summary-row">
                    <Text>Tax</Text>
                    <Text style={{ fontWeight: '600' }}>Rs. {summary.tax}</Text>
                  </div>
                  <div className="summary-total">
                    <Text style={{ fontSize: '15px', fontWeight: '700' }}>Total</Text>
                    <Text style={{ fontSize: '22px', fontWeight: '700', color: '#2563eb' }}>Rs. {summary.total}</Text>
                  </div>
                </div>

                <div className="payment-section">
                  <div className="input-group">
                    <Label style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Customer Name</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className="payment-methods">
                    <button
                      className={`payment-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <span className="payment-icon">💵</span>
                      <span>Cash</span>
                    </button>
                    <button
                      className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <span className="payment-icon">💳</span>
                      <span>Card</span>
                    </button>
                  </div>

                  <Button
                    design="Emphasized"
                    onClick={handleCompleteSale}
                    disabled={loading}
                    className="checkout-btn"
                  >
                    {loading ? 'Processing...' : `Complete Sale · Rs. ${summary.total}`}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
