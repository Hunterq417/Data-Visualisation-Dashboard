import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../services/api'

export default function Signup({ setTheme }){
  const nav = useNavigate()
  const location = useLocation()
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const authed = localStorage.getItem('auth') === '1'
    if (authed) {
      nav('/', { replace: true })
    }
  }, [])

  const onSubmit = async (e)=>{
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')
    const name = formData.get('name')

    try {
      await api.register(email, password, name)
      localStorage.setItem('auth','1')
      nav('/')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-shell">
        <aside className="auth-aside">
          <div className="brand large">
            <div className="logo">V</div>
            <span className="brand-name">QUEEN</span>
          </div>
          <h1>Create Account</h1>
          <p className="muted">Join QUEEN Analytics to start exploring data insights and tracking performance metrics.</p>
          <div className="hero-visual big">
            <div className="blob"></div>
          </div>
        </aside>
        <main className="auth-main">
          <div className="auth-card card">
            <div className="auth-header">
              <h2>Create Your Account</h2>
              <p className="auth-subtitle">Sign up to access powerful analytics tools</p>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form className="form" onSubmit={onSubmit}>
              <label>Full Name
                <input 
                  name="name" 
                  type="text" 
                  placeholder="John Doe" 
                  autoComplete="name"
                  required 
                />
              </label>
              <label>Email Address
                <input 
                  name="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  autoComplete="email"
                  required 
                />
              </label>
              <label>Password
                <div className="password-field">
                  <input 
                    name="password" 
                    type={show? 'text':'password'} 
                    placeholder="Create a strong password" 
                    autoComplete="new-password"
                    required 
                  />
                  <button className="icon-btn password-toggle" type="button" onClick={()=>setShow(s=>!s)} aria-label="Toggle password visibility">
                    {show ? '👁️' : '👁'}
                  </button>
                </div>
              </label>
              <button className="btn primary w-full login-btn" type="submit" disabled={loading}>
                {loading ? (
                  <span className="btn-content">
                    <span className="spinner-small"></span>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>
            
            <p className="auth-footer-text">Already have an account? <a href="/login" className="link">Sign In</a></p>
          </div>
          <div className="auth-footer">
            <button className="icon-btn" onClick={()=>setTheme(document.documentElement.classList.contains('light')? 'dark':'light')}>☾</button>
          </div>
        </main>
      </div>
    </div>
  )
}