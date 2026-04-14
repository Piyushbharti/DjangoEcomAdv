import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import axiosInstance from '../api/axios';

const Products = () => {
  const [searchParams] = useSearchParams();
  const { categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    rating: '',
    inStock: false,
    freeShipping: false,
    prime: false,
  });
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [categorySlug, searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const keyword = searchParams.get('q');
      let url = '/store/getAllProduct/';
      
      if (keyword) {
        url = `/store/search/?keyword=${keyword}`;
      } else if (categorySlug) {
        url = `/store/productBySlug/${categorySlug}`;
      }
      
      const response = await axiosInstance.get(url);
      if (response.data.status === 200) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    // TODO: Implement sorting logic
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: false,
      freeShipping: false,
      prime: false,
    });
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>
            {searchParams.get('q') 
              ? `Search results for "${searchParams.get('q')}"` 
              : categorySlug 
                ? categorySlug.replace('-', ' ').toUpperCase()
                : 'All Products'}
          </h1>
          <p className="results-count">{products.length} results</p>
        </div>

        <div className="products-controls">
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
          </button>

          <div className="sort-dropdown">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="filters-sidebar">
              <div className="filters-header">
                <h3>Filters</h3>
                <button onClick={clearFilters}>Clear All</button>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>

              {/* Customer Rating */}
              <div className="filter-group">
                <h4>Customer Rating</h4>
                {[4, 3, 2, 1].map(rating => (
                  <label key={rating} className="filter-checkbox">
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      checked={filters.rating === rating.toString()}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                    />
                    <span>{rating} Stars & Up</span>
                  </label>
                ))}
              </div>

              {/* Availability */}
              <div className="filter-group">
                <h4>Availability</h4>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              {/* Shipping Options */}
              <div className="filter-group">
                <h4>Shipping Options</h4>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.freeShipping}
                    onChange={(e) => handleFilterChange('freeShipping', e.target.checked)}
                  />
                  <span>Free Shipping</span>
                </label>
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.prime}
                    onChange={(e) => handleFilterChange('prime', e.target.checked)}
                  />
                  <span>Prime Eligible</span>
                </label>
              </div>

              {/* Brand - TODO: Implement in backend */}
              <div className="filter-group">
                <h4>Brand</h4>
                <p className="coming-soon">Coming soon</p>
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <div className="products-content">
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="no-results">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination - TODO: Implement */}
            {products.length > 0 && (
              <div className="pagination">
                <button disabled>Previous</button>
                <button className="active">1</button>
                <button>2</button>
                <button>3</button>
                <button>Next</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
