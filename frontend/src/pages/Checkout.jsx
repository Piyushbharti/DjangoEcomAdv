import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.first_name + ' ' + user?.last_name || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    phone: user?.phone_number || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    card_number: '',
    card_name: '',
    expiry_date: '',
    cvv: '',
  });

  const [loading, setLoading] = useState(false);

  const handleShippingChange = (e) => {
    setShippingAddress(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCardChange = (e) => {
    setCardDetails(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement order placement API
    // Backend endpoint needed: POST /orders/create/
    try {
      // const response = await axiosInstance.post('/orders/create/', {
      //   shipping_address: shippingAddress,
      //   payment_method: paymentMethod,
      //   items: cartItems,
      // });
      
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = 0; // Free shipping
  const tax = cartTotal * 0.08;
  const total = cartTotal + shippingCost + tax;

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-layout">
          <div className="checkout-main">
            {/* Shipping Address */}
            <section className="checkout-section">
              <h2>1. Shipping Address</h2>
              <form className="address-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={shippingAddress.full_name}
                    onChange={handleShippingChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address Line 1</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={shippingAddress.address_line1}
                    onChange={handleShippingChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    name="address_line2"
                    value={shippingAddress.address_line2}
                    onChange={handleShippingChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={shippingAddress.postal_code}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </form>
            </section>

            {/* Payment Method */}
            <section className="checkout-section">
              <h2>2. Payment Method</h2>
              
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Credit or Debit Card</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>PayPal</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>

              {paymentMethod === 'card' && (
                <div className="card-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="card_number"
                      value={cardDetails.card_number}
                      onChange={handleCardChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Name on Card</label>
                    <input
                      type="text"
                      name="card_name"
                      value={cardDetails.card_name}
                      onChange={handleCardChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiry_date"
                        value={cardDetails.expiry_date}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Review Items */}
            <section className="checkout-section">
              <h2>3. Review Items</h2>
              <div className="checkout-items">
                {cartItems.map(item => (
                  <div key={item.product_id} className="checkout-item">
                    <img src={item.image || '/placeholder.jpg'} alt={item.product_name} />
                    <div className="item-details">
                      <h4>{item.product_name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p className="item-price">${item.subtotal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <aside className="checkout-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Items ({cartItems.length}):</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping:</span>
              <span className="free-text">FREE</span>
            </div>

            <div className="summary-row">
              <span>Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <strong>Order Total:</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>

            <button 
              className="btn-place-order"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              <Lock size={18} />
              {loading ? 'Processing...' : 'Place Order'}
            </button>

            <p className="secure-text">
              Your transaction is secure and encrypted
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
