import React, { useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'

const LoginContainer = styled.div<{ $isVisible: boolean }>`
  margin-top: 20px;
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #3a3a3a;
  max-height: ${props => props.$isVisible ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  opacity: ${props => props.$isVisible ? '1' : '0'};
  transition: opacity 0.3s ease-in-out;
`

const ToggleButton = styled.button`
  width: 100%;
  background-color: #2c2c2c;
  color: #ffffff;
  border: none;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  &:hover {
    background-color: #3c3c3c;
  }
`

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(username, password)
  }

  return (
    <div>
      <ToggleButton onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'Hide Login' : 'Show Login'}
      </ToggleButton>
      <LoginContainer $isVisible={isVisible}>
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
    </div>
  )
}

export default LoginForm
