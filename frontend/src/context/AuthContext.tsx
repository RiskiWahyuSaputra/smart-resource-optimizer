'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(storedToken);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get('/user');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
