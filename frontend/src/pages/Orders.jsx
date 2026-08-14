import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import axiosInstance from '../api/axios';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/orders/my-orders/');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackOrder = async (orderNumber) => {
    if (trackingOrder === orderNumber) {
      setTrackingOrder(null);
      setTrackingData(null);
      return;
    }
    try {
      setTrackingLoading(true);
      setTrackingOrder(orderNumber);
      const response = await axiosInstance.get(`/orders/track/${orderNumber}/`);
      if (response.data.status === 200) {
        setTrackingData(response.data);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="status-icon delivered" />;
      case 'shipped':
      case 'out_for_delivery':
        return <Truck className="status-icon shipped" />;
      case 'processing':
      case 'confirmed':
        return <Package className="status-icon processing" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="status-icon cancelled" />;
      default:
        return <Clock className="status-icon" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      paid: 'Paid',
    };
    return labels[status] || status;
  };

  const getStepIndex = (status) => {
    if (status === 'cancelled' || status === 'refunded') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  return (
    <div className="orders-page">
      <div className="container">
        <h1>Your Orders</h1>

        <div className="orders-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Orders
          </button>
          <button
            className={filter === 'processing' ? 'active' : ''}
            onClick={() => setFilter('processing')}
          >
            Processing
          </button>
          <button
            className={filter === 'shipped' ? 'active' : ''}
            onClick={() => setFilter('shipped')}
          >
            Shipped
          </button>
          <button
            className={filter === 'delivered' ? 'active' : ''}
            onClick={() => setFilter('delivered')}
          >
            Delivered
          </button>
          <button
            className={filter === 'cancelled' ? 'active' : ''}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders">
            <Package size={64} />
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet</p>
            <Link to="/" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>{order.order_number}</h3>
                    <p>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="order-status">
                    {getStatusIcon(order.status)}
                    <span className={`status-text ${order.status}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-details">
                        <h4>{item.product_name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p className="item-price">₹{item.product_price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Tracking Timeline */}
                {trackingOrder === order.order_number && (
                  <div className="order-tracking">
                    {trackingLoading ? (
                      <div className="tracking-loading">Loading tracking info...</div>
                    ) : trackingData ? (
                      <>
                        {/* Progress Bar */}
                        {order.status !== 'cancelled' && order.status !== 'refunded' && (
                          <div className="tracking-progress">
                            {STATUS_STEPS.map((step, index) => (
                              <div
                                key={step}
                                className={`progress-step ${index <= getStepIndex(trackingData.current_status) ? 'completed' : ''} ${step === trackingData.current_status ? 'current' : ''}`}
                              >
                                <div className="step-dot"></div>
                                <span className="step-label">{getStatusLabel(step)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Status History */}
                        <div className="tracking-history">
                          <h4>Status History</h4>
                          {trackingData.tracking_history.map((entry, index) => (
                            <div key={index} className="history-entry">
                              <div className="history-dot"></div>
                              <div className="history-content">
                                <strong>{getStatusLabel(entry.status)}</strong>
                                {entry.note && <p>{entry.note}</p>}
                                <span className="history-time">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total: ₹{order.total}</strong>
                  </div>
                  <div className="order-actions">
                    <button
                      className="btn-track"
                      onClick={() => trackOrder(order.order_number)}
                    >
                      {trackingOrder === order.order_number ? 'Hide Tracking' : 'Track Order'}
                    </button>
                    {order.status === 'delivered' && (
                      <button className="btn-review">Write Review</button>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button className="btn-cancel">Cancel Order</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
