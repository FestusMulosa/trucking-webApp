import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = () => {
  const { currentUser, setCurrentUser, loading, setToken } = useAuth();

  // Log authentication state for debugging
  useEffect(() => {
    console.log('PrivateRoute - Auth State:', { currentUser, loading });
  }, [currentUser, loading]);

  // Check if user exists in localStorage and sync with context if needed
  useEffect(() => {
    if (!currentUser) {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          console.log('Found user in localStorage, syncing with context');
          setCurrentUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error syncing from localStorage:', error);
      }
    }
  }, [currentUser, setCurrentUser, setToken]);

  // Check if user exists in localStorage as a fallback
  const checkLocalStorage = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      return !!(storedUser && storedToken);
    } catch (error) {
      console.error('Error checking localStorage:', error);
      return false;
    }
  };

  // If still loading, show nothing or a loading spinner
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If not authenticated, check localStorage as a fallback
  if (!currentUser && !checkLocalStorage()) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default PrivateRoute;
