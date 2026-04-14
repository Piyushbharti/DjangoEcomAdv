import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../api/axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // TODO: Implement backend endpoint: GET /orders/my-orders/
      // const response = await axiosInstance.get('/orders/my-orders/');
      // setOrders(response.data.orders || []);
      
      // Mock data for now
      setOrders([
        {
          id: 1,
          order_number: 'ORD-2026-001',
          date: '2026-04-10',
          status: 'delivered',
          total: 299.99,
          items: [
            { id: 1, name: 'Product 1', quantity: 2, price: 149.99 }
          ]
        },
        {
          id: 2,
          order_number: 'ORD-2026-002',
          date: '2026-04-12',
          status: 'shipped',
          total: 89.99,
          items: [
            { id: 2, name: 'Product 2', quantity: 1, price: 89.99 }
          ]
        }
      ]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="status-icon delivered" />;
      case 'shipped':
        return <Truck className="status-icon shipped" />;
      case 'processing':
        return <Package className="status-icon processing" />;
      case 'cancelled':
        return <XCircle className="status-icon cancelled" />;
      default:
        return <Package className="status-icon" />;
    }
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
                    <p>Placed on {new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="order-status">
                    {getStatusIcon(order.status)}
                    <span className={`status-text ${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map(item => (
                    <div key={item.id} className="order-item">
                      <img src="/placeholder.jpg" alt={item.name} />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p className="item-price">${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total: ${order.total}</strong>
                  </div>
                  <div className="order-actions">
                    <Link to={`/orders/${order.id}`} className="btn-view">
                      View Details
                    </Link>
                    {order.status === 'delivered' && (
                      <button className="btn-review">Write Review</button>
                    )}
                    {order.status === 'processing' && (
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
