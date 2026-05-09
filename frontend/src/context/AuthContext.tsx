'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import Cookies from 'js-cookie';

interface UserProfile {
  name?: string;
  address?: string;
  verification_status?: string;
  document_url?: string | null;
  store_image_url?: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  profile?: UserProfile | null;
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
    const restoreAuth = async () => {
      const storedToken = localStorage.getItem('token') || Cookies.get('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      if (!Cookies.get('token')) {
        Cookies.set('token', storedToken, { expires: 7, sameSite: 'lax' });
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem('user');
        }
      }

      try {
        const response = await axios.get('/user');
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Cookies.remove('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void restoreAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    Cookies.set('token', newToken, { expires: 7, sameSite: 'lax' });
    setToken(newToken);
    setUser(newUser);
    router.push('/dashboard');
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    Cookies.remove('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get('/user');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch {
      logout();
    }
  }, [logout]);

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
