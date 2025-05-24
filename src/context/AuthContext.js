import React, { createContext, useState, useContext, useEffect } from 'react';
import apiCache from '../utils/apiCache';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setToken(storedToken);
        console.log('User loaded from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      // Use the API URL from environment variables if available, otherwise use the production server
      const apiUrl = process.env.REACT_APP_API_URL || 'https://trucking-server.onrender.com';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save user and token to state and localStorage
      console.log('Login successful, received token:', data.token ? 'Token received' : 'No token received');
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear user and token from state and localStorage
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Clear all cached API data to prevent data leakage between users
    apiCache.clearAll();
    console.log('User logged out and all cache cleared');
  };

  // Register function
  const register = async (userData) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://trucking-server.onrender.com';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save user and token to state and localStorage
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Get user profile
  const getProfile = async () => {
    try {
      if (!token) {
        throw new Error('No authentication token');
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'https://trucking-server.onrender.com';
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile');
      }

      // Update user in state and localStorage
      setCurrentUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      console.error('Get profile error:', error);
      // If token is invalid, logout the user
      if (error.message === 'Invalid token' || error.message === 'Token expired') {
        logout();
      }
      throw error;
    }
  };

  // Value object to be provided by the context
  const value = {
    currentUser,
    setCurrentUser,
    token,
    setToken,
    loading,
    login,
    logout,
    register,
    getProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
