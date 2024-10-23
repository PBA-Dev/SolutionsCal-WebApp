import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean
  login: (username: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdmin')
    if (storedAuth) {
      setIsAdmin(JSON.parse(storedAuth))
    }
  }, [])

  const login = (username: string, password: string) => {
    // Check against environment variable ADMIN_PASSWORD
    if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
      setIsAdmin(true)
      localStorage.setItem('isAdmin', JSON.stringify(true))
    } else {
      alert('Invalid credentials')
    }
  }

  const logout = () => {
    setIsAdmin(false)
    localStorage.removeItem('isAdmin')
  }

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
