import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, Heart, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`);
    }
  };

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="location">
              <MapPin size={16} />
              <span>Deliver to New York 10001</span>
            </div>
            <div className="header-links">
              <Link to="/orders">Returns & Orders</Link>
              <Link to="/customer-service">Customer Service</Link>
              <Link to="/gift-cards">Gift Cards</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <div className="container">
          <div className="header-main-content">
            <Link to="/" className="logo">
              <h1>GreatKart</h1>
            </Link>

            {/* Search Bar */}
            <form className="search-bar" onSubmit={handleSearch}>
              <select className="search-category">
                <option value="">All</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home</option>
                <option value="books">Books</option>
              </select>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <Search size={20} />
              </button>
            </form>

            {/* Right Actions */}
            <div className="header-actions">
              <Link to="/wishlist" className="header-action">
                <Heart size={24} />
                <span>Wishlist</span>
              </Link>

              <div className="header-action account-dropdown">
                <User size={24} />
                <span>{user ? user.first_name : 'Account'}</span>
                <div className="dropdown-menu">
                  {user ? (
                    <>
                      <Link to="/profile">My Profile</Link>
                      <Link to="/orders">My Orders</Link>
                      <Link to="/wishlist">My Wishlist</Link>
                      <Link to="/addresses">My Addresses</Link>
                      <button onClick={logout}>Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login">Login</Link>
                      <Link to="/register">Register</Link>
                    </>
                  )}
                </div>
              </div>

              <Link to="/cart" className="header-action cart-action">
                <div className="cart-icon-wrapper">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </div>
                <span>Cart</span>
              </Link>
            </div>

            <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="header-nav">
        <div className="container">
          <ul className="nav-links">
            <li><Link to="/deals">Today's Deals</Link></li>
            <li><Link to="/category/electronics">Electronics</Link></li>
            <li><Link to="/category/fashion">Fashion</Link></li>
            <li><Link to="/category/home">Home & Kitchen</Link></li>
            <li><Link to="/category/books">Books</Link></li>
            <li><Link to="/category/sports">Sports</Link></li>
            <li><Link to="/new-arrivals">New Arrivals</Link></li>
            <li><Link to="/best-sellers">Best Sellers</Link></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <Link to="/">Home</Link>
          <Link to="/deals">Today's Deals</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          {user ? (
            <>
              <Link to="/profile">Profile</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
