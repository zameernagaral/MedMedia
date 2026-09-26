import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserProfile } from '../types';

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
        const savedUser = localStorage.getItem('medmedia_current_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = (token: string, userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem('medmedia_current_user', JSON.stringify(userData));
    // We don't store token in localStorage because it's in httpOnly cookie!
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5001/api/auth/logout', {}, { withCredentials: true });
    } catch (e) {
      console.error(e);
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
