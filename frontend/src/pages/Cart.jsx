import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Tag, Ticket } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../api/axios';
import axiosInstance from '../api/axios';

const Cart = () => {
  const { cartItems, cartTotal, cartCount, removeFromCart, deleteFromCart, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axiosInstance.get('/coupon/listCoupons');
        if (response.data.msg === 'success') {
          setAvailableCoupons(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch coupons', err);
      }
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponData(null);

    try {
      const response = await axiosInstance.post('/coupon/applyCoupon', {
        code: couponCode.trim(),
        total_amount: cartTotal,
      });
      if (response.data.msg === 'success') {
        setCouponData(response.data);
      } else {
        setCouponError(response.data.msg || 'Coupon not valid');
      }
    } catch (error) {
      setCouponError(error.response?.data?.msg || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponData(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleRemove = async (productId) => {
    await removeFromCart(productId);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      await deleteFromCart(productId);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <div className="container">
          <h2>Your Cart is Empty</h2>
          <p>Add some products to get started!</p>
          <Link to="/" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-layout">
          <div className="cart-items-section">
            {cartItems.map((item) => (
              <div key={item.product_id} className="cart-item">
                <img 
                  src={item.image_url || (item.image ? `${API_BASE_URL}${item.image}` : '/placeholder.jpg')} 
                  alt={item.product_name}
                  className="cart-item-image"
                />
                
                <div className="cart-item-details">
                  <Link to={`/product/${item.product_slug}`} className="cart-item-name">
                    {item.product_name}
                  </Link>
                  
                  {/* Variations */}
                  {item.variations && item.variations.length > 0 && (
                    <div className="cart-item-variations">
                      {item.variations.map((v, idx) => (
                        <span key={idx}>
                          {v.category}: {v.value}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="cart-item-price">${item.price}</p>
                  
                  {/* Stock status */}
                  <p className={`stock-status ${item.in_stock ? 'in-stock' : 'out-of-stock'}`}>
                    {item.in_stock ? 'In Stock' : 'Out of Stock'}
                  </p>
                  
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => handleRemove(item.product_id)}
                        disabled={loading}
                      >
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => {/* TODO: Implement increase quantity */}}
                        disabled={loading}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(item.product_id)}
                      disabled={loading}
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                    
                    {/* Save for later - TODO: Implement */}
                    <button className="save-later-btn">
                      Save for later
                    </button>
                  </div>
                </div>
                
                <div className="cart-item-subtotal">
                  <strong>${item.subtotal}</strong>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal ({cartCount} items):</span>
              <span>${cartTotal}</span>
            </div>
            
            {/* Shipping */}
            <div className="summary-row">
              <span>Shipping:</span>
              <span className="free-text">FREE</span>
            </div>
            
            {/* Tax */}
            <div className="summary-row">
              <span>Estimated Tax:</span>
              <span>${(cartTotal * 0.08).toFixed(2)}</span>
            </div>

            {/* Coupon Code Input */}
            <div className="coupon-section">
              <h4>Have a coupon?</h4>
              {couponData ? (
                <div className="coupon-applied-box">
                  <div className="coupon-applied-header">
                    <Tag size={16} color="#16a34a" />
                    <span className="coupon-code-label">{couponCode.toUpperCase()}</span>
                    <button className="btn-remove-coupon" onClick={handleRemoveCoupon}>Remove</button>
                  </div>
                  <p className="coupon-savings">You save: <strong>${couponData.discount.toFixed(2)}</strong></p>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <input 
                    type="text" 
                    placeholder="Enter coupon code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button 
                    className="btn-apply" 
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {couponError && <p className="coupon-error">{couponError}</p>}

              {/* Available Coupons */}
              {!couponData && availableCoupons.length > 0 && (
                <div className="available-coupons">
                  <p className="available-coupons-title">Available Coupons:</p>
                  {availableCoupons.map((c) => (
                    <div key={c.code} className="coupon-chip" onClick={() => setCouponCode(c.code)}>
                      <Ticket size={14} />
                      <span className="chip-code">{c.code}</span>
                      <span className="chip-desc">
                        {c.discount_type === 'percent' 
                          ? `${c.discount_value}% off` 
                          : `$${c.discount_value} off`}
                        {c.min_order_amount > 0 && ` (min $${c.min_order_amount})`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="summary-divider"></div>

            {couponData && (
              <div className="summary-row discount-row">
                <span>Coupon Discount:</span>
                <span className="discount-amount">-${couponData.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row total">
              <strong>Order Total:</strong>
              <strong className={couponData ? 'discounted-total' : ''}>
                ${couponData ? couponData.finalPrice.toFixed(2) : (cartTotal * 1.08).toFixed(2)}
              </strong>
            </div>

            {couponData && (
              <div className="savings-banner">
                🎉 You're saving ${couponData.discount.toFixed(2)} on this order!
              </div>
            )}
            
            <Link to="/checkout" className="btn-checkout">
              Proceed to Checkout
            </Link>
            
            {/* Prime benefits */}
            <div className="prime-benefits">
              <p>Join Prime for FREE delivery</p>
              <Link to="/prime">Learn more</Link>
            </div>
          </div>
        </div>
        
        {/* Recommended products */}
        <section className="recommended-section">
          <h2>Customers who bought items in your cart also bought</h2>
          <div className="recommended-products">
            <p>Recommended products will appear here</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Cart;
