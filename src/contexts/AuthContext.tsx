import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
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
    // Try multiple ways to access the environment variable
    const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    
    console.log('Environment check:');
    console.log('- Environment mode:', import.meta.env.MODE);
    console.log('- Password configured:', !!adminPassword);
    
    if (!adminPassword) {
      console.error('Admin password not configured');
      alert('System configuration error');
      return;
    }

    if (username === 'admin' && password === adminPassword) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', JSON.stringify(true));
    } else {
      alert('Invalid credentials');
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setIsAdmin(false);
    try {
      localStorage.removeItem('isAdmin');
    } catch (error) {
      console.error('Error removing auth state:', error);
    }
  };

  const contextValue: AuthContextType = {
    isAdmin,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
