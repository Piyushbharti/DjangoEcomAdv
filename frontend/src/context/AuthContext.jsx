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

  // App load hote hi check karo - user logged in hai ya nahi
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Token hai toh user info fetch karo
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // GET /accounts/get-user/ - logged in user ki info
  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/accounts/get-user/');
      if (response.data.status === 200) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      // Token expired ya invalid → logout
      console.error('Auth check failed:', error);
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  // POST /accounts/login/
  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/accounts/login/', {
        email,
        password,
      });

      // Backend bhejta hai: { status, tokens: { access, refresh }, user }
      if (response.data.status === 200) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or password',
      };
    }
  };

  // POST /accounts/register/
  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/accounts/register/', userData);

      if (response.data.status === 201) {
        // Register ke baad tokens save karo
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, message: 'Account created!' };
      }

      // Validation errors
      if (response.data.errors) {
        const firstError = Object.values(response.data.errors)[0];
        const errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        return { success: false, message: errorMsg };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        const errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        return { success: false, message: errorMsg };
      }
      return { success: false, message: 'Registration failed' };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
