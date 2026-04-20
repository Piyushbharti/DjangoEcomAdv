import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { API_BASE_URL } from '../api/axios';

const ProductCard = ({ product }) => {
  const { addToCart, loading } = useCart();
  const { isInWishlist, addToWishlist } = useWishlist();
  
  // Check if product is already in wishlist
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const result = await addToCart(product.id);
    if (result.success) {
      alert(result.message);
    }
  };

  // Wishlist API call
  const handleWishlist = async (e) => {
    e.preventDefault();
    const result = await addToWishlist(product.id);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message || 'Failed to add to wishlist');
    }
  };

  // Calculate discount percentage if needed
  const discountPercent = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="product-link">
        <div className="product-image-wrapper">
          <img 
            src={product.image ? `${API_BASE_URL}${product.image}` : '/placeholder.jpg'} 
            alt={product.product_name}
            className="product-image"
          />
          {discountPercent > 0 && (
            <span className="discount-badge">-{discountPercent}%</span>
          )}
          <button 
            className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
          >
            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.product_name}</h3>
          
          {/* Rating - TODO: Implement in backend */}
          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < (product.rating || 4) ? '#FFA41C' : 'none'}
                  stroke={i < (product.rating || 4) ? '#FFA41C' : '#ccc'}
                />
              ))}
            </div>
            <span className="rating-count">({product.review_count || 0})</span>
          </div>

          <div className="product-pricing">
            <span className="current-price">${product.price}</span>
            {product.original_price && (
              <span className="original-price">${product.original_price}</span>
            )}
          </div>

          {/* Stock status */}
          {product.stock < 10 && product.stock > 0 && (
            <p className="stock-warning">Only {product.stock} left in stock</p>
          )}
          {product.stock === 0 && (
            <p className="out-of-stock">Out of Stock</p>
          )}

          {/* Prime badge - TODO: Implement in backend */}
          {product.is_prime && (
            <span className="prime-badge">Prime</span>
          )}

          {/* Free shipping - TODO: Implement in backend */}
          {product.free_shipping && (
            <p className="free-shipping">FREE Shipping</p>
          )}
        </div>
      </Link>

      <button 
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={loading || product.stock === 0}
      >
        <ShoppingCart size={18} />
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default ProductCard;
