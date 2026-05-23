import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axiosInstance from '../api/axios';

// Apni Stripe publishable key yahan daalo
const stripePromise = loadStripe('pk_test_51TWuNSR1JRf8WLPhzy0DPWEleUf8GAxfrCqopbCejkBLdrvbaWxVSERygMStIfsnvWxwhW3XY2OdDny1uxdEUj1400Q92qWy40');

// ============================================================
//  Payment Form (Stripe CardElement ke saath)
// ============================================================
const PaymentForm = ({ shippingAddress, total, cartItems }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      // Step 1: Backend se client_secret lo
      const { data } = await axiosInstance.post('/payments/create-payment-intent/', {
        amount: Math.round(total * 100),  // dollars to cents
      });

      // Step 2: Stripe se payment confirm karo
      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingAddress.full_name,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Step 3: Order create karo
        await axiosInstance.post('/orders/create/', {
          shipping_address: shippingAddress,
          payment_info: {
            payment_intent_id: result.paymentIntent.id,
            method: 'card',
          },
        });

        alert('Order placed successfully! 🎉');
        navigate('/orders');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="stripe-card-element">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#9e2146' },
            },
          }}
        />
      </div>

      {error && <p className="payment-error">{error}</p>}

      <button
        type="submit"
        className="btn-place-order"
        disabled={!stripe || loading}
      >
        <Lock size={18} />
        {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>

      <p className="secure-text">
        Your transaction is secure and encrypted by Stripe
      </p>
    </form>
  );
};

// ============================================================
//  Checkout Page
// ============================================================
const Checkout = () => {
  const { cartItems, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    full_name: (user?.first_name || '') + ' ' + (user?.last_name || ''),
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    phone: user?.phone_number || '',
  });

  const handleShippingChange = (e) => {
    setShippingAddress(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const shippingCost = 0;
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
              <div className="address-form">
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
              </div>
            </section>

            {/* Payment — Stripe Card Element */}
            <section className="checkout-section">
              <h2>2. Payment</h2>
              <Elements stripe={stripePromise}>
                <PaymentForm
                  shippingAddress={shippingAddress}
                  total={total}
                  cartItems={cartItems}
                />
              </Elements>
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
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
