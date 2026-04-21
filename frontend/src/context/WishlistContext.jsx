import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

// Context banao
const WishlistContext = createContext();

// Provider component
export const WishlistProvider = ({ children }) => {
  // Wishlist mein jo product IDs hain
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // App load hote hi wishlist fetch karo
  useEffect(() => {
    fetchAllWishlistData();
  }, []);

  // GET all wishlist items
  const fetchAllWishlistData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/wishlist/all/');
      
      // Sirf product IDs nikalo
      const ids = response.data.data.map(item => item.product_id);
      setWishlistIds(ids);
      console.log('Wishlist IDs loaded:', ids);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check karo product wishlist mein hai ya nahi
  const isInWishlist = (productId) => {
    return wishlistIds.includes(productId);
  };

  // Wishlist mein add karo
  const addToWishlist = async (productId) => {
    try {
      const response = await axiosInstance.post(`/wishlist/addToWishlist/${productId}/`);
      
      if (response.data.status === 200 || response.data.status === 201) {
        // Local state update karo
        setWishlistIds(prev => [...prev, productId]);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: 'Failed to add to wishlist' };
    }
  };

  // Wishlist se remove karo
  const removeFromWishlist = async (productId) => {
    try {
      console.log('Deleting wishlist item, product_id:', productId);
      const response = await axiosInstance.post(`/wishlist/deleteWishlist/${productId}/`);
      
      // Local state se remove karo
      setWishlistIds(prev => prev.filter(id => id !== productId));
      return { success: true, message: response.data.message || 'Removed!' };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      console.error('Response:', error.response?.data);
      return { success: false, message: 'Failed to remove from wishlist' };
    }
  };

  // Poori wishlist clear karo
  const clearWishlist = async () => {
    try {
      const response = await axiosInstance.get('/wishlist/dropWishList');
      setWishlistIds([]);
      return { success: true, message: response.data.message || 'Wishlist cleared!' };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { success: false, message: 'Failed to clear wishlist' };
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlistIds,
      loading,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      fetchAllWishlistData
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
