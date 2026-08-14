import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, RefreshCw, AlertCircle, Tag, Timer } from 'lucide-react';
import axiosInstance from '../api/axios';
import FlashSaleCard from '../components/FlashSaleCard';
import CountdownTimer from '../components/CountdownTimer';
import {
  SALE_STATE,
  getSaleState,
  getDiscountPercent,
  flattenSaleProducts,
  sortSaleProducts,
  SORT_OPTIONS,
} from '../utils/flashSale';

const TABS = [
  { key: SALE_STATE.LIVE, label: 'Live Now', icon: Zap },
  { key: SALE_STATE.UPCOMING, label: 'Upcoming', icon: Clock },
  { key: SALE_STATE.ENDED, label: 'Ended', icon: Timer },
];

const FlashSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(SALE_STATE.LIVE);
  const [sortBy, setSortBy] = useState('discount');
  // Timer khatam hone par list dobara evaluate karne ke liye
  const [tick, setTick] = useState(0);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axiosInstance.get('/sale/getActiveSales/');

      if (data.status === 200) {
        setSales(data.data || []);
      } else {
        // Backend 404 status bhejta hai jab koi active sale nahi hoti
        setSales([]);
      }
    } catch (err) {
      console.error('Error fetching flash sales:', err);
      setError('We could not load the flash sales. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleExpire = useCallback(() => setTick((t) => t + 1), []);

  const allProducts = useMemo(() => flattenSaleProducts(sales), [sales]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const grouped = useMemo(() => {
    const buckets = {
      [SALE_STATE.LIVE]: [],
      [SALE_STATE.UPCOMING]: [],
      [SALE_STATE.ENDED]: [],
    };
    allProducts.forEach((item) => buckets[getSaleState(item)].push(item));
    return buckets;
  }, [allProducts, tick]);

  const visibleProducts = useMemo(
    () => sortSaleProducts(grouped[activeTab], sortBy),
    [grouped, activeTab, sortBy]
  );

  // Sale name ke hisaab se sections banao
  const sections = useMemo(() => {
    const map = new Map();
    visibleProducts.forEach((item) => {
      if (!map.has(item.saleId)) {
        map.set(item.saleId, { id: item.saleId, name: item.saleName, items: [] });
      }
      map.get(item.saleId).items.push(item);
    });
    return [...map.values()];
  }, [visibleProducts]);

  const liveItems = grouped[SALE_STATE.LIVE];
  const bestDiscount = liveItems.reduce(
    (max, item) => Math.max(max, getDiscountPercent(item)),
    0
  );
  const nextEnding = liveItems.reduce((soonest, item) => {
    if (!soonest) return item;
    return new Date(item.end_date) < new Date(soonest.end_date) ? item : soonest;
  }, null);

  if (loading) {
    return (
      <div className="flash-page">
        <div className="flash-hero">
          <div className="container">
            <h1>
              <Zap size={30} fill="currentColor" /> Flash Sales
            </h1>
            <p>Loading the hottest deals...</p>
          </div>
        </div>
        <div className="container">
          <div className="fs-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="fs-skeleton">
                <div className="fs-skeleton-media" />
                <div className="fs-skeleton-line w-70" />
                <div className="fs-skeleton-line w-40" />
                <div className="fs-skeleton-line w-90" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flash-page">
        <div className="container">
          <div className="fs-message">
            <AlertCircle size={48} />
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchSales}>
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flash-page">
      {/* Hero */}
      <section className="flash-hero">
        <div className="container">
          <div className="flash-hero-content">
            <div>
              <h1>
                <Zap size={30} fill="currentColor" /> Flash Sales
              </h1>
              <p>Limited-time prices. Once the timer hits zero, the deal is gone.</p>
            </div>

            {nextEnding && (
              <div className="flash-hero-timer">
                <span className="flash-hero-timer-title">Next deal ends in</span>
                <CountdownTimer
                  targetDate={nextEnding.end_date}
                  size="lg"
                  onComplete={handleExpire}
                />
              </div>
            )}
          </div>

          <div className="flash-stats">
            <div className="flash-stat">
              <Zap size={18} />
              <div>
                <strong>{liveItems.length}</strong>
                <span>Live deals</span>
              </div>
            </div>
            <div className="flash-stat">
              <Tag size={18} />
              <div>
                <strong>{bestDiscount}%</strong>
                <span>Biggest discount</span>
              </div>
            </div>
            <div className="flash-stat">
              <Clock size={18} />
              <div>
                <strong>{grouped[SALE_STATE.UPCOMING].length}</strong>
                <span>Starting soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Filters */}
        <div className="flash-toolbar">
          <div className="flash-tabs">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`flash-tab ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                <Icon size={16} />
                {label}
                <span className="flash-tab-count">{grouped[key].length}</span>
              </button>
            ))}
          </div>

          <div className="flash-sort">
            <label htmlFor="fs-sort">Sort by</label>
            <select
              id="fs-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button className="fs-refresh" onClick={fetchSales} title="Refresh deals">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Product sections */}
        {sections.length > 0 ? (
          sections.map((section) => (
            <section key={section.id} className="flash-section">
              <div className="flash-section-header">
                <h2>{section.name}</h2>
                <span className="flash-section-count">
                  {section.items.length} {section.items.length === 1 ? 'product' : 'products'}
                </span>
              </div>
              <div className="fs-grid">
                {section.items.map((item) => (
                  <FlashSaleCard
                    key={`${item.saleId}-${item.id}`}
                    item={item}
                    onExpire={handleExpire}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="fs-message">
            <Zap size={48} />
            <h2>
              {activeTab === SALE_STATE.LIVE
                ? 'No live deals right now'
                : activeTab === SALE_STATE.UPCOMING
                ? 'No upcoming deals scheduled'
                : 'No expired deals'}
            </h2>
            <p>
              {activeTab === SALE_STATE.LIVE
                ? 'Check the upcoming tab or browse our full catalogue in the meantime.'
                : 'New flash sales are added regularly — keep an eye on this page.'}
            </p>
            <Link to="/products" className="btn-primary">
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashSales;
