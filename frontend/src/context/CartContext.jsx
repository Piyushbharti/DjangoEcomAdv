import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get('/cart/allCartItem/');
      if (response.data.status === 200) {
        setCartItems(response.data.cart_items || []);
        setCartCount(response.data.quantity || 0);
        setCartTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId, variations = []) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/cart/addProduct/${productId}/`, {
        variations_id: variations,
      });
      if (response.data.status === 200) {
        await fetchCart();
        return { success: true, message: 'Added to cart!' };
      }
      return { success: false, message: 'Failed to add to cart' };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axiosInstance.get(`/cart/removeCartItem/${productId}/`);
      if (response.data.status === 200) {
        await fetchCart();
        return { success: true };
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false };
    }
  };

  const deleteFromCart = async (productId) => {
    try {
      const response = await axiosInstance.get(`/cart/deleteCartItem/${productId}/`);
      if (response.data.status === 200) {
        await fetchCart();
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting from cart:', error);
      return { success: false };
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        removeFromCart,
        deleteFromCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
