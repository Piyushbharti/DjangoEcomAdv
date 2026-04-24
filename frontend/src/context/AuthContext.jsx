import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // TODO: Implement these endpoints in Django backend
  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/accounts/login/', {
        email,
        password,
      });
      if (response.data.status === 200) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Tokens save karo — baad me authenticated API calls ke liye
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/accounts/register/', userData);
      if (response.data.status === 201) {
        return { success: true, message: 'Registration successful' };
      }
      // Backend validation errors (like duplicate email/username)
      if (response.data.errors) {
        const firstError = Object.values(response.data.errors)[0];
        const errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        return { success: false, message: errorMsg };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      // Handle 400 errors with validation details
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        const errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        return { success: false, message: errorMsg };
      }
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const checkAuth = async () => {
    try {
      // Backend endpoint needed: GET /accounts/me/
      const response = await axiosInstance.get('/accounts/me/');
      if (response.data.status === 200) {
        setUser(response.data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
