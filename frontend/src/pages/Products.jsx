import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
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
  });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const keyword = searchParams.get('q');

      // If category slug, use category endpoint (no filters)
      if (categorySlug && !keyword) {
        const response = await axiosInstance.get(`/store/productBySlug/${categorySlug}`);
        if (response.data.status === 200) {
          setProducts(response.data.data || []);
          setTotalPages(1);
          setTotalCount(response.data.data?.length || 0);
        }
        return;
      }

      // Use search endpoint with filters
      const params = new URLSearchParams();
      if (keyword) params.append('search', keyword);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', currentPage);

      const response = await axiosInstance.get(`/store/search/?${params.toString()}`);
      if (response.data.status === 200) {
        setProducts(response.data.data || []);
        setTotalPages(response.data.total_pages || 1);
        setTotalCount(response.data.count || 0);
        setCurrentPage(response.data.current_page || 1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, searchParams, filters, sortBy, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page to 1 when filters/sort/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, searchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const clearFilters = () => {
    setFilters({ minPrice: '', maxPrice: '' });
    setSortBy('newest');
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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
          <p className="results-count">{totalCount} results</p>
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
              <option value="newest">Newest Arrivals</option>
              <option value="oldest">Oldest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
