import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Generate a unique cart ID and store in localStorage
// This way same browser = same cart ID, always
function getCartId() {
  let cartId = localStorage.getItem('cart_id');
  if (!cartId) {
    // Generate random ID (like a session key)
    cartId = 'cart_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('cart_id', cartId);
  }
  return cartId;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach cart_id header to EVERY request automatically
axiosInstance.interceptors.request.use((config) => {
  config.headers['X-Cart-Id'] = getCartId();
  return config;
});

export default axiosInstance;
export { API_BASE_URL, getCartId };
