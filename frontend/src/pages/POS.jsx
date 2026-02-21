import { useState } from 'react';
import {
  Title,
  Button,
  Input,
  Text,
  Label,
  Select,
  Option,
} from '@ui5/webcomponents-react';
import { useCartStore } from '../store/cartStore';
import './POS.css';

const POS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  const { cart, addToCart, updateQuantity, updateDiscount, removeFromCart, setInvoiceDiscount, invoiceDiscount, getCartSummary, clearCart } = useCartStore();

  // Mock products
  const mockProducts = [
    { id: 1, name: 'Coca Cola 500ml', barcode: '123456789', category: 'Beverages', price: 150, tax_percent: 5, stock_qty: 45 },
    { id: 2, name: 'Lays Chips', barcode: '987654321', category: 'Snacks', price: 120, tax_percent: 5, stock_qty: 78 },
    { id: 3, name: 'Bread Loaf', barcode: '456789123', category: 'Bakery', price: 180, tax_percent: 5, stock_qty: 23 },
    { id: 4, name: 'Milk 1L', barcode: '789123456', category: 'Dairy', price: 280, tax_percent: 5, stock_qty: 34 },
    { id: 5, name: 'Eggs (12 pack)', barcode: '321654987', category: 'Dairy', price: 420, tax_percent: 5, stock_qty: 56 },
  ];

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const summary = getCartSummary();

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }
    
    alert(`Sale completed!\nTotal: Rs. ${summary.total}\nThank you!`);
    clearCart();
    setCustomerName('Walk-in Customer');
  };

  return (
    <div className="pos-page">
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
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => addToCart(product)}
              >
                <div className="product-image">
                  <div className="product-icon">🛒</div>
                </div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">Rs. {product.price}</div>
                  <div className="product-stock">Stock: {product.stock_qty}</div>
                </div>
                <div className="add-btn">+</div>
              </div>
            ))}
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
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-main">
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">Rs. {item.price} each</div>
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
                      <div className="item-total">Rs. {(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    
                    {item.discount > 0 && (
                      <div className="discount-badge">−Rs. {item.discount} discount</div>
                    )}
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="cart-summary">
                  <div className="summary-row">
                    <Text>Subtotal</Text>
                    <Text style={{ fontWeight: '600' }}>Rs. {summary.subtotal}</Text>
                  </div>
                  {parseFloat(summary.discount) > 0 && (
                    <div className="summary-row discount">
                      <Text>Discount</Text>
                      <Text style={{ fontWeight: '600', color: '#dc2626' }}>−Rs. {summary.discount}</Text>
                    </div>
                  )}
                  <div className="summary-row">
                    <Text>Tax (5%)</Text>
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
                    className="checkout-btn"
                  >
                    Complete Sale · Rs. {summary.total}
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
