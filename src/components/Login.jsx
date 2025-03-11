// src/components/Login.jsx
import { useState } from 'react'
import '../styles/Login.css'
import { signInWithGoogle } from './GoogleSignIn'

function Login() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Email submitted:', email)
    // Add your login logic here
  }

  return (
    <div className="login-container">
      <div className="login-panel">
        <div className="login-content">
          <h1>Welcome back!</h1>
          <p>Sign in to your account</p>
          
          <div className="social-logins">
            <button className="social-button google" onClick={signInWithGoogle}>
              <img src="/google-icon.svg" alt="Google" />
              Sign in with Google
            </button>
            
            <button className="social-button github">
              <img src="/github-icon.svg" alt="GitHub" />
              Sign in with GitHub
            </button>
          </div>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="continue-button">Continue</button>
          </form>
        </div>
      </div>
      <div className="dashboard-preview">
        {/* Dashboard preview content - optional */}
      </div>
    </div>
  )
}

export default Login
