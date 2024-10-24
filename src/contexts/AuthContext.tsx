import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const MAX_LOGIN_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 300000; // 5 minutes in milliseconds

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdmin');
    const lastLoginTime = localStorage.getItem('lastLoginTime');
    const storedAttempts = localStorage.getItem('loginAttempts');

    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }

    if (storedAuth) {
      try {
        const isAdminValue = JSON.parse(storedAuth);
        const lastLogin = lastLoginTime ? parseInt(lastLoginTime) : 0;
        const timeDiff = Date.now() - lastLogin;

        // Only restore admin status if within 24 hours
        if (isAdminValue && timeDiff < 24 * 60 * 60 * 1000) {
          setIsAdmin(true);
        } else {
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('lastLoginTime');
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('isAdmin');
      }
    }
  }, []);

  const isLockedOut = () => {
    const lastAttemptTime = parseInt(localStorage.getItem('lastAttemptTime') || '0');
    const timeSinceLastAttempt = Date.now() - lastAttemptTime;
    return loginAttempts >= MAX_LOGIN_ATTEMPTS && timeSinceLastAttempt < LOCKOUT_DURATION;
  };

  const resetLoginAttempts = () => {
    setLoginAttempts(0);
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lastAttemptTime');
  };

  const login = (username: string, password: string) => {
    if (isLockedOut()) {
      const remainingTime = Math.ceil((LOCKOUT_DURATION - (Date.now() - parseInt(localStorage.getItem('lastAttemptTime') || '0'))) / 60000);
      alert(`Too many failed attempts. Please try again in ${remainingTime} minutes.`);
      return;
    }

    const adminPassword = import.meta.env.ADMIN_PASSWORD;
    
    // Use the fallback mechanism only in production
    const isProduction = import.meta.env.MODE === 'production';
    const fallbackPassword = localStorage.getItem('fallbackPassword');
    
    const isValidPassword = password === adminPassword || (isProduction && fallbackPassword && password === fallbackPassword);

    if (username === 'admin' && isValidPassword) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', JSON.stringify(true));
      localStorage.setItem('lastLoginTime', Date.now().toString());
      
      // If using fallback password in production, store it as a recovery option
      if (isProduction && !adminPassword && !fallbackPassword) {
        localStorage.setItem('fallbackPassword', password);
      }
      
      resetLoginAttempts();
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());
      localStorage.setItem('lastAttemptTime', Date.now().toString());

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        alert('Too many failed attempts. Please try again in 5 minutes.');
      } else {
        alert(`Invalid credentials. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    }
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    const adminPassword = import.meta.env.ADMIN_PASSWORD;
    const isProduction = import.meta.env.MODE === 'production';
    const fallbackPassword = localStorage.getItem('fallbackPassword');

    // Verify current password matches either env variable or fallback
    const isValidCurrentPassword = currentPassword === adminPassword || 
      (isProduction && fallbackPassword && currentPassword === fallbackPassword);

    if (!isValidCurrentPassword) {
      alert('Current password is incorrect');
      return false;
    }

    // In production, update the fallback password
    if (isProduction) {
      localStorage.setItem('fallbackPassword', newPassword);
      alert('Password changed successfully');
      return true;
    }

    alert('Password cannot be changed in development mode');
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('lastLoginTime');
    // Don't remove fallbackPassword on logout to maintain recovery option
  };

  const contextValue: AuthContextType = {
    isAdmin,
    login,
    logout,
    changePassword
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
