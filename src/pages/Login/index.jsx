import React, { useState } from 'react';
import styles from './Login.module.css';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt with:', { email, password });
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.logo}>X</div>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'login' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'signup' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.formTitle}>
            {activeTab === 'login' ? 'Sign in' : 'Create account'}
          </h2>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {activeTab === 'login' && (
            <a href="#forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </a>
          )}
          
          <button type="submit" className={styles.loginButton}>
            {activeTab === 'login' ? 'Sign in' : 'Create account'}
          </button>
          
          <div className={styles.divider}>
            <span>or</span>
          </div>
          
          <button type="button" className={styles.googleButton}>
            <span className={styles.googleIcon}>G</span>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;