import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import axiosInstance, { API_BASE_URL } from '../api/axios';

// excludeProductId: jis product page pe ho, usko list se hata do
const RecentlyViewed = ({ excludeProductId = null, title = 'Recently Viewed' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecent();
  }, [excludeProductId]);

  const fetchRecent = async () => {
    // Guest user ka koi recent history nahi hai
    if (!localStorage.getItem('access_token')) {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get('/recent/getRecentProducts/');
      if (response.data.status === 200) {
        const list = (response.data.data || []).filter(
          (item) => item.product && item.product.id !== excludeProductId
        );
        setItems(list);
      }
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || items.length === 0) return null;

  return (
    <section className="recently-viewed-section">
      <div className="recently-viewed-header">
        <Clock size={20} />
        <h2>{title}</h2>
      </div>

      <div className="recently-viewed-row">
        {items.map((item) => {
          const product = item.product;
          const image =
            product.image_url ||
            (product.image ? `${API_BASE_URL}${product.image}` : '/placeholder.jpg');

          return (
            <Link
              key={item.id}
              to={`/product/${product.slug}`}
              className="recent-card"
            >
              <div className="recent-card-image">
                <img src={image} alt={product.product_name} />
              </div>
              <div className="recent-card-body">
                <h4>{product.product_name}</h4>
                <span className="recent-card-price">₹{product.price}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RecentlyViewed;
