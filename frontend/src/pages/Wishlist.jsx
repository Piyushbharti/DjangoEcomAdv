import { useState, useEffect } from 'react';
import { Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../components/Toast';
import axiosInstance, { API_BASE_URL } from '../api/axios';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const { addToCart } = useCart();
  const { removeFromWishlist, clearWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/wishlist/all/');
      setWishlistItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    const result = await removeFromWishlist(productId);
    if (result.success) {
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
    }
  };

  const handleClearAll = async () => {
    setShowConfirm(true);
  };

  const confirmClearAll = async () => {
    setShowConfirm(false);
    const result = await clearWishlist();
    if (result.success) {
      setWishlistItems([]);
      showToast('Wishlist cleared!', 'success');
    } else {
      showToast('Failed to clear wishlist', 'error');
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId);
    if (result.success) {
      showToast('Added to cart!', 'success');
    }
  };

  if (loading) {
    return <div className="loading-page">Loading wishlist...</div>;
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <h1>My Wishlist</h1>

        {wishlistItems.length > 0 && (
          <button className="btn-clear-wishlist" onClick={handleClearAll}>
            <Trash2 size={16} />
            Clear All
          </button>
        )}

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <h3>Your wishlist is empty</h3>
            <p>Save items you love for later</p>
            <Link to="/" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map(item => (
              <div key={item.id} className="wishlist-item">
                <Link to={`/product/${item.slug}`}>
                  <img src={`${API_BASE_URL}${item.image}`} alt={item.product_name} />
                </Link>
                <div className="item-info">
                  <Link to={`/product/${item.slug}`}>
                    <h3>{item.product_name}</h3>
                  </Link>
                  <p className="price">₹{item.price}</p>
                  {item.in_stock ? (
                    <p className="in-stock">In Stock</p>
                  ) : (
                    <p className="out-of-stock">Out of Stock</p>
                  )}
                </div>
                <div className="item-actions">
                  <button 
                    className="btn-add-to-cart"
                    onClick={() => handleAddToCart(item.product_id)}
                    disabled={!item.in_stock}
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button 
                    className="btn-remove"
                    onClick={() => handleRemove(item.product_id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Popup */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Clear Wishlist?</h3>
            <p>All items will be removed. This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-confirm-delete" onClick={confirmClearAll}>Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
