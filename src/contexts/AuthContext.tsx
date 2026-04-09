/**
 * AuthContext.tsx — Contexto de autenticação simples
 * Login com credenciais fixas: admin / admin
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('iot_auth');
    if (stored === 'true') setIsAuthenticated(true);
  }, []);

  const login = (user: string, password: string): boolean => {
    if (user === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem('iot_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('iot_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
