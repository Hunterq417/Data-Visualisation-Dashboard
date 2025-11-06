import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../services/api'

export default function Login({ setTheme }){
  const nav = useNavigate()
  const location = useLocation()
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.getMe()
        if (data && data.user) {
          localStorage.setItem('auth', '1')
          nav('/', { replace: true })
        }
      } catch (err) {
        const authed = localStorage.getItem('auth') === '1'
        if (authed) {
          nav('/', { replace: true })
        }
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  const onSubmit = async (e)=>{
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      await api.login(email, password)
      localStorage.setItem('auth','1')
      nav('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = api.getGoogleAuthUrl()
  }

  if (checkingAuth) {
    return (
      <div className="auth" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p className="muted" style={{ marginTop: '12px' }}>Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth">
      <div className="auth-shell">
        <aside className="auth-aside">
          <div className="brand large">
            <div className="logo">V</div>
            <span className="brand-name">QUEEN</span>
          </div>
          <h1>Welcome back</h1>
          <p className="muted">Sign in to your dashboard to continue tracking analytics and performance.</p>
          <div className="hero-visual big">
            <div className="blob"></div>
          </div>
        </aside>
        <main className="auth-main">
          <div className="auth-card card">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p className="auth-subtitle">Sign in to access your dashboard</p>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <form className="form" onSubmit={onSubmit}>
              <label>Email or Username
                <input 
                  name="email" 
                  type="text" 
                  placeholder="admin" 
                  autoComplete="username"
                  required 
                />
              </label>
              <label>Password
                <div className="password-field">
                  <input 
                    name="password" 
                    type={show? 'text':'password'} 
                    placeholder="admin" 
                    autoComplete="current-password"
                    required 
                  />
                  <button className="icon-btn password-toggle" type="button" onClick={()=>setShow(s=>!s)} aria-label="Toggle password visibility">
                    {show ? '👁️' : '👁'}
                  </button>
                </div>
              </label>
              <div className="form-row">
                <label className="checkbox"><input type="checkbox" defaultChecked/> Remember me</label>
                <a href="#" className="link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>
              <button className="btn primary w-full login-btn" type="submit" disabled={loading}>
                {loading ? (
                  <span className="btn-content">
                    <span className="spinner-small"></span>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
            
            <div className="demo-hint">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
              </svg>
              <span>Demo credentials: <strong>admin</strong> / <strong>admin</strong></span>
            </div>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <button className="btn google-btn w-full" type="button" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            
            <p className="auth-footer-text">Don't have an account? <a href="/signup" className="link">Create one</a></p>
          </div>
          <div className="auth-footer">
            <button className="icon-btn" onClick={()=>setTheme(document.documentElement.classList.contains('light')? 'dark':'light')}>☾</button>
          </div>
        </main>
      </div>
    </div>
  )
}
