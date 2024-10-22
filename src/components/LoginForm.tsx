import React, { useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'

const LoginContainer = styled.div`
  margin-top: 20px;
  background-color: #1e1e1e; // Darker background
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #3a3a3a; // Visible border
`

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(username, password)
  }

  return (
    <LoginContainer>
      <form onSubmit={handleSubmit}>
        <h3 className="mb-3">Admin Login</h3>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username:</label>
          <input
            type="text"
            className="form-control bg-dark text-light"
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password"
            className="form-control bg-dark text-light"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </LoginContainer>
  )
}

export default LoginForm
