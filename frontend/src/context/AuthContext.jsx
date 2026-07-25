import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aws_chat_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('aws_chat_token'));
  const [loading, setLoading] = useState(true);
  const [awsProfile, setAwsProfile] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('aws_chat_user', JSON.stringify(res.data.user));
      setAwsProfile(res.data.user.awsProfile || null);
    } catch (err) {
      console.error('Failed to fetch user me profile', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: jwtToken, user: userData } = res.data;

    localStorage.setItem('aws_chat_token', jwtToken);
    localStorage.setItem('aws_chat_user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    await fetchCurrentUser();
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: jwtToken, user: userData } = res.data;

    localStorage.setItem('aws_chat_token', jwtToken);
    localStorage.setItem('aws_chat_user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    await fetchCurrentUser();
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('aws_chat_token');
    localStorage.removeItem('aws_chat_user');
    setToken(null);
    setUser(null);
    setAwsProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/aws-profile');
      setAwsProfile(res.data.profile);
    } catch (err) {
      setAwsProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        awsProfile,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
