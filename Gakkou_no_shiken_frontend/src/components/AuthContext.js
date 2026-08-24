'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUser, getAuthToken, clearAuthTokens, getMe } from '@/lib/api';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check from localStorage
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    // Validate with backend only if token exists
    getMe()
      .then(res => {
        if (res?.user) {
          setUser(res.user);
          localStorage.setItem('user_info', JSON.stringify(res.user));
        }
      })
      .catch(() => {
        // If token invalid, clear
        clearAuthTokens();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    clearAuthTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login: handleLogin,
        logout: handleLogout,
        refreshUser: () => getMe().then(res => setUser(res.user)),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
