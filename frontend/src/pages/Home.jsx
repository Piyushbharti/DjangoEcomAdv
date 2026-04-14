import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import axiosInstance from '../api/axios';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
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
      const [productsRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/store/getAllProduct/'),
        axiosInstance.get('/category/getAllCategory/'),
      ]);

      if (productsRes.data.status === 200) {
        setProducts(productsRes.data.data);
        // Set featured products (first 8)
        setFeaturedProducts(productsRes.data.data.slice(0, 8));
      }

      if (categoriesRes.data.status === 200) {
        setCategories(categoriesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    </div>
  );
};

export default Home;
