import React, { useState } from 'react'
import './App.css'
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../baseUrl';
import { useUserContext } from './context/userContext';


function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const {login, logout} = useUserContext()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${baseUrl}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // if your backend sets cookies
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      })

      if (!response.ok) {
        logout()
        throw new Error('Login failed')
      }
      
      const data = await response.json();
      login(data?.data)
      
      navigate('/')
      
      
    } catch (err) {
      logout()
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        
        <h2>Welcome to ChatApp</h2>
        
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="error">{error}</p>}
       <p style={{ textAlign: 'center', marginTop: '10px' }}>
      Don't have an account?{' '}
      <span
        style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
        onClick={() => navigate('/register')}
      >
        Register here
      </span>
    </p>
      </form>
      
    </div>
  )
}

export default Login
