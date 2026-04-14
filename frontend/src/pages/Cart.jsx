import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../api/axios';

const Cart = () => {
  const { cartItems, cartTotal, cartCount, removeFromCart, deleteFromCart, loading } = useCart();

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
                  src={item.image ? `${API_BASE_URL}${item.image}` : '/placeholder.jpg'} 
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
            
            {/* Shipping - TODO: Implement in backend */}
            <div className="summary-row">
              <span>Shipping:</span>
              <span className="free-text">FREE</span>
            </div>
            
            {/* Tax - TODO: Implement in backend */}
            <div className="summary-row">
              <span>Estimated Tax:</span>
              <span>${(cartTotal * 0.08).toFixed(2)}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total">
              <strong>Order Total:</strong>
              <strong>${(cartTotal * 1.08).toFixed(2)}</strong>
            </div>
            
            <Link to="/checkout" className="btn-checkout">
              Proceed to Checkout
            </Link>
            
            {/* Promo code - TODO: Implement in backend */}
            <div className="promo-section">
              <input type="text" placeholder="Enter promo code" />
              <button className="btn-apply">Apply</button>
            </div>
            
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
