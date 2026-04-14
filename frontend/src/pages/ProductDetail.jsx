import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axiosInstance, { API_BASE_URL } from '../api/axios';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [groupedVariations, setGroupedVariations] = useState({});
  const [selectedVariations, setSelectedVariations] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  console.log(groupedVariations, "groupedVariations",selectedVariations)
  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/store/productBySlugv2/${slug}`);
      if (response.data.product) {
        const p = response.data.product;
        setProduct(p);
        // API returns variations as { "color": [...], "size": [...] }
        setGroupedVariations(p.variations || {});
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVariationSelect = (category, variationId) => {
    // variationId ko Number mein convert karo — type mismatch avoid karne ke liye
    setSelectedVariations(prev => ({
      ...prev,
      [category]: Number(variationId)
    }));
    console.log("Selected:", category, "→ ID:", variationId);
  };

  const handleAddToCart = async () => {
    // selectedVariations = { "color": 3, "size": 7 }
    // Object.values() = [3, 7]  ← ye IDs backend ko jaayengi
    const variationIds = Object.values(selectedVariations);
    console.log("Sending variation IDs to backend:", variationIds);

    if (variationIds.length === 0) {
      alert("Please select a variation (color, size, etc.) first!");
      return;
    }

    const result = await addToCart(product.id, variationIds);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return <div className="loading-page">Loading product...</div>;
  }

  if (!product) {
    return <div className="error-page">Product not found</div>;
  }

  const images = [product.image, product.image, product.image];
  const hasVariations = Object.keys(groupedVariations).length > 0;

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category_slug}`}>{product.category_name}</Link>
          <span>/</span>
          <span>{product.product_name}</span>
        </div>

        <div className="product-detail-grid">
          {/* Image Gallery */}
          <div className="product-images">
            <div className="image-thumbnails">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={`${API_BASE_URL}${img}`}
                  alt={`${product.product_name} ${index + 1}`}
                  className={activeImage === index ? 'active' : ''}
                  onClick={() => setActiveImage(index)}
                />
              ))}
            </div>
            <div className="main-image">
              <img src={`${API_BASE_URL}${images[activeImage]}`} alt={product.product_name} />
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <h1>{product.product_name}</h1>

            <div className="product-rating-detail">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i < (product.rating || 4) ? '#FFA41C' : 'none'}
                    stroke={i < (product.rating || 4) ? '#FFA41C' : '#ccc'}
                  />
                ))}
              </div>
              <span className="rating-text">{product.rating || 4.0} out of 5</span>
              <span className="review-count">({product.review_count || 0} reviews)</span>
            </div>

            <div className="price-section">
              <span className="current-price">₹{product.price}</span>
              {product.original_price && (
                <>
                  <span className="original-price">₹{product.original_price}</span>
                  <span className="discount-percent">
                    -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                  </span>
                </>
              )}
            </div>

            {product.is_prime && (
              <div className="prime-section">
                <span className="prime-badge-large">Prime</span>
                <span>FREE delivery</span>
              </div>
            )}

            <div className="product-description">
              <h3>About this item</h3>
              <p>{product.description}</p>
            </div>

            {/* Variations — reads the grouped dict from API */}
            {hasVariations && (
              <div className="variations-section">
                {Object.entries(groupedVariations).map(([category, vars]) => (
                  <div key={category} className="variation-group">
                    <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    <div className="variation-options">
                      {vars.map((variation) => (
                        <button
                          key={variation.id}
                          className={`variation-btn ${selectedVariations[category] === Number(variation.id) ? 'selected' : ''}`}
                          onClick={() => handleVariationSelect(category, variation.id)}
                        >
                          {variation.variation_value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="quantity-section">
              <label>Quantity:</label>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
              <span className="stock-info">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                Add to Cart
              </button>
              <button className="btn-buy-now">Buy Now</button>
              <button className="btn-wishlist">
                <Heart size={20} />
              </button>
              <button className="btn-share">
                <Share2 size={20} />
              </button>
            </div>

            {/* Features */}
            <div className="product-features">
              <div className="feature">
                <Truck size={24} />
                <div>
                  <strong>Free Delivery</strong>
                  <p>On orders over ₹500</p>
                </div>
              </div>
              <div className="feature">
                <RotateCcw size={24} />
                <div>
                  <strong>30-Day Returns</strong>
                  <p>Easy return policy</p>
                </div>
              </div>
              <div className="feature">
                <Shield size={24} />
                <div>
                  <strong>Secure Payment</strong>
                  <p>100% secure transactions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="seller-info-card">
            <h3>Sold by</h3>
            <p className="seller-name">{product.seller_name || 'GreatKart'}</p>
            <p className="seller-rating">
              <Star size={16} fill="#FFA41C" stroke="#FFA41C" />
              {product.seller_rating || '4.5'} seller rating
            </p>
            <button className="btn-visit-store">Visit Store</button>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="reviews-section">
          <h2>Customer Reviews</h2>
          <div className="reviews-summary">
            <div className="rating-breakdown">
              <h3>{product.rating || 4.0} out of 5</h3>
              <p>{product.review_count || 0} global ratings</p>
            </div>
          </div>
          <div className="reviews-list">
            <p>Reviews will be displayed here once implemented in backend</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
