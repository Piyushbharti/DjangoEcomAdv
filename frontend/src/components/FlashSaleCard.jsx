import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Zap, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from './Toast';
import CountdownTimer from './CountdownTimer';
import { API_BASE_URL } from '../api/axios';
import {
  SALE_STATE,
  getSaleState,
  getTargetDate,
  getSalePrice,
  getOriginalPrice,
  getDiscountPercent,
  getSavings,
  formatPrice,
} from '../utils/flashSale';

const LOW_STOCK_LIMIT = 20;

const FlashSaleCard = ({ item, onExpire }) => {
  const product = item.product || {};
  const { addToCart, loading } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [animating, setAnimating] = useState(false);

  const state = getSaleState(item);
  const isLive = state === SALE_STATE.LIVE;
  const isUpcoming = state === SALE_STATE.UPCOMING;
  const outOfStock = product.stock === 0 || product.is_available === false;
  const discount = getDiscountPercent(item);
  const wishlisted = isInWishlist(product.id);

  const image =
    product.image_url ||
    (product.image ? `${API_BASE_URL}${product.image}` : '/placeholder.jpg');

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAdding(true);
    const result = await addToCart(product.id);
    setAdding(false);
    showToast(
      result.success ? `${product.product_name} added to cart!` : 'Could not add to cart',
      result.success ? 'success' : 'error'
    );
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    const result = wishlisted
      ? await removeFromWishlist(product.id)
      : await addToWishlist(product.id);

    showToast(
      result?.message || (wishlisted ? 'Removed from wishlist' : 'Added to wishlist'),
      result?.success === false ? 'error' : 'success'
    );
  };

  return (
    <div className={`fs-card fs-card-${state}`}>
      <Link to={`/product/${product.slug}`} className="fs-card-link">
        <div className="fs-card-media">
          <img src={image} alt={product.product_name} loading="lazy" />

          {discount > 0 && <span className="fs-discount-badge">-{discount}%</span>}

          <span className={`fs-state-pill fs-state-${state}`}>
            {isLive && (
              <>
                <Zap size={12} fill="currentColor" /> Live
              </>
            )}
            {isUpcoming && (
              <>
                <Clock size={12} /> Upcoming
              </>
            )}
            {state === SALE_STATE.ENDED && 'Ended'}
          </span>

          <button
            type="button"
            className={`fs-wishlist-btn ${wishlisted ? 'active' : ''} ${animating ? 'heart-pop' : ''}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          {state !== SALE_STATE.ENDED && (
            <div className="fs-card-timer">
              <CountdownTimer
                targetDate={getTargetDate(item, state)}
                label={isUpcoming ? 'Starts in' : 'Ends in'}
                size="sm"
                onComplete={onExpire}
              />
            </div>
          )}
        </div>

        <div className="fs-card-body">
          {item.saleName && <span className="fs-sale-tag">{item.saleName}</span>}
          <h4 className="fs-card-title">{product.product_name}</h4>

          <div className="fs-price-row">
            <span className="fs-price">{formatPrice(getSalePrice(item))}</span>
            {discount > 0 && (
              <span className="fs-price-original">{formatPrice(getOriginalPrice(item))}</span>
            )}
          </div>

          {discount > 0 && (
            <p className="fs-savings">You save {formatPrice(getSavings(item))}</p>
          )}

          {!outOfStock && product.stock <= LOW_STOCK_LIMIT && (
            <div className="fs-stock">
              <div className="fs-stock-bar">
                <span
                  style={{
                    width: `${Math.max((product.stock / LOW_STOCK_LIMIT) * 100, 8)}%`,
                  }}
                />
              </div>
              <span className="fs-stock-text">Only {product.stock} left</span>
            </div>
          )}
          {outOfStock && <p className="fs-out-of-stock">Out of stock</p>}
        </div>
      </Link>

      <button
        className="fs-add-btn"
        onClick={handleAddToCart}
        disabled={!isLive || outOfStock || adding || loading}
      >
        <ShoppingCart size={16} />
        {outOfStock
          ? 'Out of Stock'
          : isUpcoming
          ? 'Not started yet'
          : state === SALE_STATE.ENDED
          ? 'Sale ended'
          : adding
          ? 'Adding...'
          : 'Add to Cart'}
      </button>
    </div>
  );
};

export default FlashSaleCard;
