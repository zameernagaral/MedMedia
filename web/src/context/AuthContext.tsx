import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5001/api'
  : '/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Validate session server-side via httpOnly cookie
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            const safeUser = {
              ...data.user,
              stats: data.user.stats || { postsCount: 0, followersCount: 0, followingCount: 0 }
            };
            setUser(safeUser);
            localStorage.removeItem('medmedia_current_user');
            setLoading(false);
            return;
          }
        }
      } catch {
        localStorage.removeItem('medmedia_current_user');
      }

      setUser(null);
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (token: string, userData: UserProfile) => {
    const safeUser = {
      ...userData,
      stats: userData.stats || { postsCount: 0, followersCount: 0, followingCount: 0 }
    };
    setUser(safeUser);
    localStorage.removeItem('medmedia_current_user');
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('[AuthContext] Logout error:', e);
    }
    setUser(null);
    localStorage.removeItem('medmedia_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};


