import { useState, useEffect } from 'react';
import { Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axiosInstance from '../api/axios';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      // TODO: Implement backend endpoint: GET /wishlist/
      // const response = await axiosInstance.get('/wishlist/');
      // setWishlistItems(response.data.items || []);
      
      // Mock data for now
      setWishlistItems([]);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    // TODO: Implement backend endpoint: DELETE /wishlist/{id}/
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId);
    if (result.success) {
      alert('Added to cart!');
    }
  };

  if (loading) {
    return <div className="loading-page">Loading wishlist...</div>;
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <h1>My Wishlist</h1>

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
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="item-info">
                  <Link to={`/product/${item.slug}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p className="price">${item.price}</p>
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
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
