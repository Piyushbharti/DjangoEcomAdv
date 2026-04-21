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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

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
        setGroupedVariations(p.variations || {});
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVariationSelect = (category, variationId) => {
    setSelectedVariations(prev => ({
      ...prev,
      [category]: Number(variationId)
    }));
  };

  const handleAddToCart = async () => {
    const variationIds = Object.values(selectedVariations);

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

  const handleAddToWishlist = async () => {
    try {
      const response = await axiosInstance.post(`/wishlist/addToWishlist/${product.id}/`);
      if (response.data.status === 200 || response.data.status === 201) {
        setIsWishlisted(true);
        alert(response.data.message || 'Added to wishlist!');
      } else {
        alert(response.data.message || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist');
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

            {/* Variations */}
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
          
          {/* Rating Summary */}
          <div className="reviews-summary">
            <div className="rating-overview">
              <div className="rating-big">
                <span className="rating-number">4.2</span>
                <div className="rating-stars-big">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < 4 ? '#FFA41C' : 'none'} stroke={i < 4 ? '#FFA41C' : '#ccc'} />
                  ))}
                </div>
                <span className="rating-total">Based on 24 reviews</span>
              </div>
              
              {/* Rating Bars */}
              <div className="rating-bars">
                {[
                  { stars: 5, percent: 60, count: 14 },
                  { stars: 4, percent: 25, count: 6 },
                  { stars: 3, percent: 8, count: 2 },
                  { stars: 2, percent: 4, count: 1 },
                  { stars: 1, percent: 3, count: 1 },
                ].map(bar => (
                  <div key={bar.stars} className="rating-bar-row">
                    <span className="bar-label">{bar.stars} star</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${bar.percent}%` }}></div>
                    </div>
                    <span className="bar-count">{bar.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Write Review Form */}
          <div className="write-review">
            <h3>Write a Review</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert('Backend not connected yet!'); }}>
              
              {/* Name */}
              <div className="review-field">
                <label>Your Name</label>
                <input type="text" placeholder="Enter your name" required />
              </div>

              {/* Email */}
              <div className="review-field">
                <label>Email</label>
                <input type="email" placeholder="Enter your email" required />
              </div>

              {/* Star Rating */}
              <div className="review-field">
                <label>Rating</label>
                <div className="star-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={28}
                      className="star-clickable"
                      fill="none"
                      stroke="#FFA41C"
                    />
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="review-field">
                <label>Review Title</label>
                <input type="text" placeholder="Give your review a title" required />
              </div>

              {/* Review Body */}
              <div className="review-field">
                <label>Your Review</label>
                <textarea rows="4" placeholder="Write your review here..." required></textarea>
              </div>

              {/* Image Upload */}
              <div className="review-field">
                <label>Add Photos (optional)</label>
                <input type="file" accept="image/*" multiple />
              </div>

              <button type="submit" className="btn-submit-review">Submit Review</button>
            </form>
          </div>

          {/* Dummy Reviews List */}
          <div className="reviews-list">
            {[
              {
                id: 1,
                name: 'Rahul S.',
                rating: 5,
                title: 'Amazing product!',
                comment: 'Quality is great, fits perfectly. Delivery was on time. Highly recommended!',
                date: '15 Apr 2026',
                helpful: 12,
              },
              {
                id: 2,
                name: 'Priya M.',
                rating: 4,
                title: 'Good but could be better',
                comment: 'Product is nice, material is good. But the color was slightly different from the image. Overall satisfied.',
                date: '10 Apr 2026',
                helpful: 5,
              },
              {
                id: 3,
                name: 'Amit K.',
                rating: 3,
                title: 'Average quality',
                comment: 'Expected better for this price. Stitching could be improved. Packaging was good though.',
                date: '5 Apr 2026',
                helpful: 3,
              },
            ].map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">{review.name.charAt(0)}</div>
                    <div>
                      <strong>{review.name}</strong>
                      <span className="review-date">{review.date}</span>
                    </div>
                  </div>
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? '#FFA41C' : 'none'} stroke={i < review.rating ? '#FFA41C' : '#ccc'} />
                    ))}
                  </div>
                </div>
                <h4 className="review-title">{review.title}</h4>
                <p className="review-comment">{review.comment}</p>
                <div className="review-footer">
                  <button className="btn-helpful">👍 Helpful ({review.helpful})</button>
                  <button className="btn-report">Report</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
