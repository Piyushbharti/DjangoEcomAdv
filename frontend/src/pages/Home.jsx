import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FlashSaleCard from '../components/FlashSaleCard';
import CountdownTimer from '../components/CountdownTimer';
import RecentlyViewed from '../components/RecentlyViewed';
import axiosInstance from '../api/axios';
import {
  SALE_STATE,
  getSaleState,
  flattenSaleProducts,
  sortSaleProducts,
} from '../utils/flashSale';

const HOME_FLASH_LIMIT = 4;

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 1,
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on selected items',
      image: '/banner1.jpg',
      link: '/deals',
    },
    {
      id: 2,
      title: 'New Arrivals',
      subtitle: 'Check out the latest products',
      image: '/banner2.jpg',
      link: '/new-arrivals',
    },
    {
      id: 3,
      title: 'Electronics Sale',
      subtitle: 'Best deals on electronics',
      image: '/banner3.jpg',
      link: '/category/electronics',
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, flashSalesRes] = await Promise.all([
        axiosInstance.get('/store/getAllProduct/'),
        axiosInstance.get('/category/getAllCategory/'),
        axiosInstance.get('/sale/getActiveSales/'),
      ]);

      if (productsRes.data.status === 200) {
        setProducts(productsRes.data.data);
        // Set featured products (first 8)
        setFeaturedProducts(productsRes.data.data.slice(0, 8));
      }

      if (categoriesRes.data.status === 200) {
        setCategories(categoriesRes.data.data);
      }

      if (flashSalesRes.data.status === 200) {
        setFlashSales(flashSalesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Home par sirf live deals dikhao, sabse badi discount pehle
  const liveDeals = useMemo(() => {
    const live = flattenSaleProducts(flashSales).filter(
      (item) => getSaleState(item) === SALE_STATE.LIVE
    );
    return sortSaleProducts(live, 'discount').slice(0, HOME_FLASH_LIMIT);
  }, [flashSales]);

  const nextEnding = useMemo(() => {
    if (!liveDeals.length) return null;
    return [...liveDeals].sort(
      (a, b) => new Date(a.end_date) - new Date(b.end_date)
    )[0];
  }, [liveDeals]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <section className="hero-carousel">
        <div className="carousel-container">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="carousel-content">
                <h2>{banner.title}</h2>
                <p>{banner.subtitle}</p>
                <Link to={banner.link} className="btn-primary">
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
          <button className="carousel-btn prev" onClick={prevSlide}>
            <ChevronLeft size={32} />
          </button>
          <button className="carousel-btn next" onClick={nextSlide}>
            <ChevronRight size={32} />
          </button>
          <div className="carousel-indicators">
            {banners.map((_, index) => (
              <button
                key={index}
                className={index === currentSlide ? 'active' : ''}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="category-card"
              >
                <img src={`http://127.0.0.1:8000${category.cat_image}`} alt={category.category_name} />
                <h3>{category.category_name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sales */}
      {liveDeals.length > 0 && (
        <section className="flash-sales-section">
          <div className="container">
            <div className="flash-home-header">
              <div className="flash-home-title">
                <h2>
                  <Zap size={26} fill="currentColor" /> Flash Sales
                </h2>
                <span className="sale-badge">Limited Time Only!</span>
              </div>
              <div className="flash-home-actions">
                {nextEnding && (
                  <CountdownTimer
                    targetDate={nextEnding.end_date}
                    label="Ends in"
                    size="md"
                  />
                )}
                <Link to="/flash-sales" className="flash-home-link">
                  View all deals
                </Link>
              </div>
            </div>

            <div className="fs-grid">
              {liveDeals.map((item) => (
                <FlashSaleCard key={`${item.saleId}-${item.id}`} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all">View All</Link>
          </div>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Deals Section */}
      <section className="deals-section">
        <div className="container">
          <h2>Today's Deals</h2>
          <div className="deals-grid">
            <div className="deal-card large">
              <h3>Electronics Sale</h3>
              <p>Up to 40% off</p>
              <Link to="/category/electronics" className="btn-secondary">Shop Now</Link>
            </div>
            <div className="deal-card">
              <h3>Fashion</h3>
              <p>New Arrivals</p>
              <Link to="/category/fashion" className="btn-secondary">Explore</Link>
            </div>
            <div className="deal-card">
              <h3>Home & Kitchen</h3>
              <p>Best Sellers</p>
              <Link to="/category/home" className="btn-secondary">Discover</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bestsellers-section">
        <div className="container">
          <h2>Best Sellers</h2>
          <div className="products-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <RecentlyViewed />
      </div>
    </div>
  );
};

export default Home;
