import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('invoxaflow_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('invoxaflow_token') || null);
  const [loading, setLoading] = useState(true);

  const saveAuth = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('invoxaflow_user', JSON.stringify(userData));
    localStorage.setItem('invoxaflow_token', tokenValue);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('invoxaflow_user');
    localStorage.removeItem('invoxaflow_token');
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    saveAuth(res.data.user, res.data.token);
    return res.data;
  };

  const login = async (data) => {
    const res = await authAPI.login(data);
    saveAuth(res.data.user, res.data.token);
    return res.data;
  };

  const logout = () => {
    clearAuth();
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getMe();
      const updated = res.data.user;
      setUser(updated);
      localStorage.setItem('invoxaflow_user', JSON.stringify(updated));
      return updated;
    } catch {
      clearAuth();
    }
  }, []);

  const updateUserData = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('invoxaflow_user', JSON.stringify(updated));
  };

  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          await refreshUser();
        } catch {
          clearAuth();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      register,
      login,
      logout,
      refreshUser,
      updateUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
