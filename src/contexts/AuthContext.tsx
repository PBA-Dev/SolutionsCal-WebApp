import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdmin');
    if (storedAuth) {
      try {
        setIsAdmin(JSON.parse(storedAuth));
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('isAdmin');
      }
    }
  }, []);

  const login = (username: string, password: string) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      console.error('Admin password not configured in environment');
      alert('System configuration error: Please contact administrator');
      return;
    }

    if (username.trim() === '') {
      alert('Username is required');
      return;
    }

    if (password.trim() === '') {
      alert('Password is required');
      return;
    }

    if (username === 'admin' && password === adminPassword) {
      setIsAdmin(true);
      try {
        localStorage.setItem('isAdmin', JSON.stringify(true));
      } catch (error) {
        console.error('Error storing auth state:', error);
      }
    } else {
      alert('Invalid credentials');
    }
  };

  const logout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem('isAdmin');
    } catch (error) {
      console.error('Error removing auth state:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
